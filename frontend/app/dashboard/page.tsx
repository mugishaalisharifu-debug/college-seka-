"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  GraduationCap,
  Receipt,
  CreditCard,
  Package,
  Warehouse,
  ArrowUpRight,
  Users,
  BookOpen,
  TrendingUp,
  Wallet,
  School,
} from "lucide-react";

// Role gateway config — each role ONLY accesses its own module
const ROLE_GATEWAYS = [
  {
    key: "administrator",
    label: "System Administrator",
    description: "Full platform control — users, content, gallery, downloads, reports & announcements.",
    href: "/dashboard/administrator",
    icon: ShieldCheck,
    accent: "emerald",
    modules: 5,
    kpi: "24 Published News",
  },
  {
    key: "headmaster-primary",
    label: "Primary Headmaster",
    description: "Manage primary student admissions, classes, requirements, and reports.",
    href: "/dashboard/headmaster-primary",
    icon: School,
    accent: "sky",
    modules: 4,
    kpi: "240 Primary",
  },
  {
    key: "headmaster-secondary-tvet",
    label: "Secondary & TVET Headmaster",
    description: "Overall oversight of Secondary and TVET — DOS reports, finances, inventory and consolidated reporting.",
    href: "/dashboard/headmaster-secondary-tvet",
    icon: School,
    accent: "sky",
    modules: 6,
    kpi: "349 Students",
  },
  {
    key: "dos-secondary",
    label: "DOS Lower Secondary",
    description: "Upload and manage lower secondary student lists, classes, and reports.",
    href: "/dashboard/dos-secondary",
    icon: GraduationCap,
    accent: "blue",
    modules: 5,
    kpi: "S1-S3 Students",
  },
  {
    key: "dos-tvet",
    label: "DOS TVET",
    description: "Upload TVET student lists, manage trade classes, and review extra requirements.",
    href: "/dashboard/dos-tvet",
    icon: GraduationCap,
    accent: "blue",
    modules: 5,
    kpi: "TVET Students",
  },
  {
    key: "store-manager",
    label: "Store Manager",
    description: "Store oversight — collect items, manage usage, track stock and produce inventory reports.",
    href: "/dashboard/store-manager",
    icon: Warehouse,
    accent: "violet",
    modules: 4,
    kpi: "15 Stock Items",
  },
  {
    key: "bursar",
    label: "School Bursar",
    description: "Finance — fee structure, student ledgers, payments, receipts and cash flow.",
    href: "/dashboard/bursar",
    icon: Receipt,
    accent: "amber",
    modules: 4,
    kpi: "87.2M RWF",
  },
  {
    key: "cashier",
    label: "Cashier",
    description: "Store & kitchen — stock in, stock out, spoilage and daily reports.",
    href: "/dashboard/cashier",
    icon: CreditCard,
    accent: "violet",
    modules: 5,
    kpi: "6 Stock Items",
  },
  {
    key: "requirement-collector",
    label: "Requirement Collector",
    description: "Enrollment support — student checklist verification and school supplies distribution.",
    href: "/dashboard/requirement-collector",
    icon: Package,
    accent: "teal",
    modules: 3,
    kpi: "12 Pending Checks",
  },
] as const;

const ACCENT_STYLES: Record<string, { badge: string; iconBg: string; arrow: string; hover: string }> = {
  emerald: {
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    iconBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    arrow: "group-hover:text-emerald-700 dark:group-hover:text-emerald-400",
    hover: "hover:border-emerald-600/60 dark:hover:border-emerald-500/60",
  },
  sky: {
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300",
    iconBg: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
    arrow: "group-hover:text-sky-700 dark:group-hover:text-sky-400",
    hover: "hover:border-sky-600/60 dark:hover:border-sky-500/60",
  },
  blue: {
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
    iconBg: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    arrow: "group-hover:text-blue-700 dark:group-hover:text-blue-400",
    hover: "hover:border-blue-600/60 dark:hover:border-blue-500/60",
  },
  rose: {
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300",
    iconBg: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
    arrow: "group-hover:text-rose-700 dark:group-hover:text-rose-400",
    hover: "hover:border-rose-600/60 dark:hover:border-rose-500/60",
  },
  amber: {
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    iconBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    arrow: "group-hover:text-amber-700 dark:group-hover:text-amber-400",
    hover: "hover:border-amber-600/60 dark:hover:border-amber-500/60",
  },
  violet: {
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300",
    iconBg: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
    arrow: "group-hover:text-violet-700 dark:group-hover:text-violet-400",
    hover: "hover:border-violet-600/60 dark:hover:border-violet-500/60",
  },
  teal: {
    badge: "bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300",
    iconBg: "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400",
    arrow: "group-hover:text-teal-700 dark:group-hover:text-teal-400",
    hover: "hover:border-teal-600/60 dark:hover:border-teal-500/60",
  },
};

const SCHOOL_WIDE_KPIS = [
  { label: "Total Students", value: "1,250+", icon: Users, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
  { label: "Teaching Staff", value: "68", icon: BookOpen, color: "text-sky-700 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/50" },
  { label: "Term Collection", value: "87.2M RWF", icon: TrendingUp, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50" },
  { label: "Budget Target", value: "103.9M RWF", icon: Wallet, color: "text-teal-700 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/50" },
];

export default function CentralCommandDashboard() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              Staff Portal — Central Command
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              School Management Overview
            </h1>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
              Select your department below to access your dedicated module. Each role is
              scoped to its own responsibilities only — from academic administration to
              finance and school stores.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 px-4 py-2.5 rounded-2xl shrink-0">
            <School className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <div className="text-left text-xs">
              <p className="font-bold text-emerald-900 dark:text-emerald-300">Academic Year 2026/2027</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Term 1 — In Session</p>
            </div>
          </div>
        </div>
      </div>

      {/* School-wide KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {SCHOOL_WIDE_KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <div className={`w-fit p-2 rounded-xl ${kpi.bg}`}>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="mt-3 text-xl font-bold font-mono text-zinc-900 dark:text-white">{kpi.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5">
                {kpi.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Role Gateway Cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
            Staff Role Gateways
          </h2>
          <span className="text-[11px] text-zinc-400 font-medium">7 departments — access controlled by role</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {ROLE_GATEWAYS.map((role) => {
            const Icon = role.icon;
            const accent = ACCENT_STYLES[role.accent];

            return (
              <Link
                key={role.key}
                href={role.href}
                className={`group relative rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs transition-all ${accent.hover} hover:shadow-md flex flex-col justify-between min-h-[180px]`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-2xl ${accent.iconBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className={`w-4 h-4 text-zinc-300 dark:text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${accent.arrow}`} />
                </div>

                <div className="mt-4 space-y-1">
                  <h3 className="font-sans font-bold text-base text-zinc-900 dark:text-white">
                    {role.label}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                    {role.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-900/10 dark:border-zinc-800 flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${accent.badge}`}>
                    {role.modules} Modules
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    {role.kpi}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Access Strip */}
      <div className="rounded-3xl border border-emerald-900/20 dark:border-emerald-800/40 bg-emerald-900 text-white p-6 md:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-lg">Consolidated Institutional Reporting</h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed max-w-xl">
              The Secondary &amp; TVET Headmaster module provides single-pane oversight of Secondary and TVET —
              student census, fee collection, store balances, and exportable reports.
            </p>
          </div>
          <Link
            href="/dashboard/headmaster-secondary-tvet/reports"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition-all w-fit shrink-0"
          >
            <span>Open Consolidated Reports</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

