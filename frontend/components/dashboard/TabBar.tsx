"use client";

import React, { type ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavLinksForPath } from "@/exports";
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
UserCog,
  Monitor,
  Banknote,
  KeyRound,
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
  Monitor,
  Banknote,
  KeyRound,
};

export default function TabBar() {
  const pathname = usePathname();
  const currentNavLinks = getNavLinksForPath(pathname);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-md border-t border-amber-900/10 dark:border-zinc-800 px-2 py-2 flex items-center justify-around z-40 shadow-xl transition-colors">
      {currentNavLinks.slice(0, 5).map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = ICON_MAP[item.iconName] || LayoutDashboard;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive
                ? "text-emerald-700 dark:text-emerald-400 font-bold"
                : "text-zinc-500 dark:text-zinc-400 font-medium"
            }`}
          >
            <IconComponent className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}