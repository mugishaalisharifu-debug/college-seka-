"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, Search, X } from "lucide-react";
import Logo from "@/components/marketing/comp/school-logo.png";
import { ROLE_NAV_CONFIG } from "@/exports";
import { useAuthStore } from "@/lib/auth-store";

interface Notification {
  id: string;
  title: string;
  detail: string;
  time: string;
}

export default function TopBar() {
  const pathname = usePathname();
  const currentRole = pathname ? pathname.split("/")[2] || "Staff" : "Staff";
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  const displayName = user?.name || "Staff";
  const displayRole = user?.role || "Staff";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "ST";

  const navItems = useMemo(
    () => ROLE_NAV_CONFIG[currentRole] ?? [],
    [currentRole],
  );
  const searchResults = searchQuery.trim()
    ? navItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : [];
  const unreadCount = 0;

  return (
    <header className="h-16 backdrop-blur-md border-b border-amber-900/10 dark:border-zinc-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">

      {/* School Logo & Branding */}
      <Link href="/" className="inline-flex items-center gap-3 group">
        <div className="w-10 h-10 overflow-hidden rounded-xl shadow-xs border border-amber-900/10 bg-white flex items-center justify-center">
          <Image
            src={Logo}
            alt="College fondation Logo"
            width={40}
            height={40}
            priority
            className="object-contain transition-transform"
          />
        </div>
        <div className="text-left leading-none hidden sm:block">
          <p className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-white">
            College fondation
          </p>
          <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mt-0.5">
            Sina Gerard
          </p>
        </div>
      </Link>

      {/* Role Badge & Actions */}
      <div className="flex items-center gap-3 md:gap-4">

        {/* Active Role Indicator */}
        <div className="px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] uppercase tracking-wider">
          {displayRole.replace("-", " ")}
        </div>

        {/* Quick Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 lg:w-64 pl-9 pr-8 py-1.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {searchQuery.trim() && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-amber-900/10 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl p-2 z-40">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSearchQuery("")}
                    className="block px-3 py-2 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  >
                    {item.label}
                  </Link>
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-zinc-500">
                  No matching section in this dashboard.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="Notifications"
            className="p-2 rounded-xl bg-amber-900/5 dark:bg-zinc-800/60 hover:bg-amber-900/10 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-amber-900/10 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl p-3 z-40 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Notifications ({unreadCount} unread)
                </p>
              </div>
              <div className="text-center py-6 text-zinc-400 text-xs">
                No notifications yet.
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-amber-900/10 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {initials}
          </div>
          <div className="hidden lg:block text-left text-xs leading-none">
            <p className="font-semibold text-zinc-900 dark:text-white">{displayName}</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Logged In</p>
          </div>
        </div>

      </div>
    </header>
  );
}
