"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Printer,
  Download,
  Search,
  Calendar,
  Filter,
  Banknote,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Info,
  Receipt,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";
import { loadAcademicYears } from "@/lib/academic-years";
import type { TermType } from "@/lib/fees-types";

// Backend returns education-level codes; map them to friendly labels.
const LEVEL_LABELS: Record<string, string> = {
  NURSERY: "Nursery",
  PRIMARY: "Primary",
  "LOWER SECONDARY": "Lower Secondary",
  TVET: "TVET",
};

type Category = "LOWER SECONDARY" | "TVET";

interface FeeSummaryRow {
  category: string;
  students: number;
  totalCharged: number;
  totalPaid: number;
  outstanding: number;
}

interface Transaction {
  id: string;
  receiptNo: string;
  studentName: string;
  category: string;
  amount: number;
  method: string;
  date: string;
  period: string;
}

// Response shape of GET /reports/bursar/financial
interface BursarReport {
  academicPeriod: string;
  summary: FeeSummaryRow[];
  transactions: Transaction[];
}

const FEE_SUMMARY: FeeSummaryRow[] = [];

const TRANSACTIONS: Transaction[] = [];

export default function BursarFinancialReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<"All" | Category>("All");
  const [selectedYear, setSelectedYear] = useState<string>(
    () => loadAcademicYears()[0] || "2025-2026"
  );
  const [selectedTerm, setSelectedTerm] = useState<TermType>("TERM_1");
  const [searchQuery, setSearchQuery] = useState("");
  const [feeSummary, setFeeSummary] = useState<FeeSummaryRow[]>(FEE_SUMMARY);
  const [transactions, setTransactions] = useState<Transaction[]>(TRANSACTIONS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const activePeriod = `${selectedYear} ${selectedTerm}`;

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await api.get<BursarReport>("/reports/bursar/financial", {
          params: {
            period: activePeriod,
            ...(selectedCategory !== "All" ? { scope: selectedCategory } : {}),
          },
          signal: controller.signal,
        });
        setFeeSummary(res.data.summary || []);
        setTransactions(res.data.transactions || []);
      } catch (err) {
        if (!controller.signal.aborted) {
          setLoadError(getApiErrorMessage(err, "Failed to load financial report."));
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();
    return () => controller.abort();
  }, [selectedCategory, activePeriod, selectedYear, selectedTerm]);

  const availableYears = loadAcademicYears();

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchCat = selectedCategory === "All" || tx.category === selectedCategory;
      const matchPeriod = tx.period === activePeriod;
      const matchSearch =
        tx.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.receiptNo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchPeriod && matchSearch;
    });
  }, [selectedCategory, activePeriod, searchQuery, transactions]);

  const filteredSummary = feeSummary.filter(
    (row) => selectedCategory === "All" || row.category === selectedCategory
  );

  const totalCharged = filteredSummary.reduce((s, r) => s + r.totalCharged, 0);
  const totalPaid = filteredSummary.reduce((s, r) => s + r.totalPaid, 0);
  const totalOutstanding = filteredSummary.reduce((s, r) => s + r.outstanding, 0);
  const totalStudents = filteredSummary.reduce((s, r) => s + r.students, 0);

  const collectionRate = totalCharged > 0 ? Math.round((totalPaid / totalCharged) * 100) : 0;

  const handleDownloadCSV = () => {
    const headers = ["Receipt No", "Student Name", "Category", "Method", "Date", "Period", "Amount (RWF)"];
    const rows = filteredTransactions.map((tx) => [
      tx.receiptNo,
      tx.studentName,
      tx.category,
      tx.method,
      tx.date,
      tx.period,
      String(tx.amount),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bursar-financial-report-${activePeriod.replace(/[\s/]/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-12 font-sans">
      {/* ======= HEADER ======= */}
      <div className="border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 md:p-7 bg-white dark:bg-zinc-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wide">
            <FileText className="w-3.5 h-3.5" /> Financial Reports & Exports
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Fee Collection Reports
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Generate fee collection summaries by education level, view payment transactions, export to CSV,
            and print official financial reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2.5 rounded-2xl border border-emerald-700/30 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 hover:bg-emerald-100 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold text-xs flex items-center gap-2 hover:bg-zinc-200 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
          <Link
            href="/dashboard/bursar"
            className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center gap-2"
          >
            <Receipt className="w-4 h-4" /> Record Payment
          </Link>
        </div>
      </div>

      {/* ======= HOW IT WORKS ======= */}
      <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">About this report:</span> Fee payments are recorded on the{" "}
          <Link href="/dashboard/bursar" className="underline font-bold">Overview</Link> page. This page
          compiles those payments into a fee collection summary by education level, with the amounts
          charged, collected, and still outstanding. Use <strong>Export CSV</strong> for spreadsheets or{" "}
          <strong>Print Report</strong> for a signed paper copy. Nursery &amp; Primary fee reports are
          managed by the Primary Headmaster and are not included here.
        </div>
      </div>

      {/* ======= FILTERS ======= */}
      <div className="border border-amber-900/10 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 p-4 shadow-xs flex flex-wrap items-center gap-3 print:hidden">
        <Filter className="w-4 h-4 text-emerald-700" />
        <div className="flex flex-wrap gap-1.5">
          {(["All", "LOWER SECONDARY", "TVET"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-emerald-50"
              }`}
            >
              {cat === "All" ? "All Levels" : LEVEL_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Calendar className="w-4 h-4 text-zinc-400" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-bold text-zinc-900 dark:text-white focus:outline-none"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value as TermType)}
            className="px-3 py-1.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-bold text-zinc-900 dark:text-white focus:outline-none"
          >
            <option value="TERM_1">Term 1</option>
            <option value="TERM_2">Term 2</option>
            <option value="TERM_3">Term 3</option>
          </select>
          {isLoading && (
            <Loader2
              className="w-4 h-4 text-emerald-600 animate-spin"
              aria-label="Loading report..."
            />
          )}
        </div>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl px-3 py-2 text-[11px] font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {loadError}
        </div>
      )}

      {/* ======= SUMMARY CARDS ======= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
            <Banknote className="w-3.5 h-3.5" /> Total Charged
          </p>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white mt-1">
            {totalCharged.toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">RWF across {totalStudents} students</p>
        </div>

        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Total Collected
          </p>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {totalPaid.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-600 mt-0.5">{collectionRate}% collection rate</p>
        </div>

        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Outstanding Balance
          </p>
          <p className="text-2xl font-bold font-mono text-rose-600 mt-1">
            {totalOutstanding.toLocaleString()}
          </p>
          <p className="text-[10px] text-rose-500 mt-0.5">RWF still to collect</p>
        </div>

        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Collection Rate
          </p>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white mt-1">
            {collectionRate}%
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">of total fees collected</p>
        </div>
      </div>

      {/* ======= FEE COLLECTION SUMMARY TABLE ======= */}
      <div className="border border-amber-900/10 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-amber-900/10 dark:border-zinc-800">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-700" /> Fee Collection Summary by Education Level
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Amounts charged, collected, and outstanding for {activePeriod}.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-amber-900/5 dark:bg-zinc-800/50 text-zinc-500 font-bold uppercase tracking-wider border-b border-amber-900/10 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Education Level</th>
                <th className="py-3 px-4 text-right">Students</th>
                <th className="py-3 px-4 text-right">Total Charged (RWF)</th>
                <th className="py-3 px-4 text-right">Collected (RWF)</th>
                <th className="py-3 px-4 text-right">Outstanding (RWF)</th>
                <th className="py-3 px-4 text-right">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/10 dark:divide-zinc-800">
              {filteredSummary.map((row) => {
                const rate = row.totalCharged > 0 ? Math.round((row.totalPaid / row.totalCharged) * 100) : 0;
                return (
                  <tr key={row.category} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-3.5 px-4 font-bold text-amber-800 dark:text-amber-400">
                      {LEVEL_LABELS[row.category] || row.category}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-zinc-700 dark:text-zinc-300">
                      {row.students}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      {row.totalCharged.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {row.totalPaid.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                      {row.outstanding.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          rate >= 90
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : rate >= 75
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {rate}%
                      </span>
                    </td>
                   </tr>
                 );
               })}
               {filteredSummary.length === 0 && (
                 <tr>
                   <td colSpan={6} className="text-center py-8 text-zinc-400 italic">
                     No fee summary data available yet.
                   </td>
                 </tr>
               )}
             </tbody>
            <tfoot className="bg-zinc-50 dark:bg-zinc-800/40 border-t border-amber-900/10 dark:border-zinc-800">
              <tr className="font-bold">
                <td className="py-3.5 px-4 text-zinc-900 dark:text-white">Total</td>
                <td className="py-3.5 px-4 text-right font-mono text-zinc-900 dark:text-white">
                  {totalStudents}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-zinc-900 dark:text-white">
                  {totalCharged.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-700 dark:text-emerald-400">
                  {totalPaid.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-rose-600 dark:text-rose-400">
                  {totalOutstanding.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-700 dark:text-emerald-400">
                  {collectionRate}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ======= TRANSACTION LEDGER ======= */}
      <div className="border border-amber-900/10 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-amber-900/10 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-700" /> Payment Transactions
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              All fee payments recorded for {activePeriod}.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search receipt / student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-amber-900/5 dark:bg-zinc-800/50 text-zinc-500 font-bold uppercase tracking-wider border-b border-amber-900/10 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount (RWF)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/10 dark:divide-zinc-800">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {tx.receiptNo}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white">
                      {tx.studentName}
                    </td>
                    <td className="py-3.5 px-4 text-amber-800 dark:text-amber-400 font-bold">
                      {LEVEL_LABELS[tx.category] || tx.category}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-500">{tx.date}</td>
                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">{tx.method}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      {tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-zinc-400 italic">
                    No transactions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
