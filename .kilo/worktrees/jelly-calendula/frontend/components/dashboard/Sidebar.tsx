"use client";

import React, { type ElementType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getNavLinksForPath } from "@/exports";
import { useAuthStore } from "@/lib/auth-store";
import {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  FileText,
  UserCheck,
  Users,
  GraduationCap,
  CalendarCheck,
  LogOut as LeaveIcon,
  ShieldAlert,
  Receipt,
  CreditCard,
  PackagePlus,
  PackageMinus,
  AlertTriangle,
  ClipboardCheck,
  Box,
  Newspaper,
  Download,
  Mail,
  LogOut,
  UserCog,
  Wrench,
  Monitor,
  Banknote,
  KeyRound,
  FileText as DocFile,
  BarChart3,
} from "lucide-react";

const ICON_MAP: Record<string, ElementType> = {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  FileText,
  UserCheck,
  Users,
  GraduationCap,
  CalendarCheck,
  LogOut: LeaveIcon,
  ShieldAlert,
  Receipt,
  CreditCard,
  PackagePlus,
  PackageMinus,
  AlertTriangle,
  ClipboardCheck,
  Box,
  Newspaper,
  Download,
  Mail,
  UserCog,
  Wrench,
  Monitor,
  Banknote,
  KeyRound,
  DocFile,
  BarChart3,
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const currentNavLinks = getNavLinksForPath(pathname);

  const handleLogout = () => {
    clearSession();
    router.push("/staff-portal-v1");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-amber-900/10 dark:border-zinc-800 p-4 shrink-0 transition-colors">
      <div className="text-[11px] font-bold uppercase text-zinc-400 dark:text-zinc-500 mb-3 px-3 tracking-wider">
        Module Navigation
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {currentNavLinks.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = ICON_MAP[item.iconName] || LayoutDashboard;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/10"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-amber-900/5 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <IconComponent className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Link */}
      <div className="pt-4 border-t border-amber-900/10 dark:border-zinc-800">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Exit System</span>
        </button>
      </div>
    </aside>
  );
}