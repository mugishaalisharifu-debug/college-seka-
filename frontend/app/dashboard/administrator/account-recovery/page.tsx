"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  KeyRound,
  UserCheck,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  User,
  Mail,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";

export interface SystemStaffAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: "Active" | "Locked" | "Suspended";
  lastPasswordChange?: string;
}

const ROLE_DISPLAY: Record<string, string> = {
  Admin: "Administrator",
  "Primary-HeadMaster": "Headmaster",
  "Secondary-HeadMaster": "Headmaster",
  "DOS-Secondary": "Director of Studies (DOS)",
  "DOS-Tvet": "Director of Studies (DOS)",
  Bursar: "Bursar",
  Cashier: "Cashier",
  "School-receptionist": "School Receptionist",
  "Store-Manager": "Store Manager",
};

const ROLES_LIST = [
  "All Roles",
  "Administrator",
  "Headmaster",
  "Director of Studies (DOS)",
  "Bursar",
  "Cashier",
  "School Receptionist",
  "Store Manager",
];

export default function AccountRecoveryPage() {
  const [accounts, setAccounts] = useState<SystemStaffAccount[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<SystemStaffAccount | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [isLoading, setIsLoading] = useState(true);

  // UI Action Loading States
  const [isResetting, setIsResetting] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Form State
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forcePasswordReset, setForcePasswordReset] = useState(true);
  const [unlockAccount, setUnlockAccount] = useState(true);
  const [newEmail, setNewEmail] = useState("");

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<
        { id: string; name: string; email: string; role: string; scope?: string }[]
      >("/auth/staff-accounts");
      const mapped: SystemStaffAccount[] = res.data.map((acc) => ({
        id: acc.id,
        name: acc.name,
        email: acc.email,
        role: ROLE_DISPLAY[acc.role] || acc.role,
        status: "Active",
      }));
      setAccounts(mapped);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load staff accounts."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let generated = "";
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
  };

  const handleSelectStaff = (staff: SystemStaffAccount) => {
    if (isResetting || isUpdatingEmail) return;
    setSelectedStaff(staff);
    setNewPassword("");
    setShowPassword(false);
    setUnlockAccount(staff.status === "Locked");
    setNewEmail(staff.email || "");
  };

  const handleSubmitReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStaff) {
      toast.error("Please select a staff member from the left panel.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsResetting(true);

    const resetTask = async () => {
      const res = await api.post("/auth/admin-reset-password", {
        userId: selectedStaff.id,
        newPassword,
        unlockAccount,
        forcePasswordReset,
      });
      return res.data;
    };

    try {
      await toast.promise(resetTask(), {
        loading: `Updating password for ${selectedStaff.name}...`,
        success: `Password updated successfully for ${selectedStaff.name}!`,
        error: (err) => getApiErrorMessage(err, "Failed to reset password."),
      });

      setSelectedStaff(null);
      setNewPassword("");
      loadAccounts();
    } catch (err) {
      console.error("Password reset error:", err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmitEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStaff) {
      toast.error("Please select a staff member from the left panel.");
      return;
    }

    if (!newEmail || !newEmail.trim()) {
      toast.error("Email address is required.");
      return;
    }

    setIsUpdatingEmail(true);

    const emailUpdateTask = async () => {
      const res = await api.patch("/auth/admin-update-email", {
        userId: selectedStaff.id,
        email: newEmail.trim(),
      });
      return res.data;
    };

    try {
      await toast.promise(emailUpdateTask(), {
        loading: `Updating email for ${selectedStaff.name}...`,
        success: `Email updated successfully for ${selectedStaff.name}!`,
        error: (err) => getApiErrorMessage(err, "Failed to update email."),
      });

      loadAccounts();
    } catch (err) {
      console.error("Email update error:", err);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchesRole =
      roleFilter === "All Roles" || acc.role === roleFilter;
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-amber-900/10 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-100 p-3.5 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Security &amp; Access Management
              </span>
              <h1 className="font-serif text-2xl font-bold text-zinc-900 dark:text-white">
                Staff Account Recovery &amp; Password Reset
              </h1>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
            System Accounts Only (6 Roles)
          </div>
        </div>
      </div>

      {/* Main Grid: Staff List vs Password Reset Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Staff Selection Table / List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Search & Role Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search staff member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              {ROLES_LIST.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Accounts Cards List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-zinc-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
              <span className="text-xs font-bold">Loading staff accounts...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAccounts.map((account) => {
                const isSelected = selectedStaff?.id === account.id;

                return (
                  <div
                    key={account.id}
                    onClick={() => handleSelectStaff(account)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-500 shadow-xs"
                        : "border-amber-900/10 bg-white hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900"
                    } ${isResetting ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-zinc-100 p-2.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 shrink-0">
                          <User className="h-5 w-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                              {account.name}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                account.status === "Active"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-400"
                              }`}
                            >
                              {account.status}
                            </span>
                          </div>

                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                            {account.role}
                          </p>

                          <p className="text-[11px] text-zinc-500 mt-1">
                            {account.email} {account.phone ? `• ${account.phone}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block">Status</span>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          Ready for Reset
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredAccounts.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-amber-900/10 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500">No staff account matches your query.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Password Reset Form (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 rounded-3xl border border-amber-900/10 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
            <div className="border-b border-amber-900/10 pb-4 dark:border-zinc-800">
              <h2 className="font-serif text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-700" />
                Reset Account Credentials
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Select a staff member from the left to update their password.
              </p>
            </div>

            {selectedStaff ? (
              <form onSubmit={handleSubmitReset} className="space-y-4 text-xs">
                {/* Selected Staff Info Summary */}
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-3.5 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {selectedStaff.name}
                    </span>
                    <span className="text-[10px] font-mono bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-zinc-700">
                      {selectedStaff.id}
                    </span>
                  </div>
                  <p className="text-emerald-800 dark:text-emerald-400 font-semibold">
                    {selectedStaff.role}
                  </p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    {selectedStaff.email}
                  </p>
                </div>

                {/* New Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">
                      New Password (Min 6 chars) *
                    </label>
                    <button
                      type="button"
                      disabled={isResetting}
                      onClick={generateRandomPassword}
                      className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className="w-3 h-3" /> Auto-Generate
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={isResetting}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 font-mono text-xs focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-white pr-10 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      disabled={isResetting}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Additional Checkboxes */}
                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300 font-medium">
                    <input
                      type="checkbox"
                      disabled={isResetting}
                      checked={forcePasswordReset}
                      onChange={(e) => setForcePasswordReset(e.target.checked)}
                      className="rounded border-zinc-300 text-emerald-700 focus:ring-emerald-600 disabled:opacity-50"
                    />
                    Require user to change password on next login
                  </label>

                  {selectedStaff.status === "Locked" && (
                    <label className="flex items-center gap-2 cursor-pointer text-rose-700 dark:text-rose-400 font-bold">
                      <input
                        type="checkbox"
                        disabled={isResetting}
                        checked={unlockAccount}
                        onChange={(e) => setUnlockAccount(e.target.checked)}
                        className="rounded border-rose-300 text-emerald-700 focus:ring-emerald-600 disabled:opacity-50"
                      />
                      Unlock account status to Active
                    </label>
                  )}
                </div>

                {/* Form Actions */}
                <div className="pt-3 border-t border-amber-900/10 dark:border-zinc-800 flex gap-2">
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isResetting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Apply Password Update</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isResetting}
                    onClick={() => setSelectedStaff(null)}
                    className="rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-10 text-zinc-400 space-y-2">
                <UserCheck className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700" />
                <p className="text-xs font-medium">
                  No staff member selected. Click on any account from the left list to change credentials.
                </p>
              </div>
            )}

            {/* Email Update Section */}
            {selectedStaff && (
              <form onSubmit={handleSubmitEmailUpdate} className="space-y-4 text-xs border-t border-amber-900/10 dark:border-zinc-800 pt-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-bold text-zinc-900 dark:text-white">Update Email Address</h3>
                </div>

                <div>
                  <label className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300">
                    New Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isUpdatingEmail || isResetting}
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 font-medium text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingEmail || isResetting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isUpdatingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Email...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Update Email</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}