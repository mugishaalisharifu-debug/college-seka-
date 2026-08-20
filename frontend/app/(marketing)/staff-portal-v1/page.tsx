"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { ROLE_REDIRECT_MAP, StaffRole } from "@/exports";
import api from "@/lib/api";
import {
  BACKEND_ROLE_TO_STAFF_ROLE,
  useAuthStore,
} from "@/lib/auth-store";
import Logo from "@/components/marketing/comp/school-logo.png";

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export default function StaffLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      const { access_token, user } = res.data;
      useAuthStore.getState().setSession(access_token, user);

      const staffRole = BACKEND_ROLE_TO_STAFF_ROLE[user.role];
      const redirectPath = staffRole ? ROLE_REDIRECT_MAP[staffRole] : undefined;

      if (redirectPath) {
        router.push(redirectPath);
      } else {
        setErrorMessage(
          "Your role does not have a dashboard assigned yet. Please contact the Administrator.",
        );
      }
    } catch (error) {
      const message =
        axios.isAxiosError(error) &&
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Something went wrong. Please check your connection.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center transition-colors">
      <div className="w-full max-w-md">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="relative w-12 h-12 overflow-hidden rounded-xl shadow-sm border border-amber-900/10">
              <Image
                src={Logo}
                alt="College fondation Logo"
                fill
                className="object-contain transition-transform"
              />
            </div>
            <div className="text-left leading-none">
              <p className="font-semibold text-base tracking-tight text-zinc-900 dark:text-white">
                College fondation
              </p>
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mt-1">
                Sina Gerard
              </p>
            </div>
          </Link>

          <h1 className="font-sans text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
            Staff Management Portal
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
            Sign in with your institutional credentials to access your dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 p-6 md:p-8 shadow-sm">
          
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-800 dark:text-rose-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email / Username Input */}
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-2">
                Staff Email / Phone *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. dos@cfsg.rw or +250..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-amber-900/15 dark:border-zinc-700  text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300">
                  Password *
                </label>
                <a
                  href="#"
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Please contact the Administrator or IT Support to reset your password.");
                  }}
                >
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-amber-900/15 dark:border-zinc-700  text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-700/50 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Notice */}
          <div className="mt-8 pt-6 border-t border-amber-900/10 dark:border-zinc-800 flex items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>Authorized access only. All login attempts are logged.</span>
          </div>

        </div>
      </div>
    </main>
  );
}