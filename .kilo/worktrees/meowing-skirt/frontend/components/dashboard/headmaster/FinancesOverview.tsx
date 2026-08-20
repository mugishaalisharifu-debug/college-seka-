"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  Eye,
  Download,
  Landmark,
  Receipt,
  AlertTriangle,
} from "lucide-react";

type FlowType = "INCOME" | "EXPENSE";

interface CashRecord {
  id: string;
  date: string;
  type: FlowType;
  category: string;
  description: string;
  amount: number;
  source: string;
}

const RECORDS: CashRecord[] = [];

const TOTAL_INCOME = RECORDS.filter((r) => r.type === "INCOME").reduce((sum, r) => sum + r.amount, 0);
const TOTAL_EXPENSE = RECORDS.filter((r) => r.type === "EXPENSE").reduce((sum, r) => sum + r.amount, 0);
const NET_BALANCE = TOTAL_INCOME - TOTAL_EXPENSE;

export default function FinancesOverview() {
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [records, setRecords] = useState<CashRecord[]>(RECORDS);

  const filteredRecords = records.filter((r) => filterType === "ALL" || r.type === filterType);

  const totalIncome = records.filter((r) => r.type === "INCOME").reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = records.filter((r) => r.type === "EXPENSE").reduce((sum, r) => sum + r.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-6 pb-12">
      <div className="border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 md:p-8 bg-white dark:bg-zinc-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <Landmark className="w-4 h-4" /> Executive Financial Oversight
          </span>
          <h1 className="font-sans text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mt-1">
            School Finances Overview
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Consolidated view of income, expenses, and net cash flow from the Bursar and Cashier desks.
          </p>
        </div>

<div className="flex items-center gap-2 shrink-0">
          <Link
            href="/dashboard/headmaster-secondary-tvet/reports"
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            <Eye className="w-4 h-4" /> View Report
          </Link>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center gap-2 hover:bg-zinc-50 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Income</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <h2 className="text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
            {totalIncome.toLocaleString()} <span className="text-xs font-sans font-semibold">RWF</span>
          </h2>
          <p className="text-[10px] text-zinc-500">School fees, grants, and other revenue</p>
        </div>

        <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Expenses</span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <h2 className="text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {totalExpense.toLocaleString()} <span className="text-xs font-sans font-semibold">RWF</span>
          </h2>
          <p className="text-[10px] text-zinc-500">Procurement, salaries, and operations</p>
        </div>

        <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Net Cash Position</span>
            <Wallet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-extrabold font-mono text-zinc-900 dark:text-white mt-1">
            {netBalance.toLocaleString()} <span className="text-xs font-sans font-semibold">RWF</span>
          </h2>
          <p className="text-[10px] text-zinc-500">Income minus expenses</p>
        </div>
      </div>

      <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-amber-900/10 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-700" /> Recent Financial Transactions
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Latest cash movements recorded by Bursar and Cashier</p>
          </div>

          <div className="flex rounded-xl border border-amber-900/15 dark:border-zinc-700 p-1 bg-zinc-50 dark:bg-zinc-800">
            {(["ALL", "INCOME", "EXPENSE"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  filterType === t
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {t === "ALL" ? "All" : t === "INCOME" ? "Income" : "Expenses"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-amber-900/5 dark:bg-zinc-800/50 text-zinc-500 font-bold uppercase tracking-wider border-b border-amber-900/10 dark:border-zinc-800">
              <tr>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6">Source</th>
                <th className="py-3.5 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/10 dark:divide-zinc-800">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4 px-6 font-mono text-zinc-500">{rec.date}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        rec.type === "INCOME"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {rec.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium text-zinc-700 dark:text-zinc-300">{rec.description}</td>
                  <td className="py-4 px-6 text-zinc-500">{rec.source}</td>
                  <td
                    className={`py-4 px-6 text-right font-mono font-bold ${
                      rec.type === "INCOME"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {rec.type === "INCOME" ? "+" : "-"}{rec.amount.toLocaleString()} RWF
                  </td>
                </tr>
              ))}
            </tbody>
            {filteredRecords.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400 text-xs">
                    No financial transactions recorded yet.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <span className="font-bold">Management Note: </span>
          Detailed per-student fee ledgers and operational expense logs are managed by the Bursar desk.
          Use the links below for deeper analysis.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="/dashboard/bursar/payments"
          className="group rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs hover:border-emerald-600/50 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-zinc-900 dark:text-white">Student Fee Ledger</p>
              <p className="text-[11px] text-zinc-500">Bursar payment records</p>
            </div>
          </div>
          <Eye className="w-4 h-4 text-zinc-300 group-hover:text-emerald-600 transition-colors" />
        </a>

        <a
          href="/dashboard/bursar/cash-flow"
          className="group rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs hover:border-emerald-600/50 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-zinc-900 dark:text-white">Operational Cash Flow</p>
              <p className="text-[11px] text-zinc-500">Non-fee income & expenses</p>
            </div>
          </div>
          <Eye className="w-4 h-4 text-zinc-300 group-hover:text-emerald-600 transition-colors" />
        </a>
      </div>
    </div>
  );
}
