"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
  UserX,
} from "lucide-react";
import ReportViewerModal, { ReportData } from "@/components/dashboard/ReportViewerModal";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";

interface DbStudent {
  id: string;
  studentName: string;
  educationLevel: string;
  tradeName?: string;
  classId?: string;
  status?: string;
}

interface DbClass {
  id: string;
  className: string;
  scope: string;
  tradeName?: string;
}

interface LedgerEntry {
  studentId: string;
  studentName: string;
  educationLevel: string;
  className?: string;
  currentTermFee: number;
  totalPaidHistorical: number;
  totalOutstandingDebt: number;
  isFullyPaid: boolean;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  availableQuantity: string;
}

interface Transaction {
  id: string;
  type: "STOCK_IN" | "STOCK_OUT" | "SPOILAGE";
  quantity: string;
  createdAt: string;
}

const MODULE_SHORTCUTS = [
  { href: "/dashboard/headmaster-secondary-tvet/finances", label: "Financial Oversight", desc: "Revenue, arrears, and operational cash flow", icon: DollarSign, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50" },
  { href: "/dashboard/headmaster-secondary-tvet/inventory", label: "Store Inventory", desc: "Food stock balances, spoilage, and procurement", icon: Scale, color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/50" },
  { href: "/dashboard/headmaster-secondary-tvet/reports", label: "Reports & Exports", desc: "CSV, PDF, and consolidated print-ready reports", icon: FileText, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
];

export default function HeadmasterSecondaryTvetDashboard() {
  const [activeReport, setActiveReport] = useState<ReportData | null>(null);
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [classes, setClasses] = useState<DbClass[]>([]);
  const [debtors, setDebtors] = useState<LedgerEntry[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [studentsRes, classesRes, debtorsRes, inventoryRes] = await Promise.all([
          api.get<DbStudent[]>("/dos/students"),
          api.get<DbClass[]>("/dos/classes"),
          api.get<LedgerEntry[]>("/finance/debtors"),
          api.get<InventoryItem[]>("/inventory/items"),
        ]);
        setStudents(studentsRes.data);
        setClasses(classesRes.data);
        setDebtors(debtorsRes.data);
        setInventoryItems(inventoryRes.data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const secondaryTvetStudents = students.filter(
    (s) => s.educationLevel === "LOWER SECONDARY" || s.educationLevel === "TVET"
  );
  const secondaryStudents = students.filter((s) => s.educationLevel === "LOWER SECONDARY");
  const tvetStudents = students.filter((s) => s.educationLevel === "TVET");
  const secondaryClasses = classes.filter(
    (c) => c.scope === "LOWER SECONDARY" || c.scope === "TVET"
  );
  const totalCollected = debtors.reduce((sum, d) => sum + d.totalPaidHistorical, 0);
  const totalOutstanding = debtors.reduce((sum, d) => sum + d.totalOutstandingDebt, 0);
  const lowStockItems = inventoryItems.filter(
    (item) => Number(item.availableQuantity) < 10
  ).length;

  const handleOpenReport = () => {
    setActiveReport(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-sky-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300">
        Failed to load dashboard data: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-bold uppercase tracking-wide">
            <School className="w-3.5 h-3.5" /> Overall Headmaster — Secondary & TVET
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-3">
            Secondary & TVET Command Dashboard
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
            Institutional oversight consolidating everything submitted by the DOS Secondary and DOS TVET offices: enrollment, national examination clearance, finances and store inventory.
          </p>
        </div>

        <button
          onClick={handleOpenReport}
          className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shrink-0 transition-all cursor-pointer"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Generate Consolidated Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Secondary & TVET Students
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950">
              <GraduationCap className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-xl font-extrabold font-mono text-zinc-900 dark:text-white">{secondaryTvetStudents.length}</p>
          <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" /> S1-S3, L3-L5 and short-term
          </p>
        </div>

        <div className="rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Teaching Staff
            </span>
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950">
              <Users className="w-4 h-4 text-sky-700 dark:text-sky-400" />
            </div>
          </div>
          <p className="text-xl font-extrabold font-mono text-zinc-900 dark:text-white">{secondaryClasses.length}</p>
          <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
            Secondary & TVET teaching staff
          </p>
        </div>

        <div className="rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Term Fee Collection
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950">
              <DollarSign className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-xl font-extrabold font-mono text-zinc-900 dark:text-white">
            {(totalCollected / 1000000).toFixed(1)}M
          </p>
          <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" /> RWF collected
          </p>
        </div>

        <div className="rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Outstanding Fees
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950">
              <TrendingDown className="w-4 h-4 text-rose-700 dark:text-rose-400" />
            </div>
          </div>
          <p className="text-xl font-extrabold font-mono text-zinc-900 dark:text-white">
            {(totalOutstanding / 1000000).toFixed(1)}M
          </p>
          <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
            RWF outstanding
          </p>
        </div>

        <div className="rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Store Stock Items
            </span>
            <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950">
              <Scale className="w-4 h-4 text-violet-700 dark:text-violet-400" />
            </div>
          </div>
          <p className="text-xl font-extrabold font-mono text-zinc-900 dark:text-white">{inventoryItems.length}</p>
          <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
            {lowStockItems > 0 && <AlertTriangle className="w-3 h-3 text-rose-600" />}
            {lowStockItems} items below threshold
          </p>
        </div>
        <div className="rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Active Debtors
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950">
              <UserX className="w-4 h-4 text-rose-700 dark:text-rose-400" />
            </div>
          </div>
          <p className="text-xl font-extrabold font-mono text-zinc-900 dark:text-white">{debtors.length}</p>
          <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
            With outstanding balances
          </p>
        </div>
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
                  Lower Secondary Students ({secondaryStudents.filter(s => s.educationLevel === "LOWER SECONDARY").length})
                </h3>
                <p className="text-[11px] text-zinc-500">S1, S2 and S3 academic submissions</p>
              </div>
            </div>
            <span className="text-lg font-extrabold font-mono text-zinc-900 dark:text-white">
              {secondaryStudents.filter(s => s.educationLevel === "LOWER SECONDARY").length}
            </span>
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
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5"
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
                  TVET Students ({tvetStudents.length})
                </h3>
                <p className="text-[11px] text-zinc-500">L3, L4, L5 and short-term programs</p>
              </div>
            </div>
            <span className="text-lg font-extrabold font-mono text-zinc-900 dark:text-white">
              {tvetStudents.length}
            </span>
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
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5"
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
            {["LOWER SECONDARY", "TVET"].map((level) => {
              const levelStudents = students.filter((s) => s.educationLevel === level);
              const label = level === "LOWER SECONDARY" ? "Lower Secondary (S1-S3)" : "TVET Level 3 - 5 & Short-Term";
              return (
                <div key={level} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-900 dark:text-white">{label}</span>
                    <span className="font-mono text-zinc-500">
                      {levelStudents.length} students enrolled
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-700" />
              Fee Collection Summary
            </h3>
            <Link
              href="/dashboard/bursar"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" /> Full Ledger
            </Link>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-900 dark:text-white">Total Collected</span>
                <span className="font-mono text-zinc-500 font-bold">
                  {(totalCollected / 1000000).toFixed(1)}M RWF
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-900 dark:text-white">Total Outstanding</span>
                <span className="font-mono text-rose-500 font-bold">
                  {(totalOutstanding / 1000000).toFixed(1)}M RWF
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-900 dark:text-white">Active Debtors</span>
                <span className="font-mono text-zinc-500 font-bold">
                  {debtors.length} students
                </span>
              </div>
            </div>
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
            All S3 candidates and L3 TVET applicants are checked for verified result slips and primary certificates before registration is finalized.
          </p>
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
            Monitor store collection from incoming students (hoes, toilet paper, paper reams) and daily consumption logs by department.
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{MODULE_SHORTCUTS.map((mod) => {
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
                <ArrowUpRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0" />
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
