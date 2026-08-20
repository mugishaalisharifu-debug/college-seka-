"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  School,
  Users,
  FileText,
  Boxes,
  AlertTriangle,
  GraduationCap,
  ShieldCheck,
  Eye,
  Warehouse,
  DollarSign,
  Scale,
  TrendingUp,
  TrendingDown,
  Building2,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";
import ReportViewerModal, { ReportData } from "@/components/dashboard/ReportViewerModal";
import { SCOPE_CONFIG } from "@/lib/role-scope";

const KPIS = [
  { label: "Secondary & TVET Students", value: "349", sub: "S1-S3, L3-L5 and short-term", icon: GraduationCap, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50", trend: "up" },
  { label: "Teaching Staff", value: "38", sub: "Secondary & TVET teaching staff", icon: Users, color: "text-sky-700 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/50", trend: "up" },
  { label: "Term Fee Collection", value: "87.2M", sub: "RWF collected (84% target)", icon: DollarSign, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50", trend: "up" },
  { label: "Outstanding Fees", value: "16.7M", sub: "RWF outstanding", icon: TrendingDown, color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/50", trend: "down" },
  { label: "Store Stock Items", value: "6", sub: "2 items below threshold", icon: Scale, color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/50", trend: "warning" },
];

const MODULE_SHORTCUTS = [
  { href: "/dashboard/headmaster-secondary-tvet/finances", label: "Financial Oversight", desc: "Revenue, arrears, and operational cash flow", icon: DollarSign, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50" },
  { href: "/dashboard/headmaster-secondary-tvet/inventory", label: "Store Inventory", desc: "Food stock balances, spoilage, and procurement", icon: Scale, color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/50" },
  { href: "/dashboard/headmaster-secondary-tvet/reports", label: "Reports & Exports", desc: "CSV, PDF, and consolidated print-ready reports", icon: FileText, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
];

export default function HeadmasterSecondaryTvetDashboard() {
  const [activeReport, setActiveReport] = useState<ReportData | null>(null);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-bold uppercase tracking-wide">
            <School className="w-3.5 h-3.5" /> Overall Headmaster — Secondary & TVET
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Secondary & TVET Command Dashboard
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
            Institutional oversight consolidating everything submitted by the DOS Secondary and DOS TVET
            offices: enrollment, national examination clearance, finances and store inventory.
          </p>
        </div>

      <button
        onClick={() => setActiveReport(null)}
        className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shrink-0 transition-all cursor-pointer"
      >
          <BarChart3 className="w-4 h-4" />
          <span>Generate Consolidated Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {kpi.label}
                </span>
                <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-xl font-extrabold font-mono text-zinc-900 dark:text-white">{kpi.value}</p>
              <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                {kpi.trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                {kpi.trend === "down" && <TrendingDown className="w-3 h-3 text-rose-600" />}
                {kpi.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* DOS Submissions Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  DOS Secondary — {SCOPE_CONFIG.secondary.label}
                </h3>
                <p className="text-[11px] text-zinc-500">S1, S2 and S3 academic submissions</p>
              </div>
            </div>
            <span className="text-lg font-extrabold font-mono text-zinc-900 dark:text-white">291</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveReport(null)}
              className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> View DOS Secondary Report
            </button>
            <Link
              href="/dashboard/dos-secondary/students"
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" /> Student Directory
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  DOS TVET — {SCOPE_CONFIG.tvet.label}
                </h3>
                <p className="text-[11px] text-zinc-500">L3, L4, L5 and short-term programs</p>
              </div>
            </div>
            <span className="text-lg font-extrabold font-mono text-zinc-900 dark:text-white">158</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveReport(null)}
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> View DOS TVET Report
            </button>
            <Link
              href="/dashboard/dos-tvet/students"
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" /> Student Directory
            </Link>
          </div>
        </div>
      </div>

      {/* Enrollment & Fee Collection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-700" />
              Enrollment by Department
            </h3>
          </div>

          <div className="space-y-3">
            {[
              { category: "Lower Secondary (S1-S3)", enrolled: 291, capacity: 305, pct: "95%" },
              { category: "TVET Level 3 - 5", enrolled: 140, capacity: 165, pct: "85%" },
              { category: "Short-Term Training", enrolled: 18, capacity: 30, pct: "60%" },
            ].map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-900 dark:text-white">{item.category}</span>
                  <span className="font-mono text-zinc-500">
                    {item.enrolled} / {item.capacity} ({item.pct})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-700" />
              Fee Collection Summary (Term 1 — 2026)
            </h3>
            <Link
              href="/dashboard/bursar"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" /> Full Ledger
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { category: "Lower Secondary", collected: 26800000, expected: 32400000, pct: "83%" },
              { category: "TVET Trades", collected: 23400000, expected: 28800000, pct: "81%" },
              { category: "Short-Term Training", collected: 3600000, expected: 4200000, pct: "86%" },
            ].map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-900 dark:text-white">{item.category}</span>
                  <span className="font-mono text-zinc-500 font-bold">
                    {(item.collected / 1000000).toFixed(1)}M / {(item.expected / 1000000).toFixed(1)}M RWF
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance & Store Oversight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">National Examination Clearance Monitor</h3>
              <p className="text-xs text-zinc-500">Prevents student registration rejection by NESA</p>
            </div>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            All S3 candidates and L3 TVET applicants are checked for verified result slips and primary
            certificates before registration is finalized.
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" /> 7 candidates still missing result slips
          </div>
          <Link
            href="/dashboard/dos-secondary/students"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            Review Student Exam Clearance Directory →
          </Link>
        </div>

        <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Store Inventory & Stock Usage Oversight</h3>
              <p className="text-xs text-zinc-500">Prevents school item wastage and misuse</p>
            </div>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Monitor store collection from incoming students (hoes, toilet paper, paper reams) and daily
            consumption logs by department.
          </p>
          <Link
            href="/dashboard/headmaster-secondary-tvet/inventory"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 dark:text-violet-400 hover:underline"
          >
            Inspect Store Inventory & Usage Logs →
          </Link>
        </div>
      </div>

      {/* Module Shortcuts */}
      <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-700" />
          Overall Headmaster Module Shortcuts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MODULE_SHORTCUTS.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className="group p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 hover:border-emerald-600/60 dark:hover:border-emerald-500/60 transition-all flex items-start gap-3"
              >
                <div className={`p-2.5 rounded-xl ${mod.bg}`}>
                  <Icon className={`w-5 h-5 ${mod.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-emerald-700 transition-colors">
                    {mod.label}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{mod.desc}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>

      {activeReport && (
        <ReportViewerModal report={activeReport} onClose={() => setActiveReport(null)} />
      )}
    </div>
  );
}
