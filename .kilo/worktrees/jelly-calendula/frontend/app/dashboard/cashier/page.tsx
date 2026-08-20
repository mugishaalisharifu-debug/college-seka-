"use client";

import React, { useState, type ElementType } from "react";
import Link from "next/link";
import {
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  FileText,
  ArrowRight,
  Clock,
  Scale,
  CreditCard,
} from "lucide-react";

export default function CashierOverviewPage() {
  const [stockBalances, setStockBalances] = useState<{ name: string; category: string; qty: number; unit: string; status: string }[]>([]);
  const [recentMovements, setRecentMovements] = useState<{ id: string; type: "IN" | "OUT" | "SPOILAGE"; item: string; qty: number; unit: string; time: string; note: string; icon: ElementType; color: string; bg: string }[]>([]);

  const lowStockCount = stockBalances.filter((s) => s.status === "low").length;
  const totalIn = recentMovements.filter((m) => m.type === "IN").reduce((sum, m) => sum + m.qty, 0);
  const totalOut = recentMovements.filter((m) => m.type === "OUT").reduce((sum, m) => sum + m.qty, 0);
  const totalSpoilage = recentMovements.filter((m) => m.type === "SPOILAGE").reduce((sum, m) => sum + m.qty, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-800 dark:text-violet-300 text-xs font-bold uppercase tracking-wide">
            <CreditCard className="w-3.5 h-3.5" />
            Cashier — Store & Kitchen Control
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Food Store Operations Overview
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
            Track daily store movements, monitor stock levels, log kitchen usage, and
            report spoilage — all in one place.
          </p>
        </div>

        <Link
          href="/dashboard/cashier/report"
          className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shrink-0 transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Store Report</span>
        </Link>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600 text-white rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-rose-900 dark:text-rose-200 text-xs">
                Warning: {lowStockCount} store items running low!
              </h4>
              <p className="text-[11px] text-rose-700 dark:text-rose-300">
                Beans and Cooking Oil are below their safe threshold. Inform the Headmaster for restocking.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Items in Store", value: `${stockBalances.length}`, sub: "Active food tracking", icon: Package, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
          { label: "Today Stock In", value: `+${totalIn} kg`, sub: "Received from suppliers", icon: ArrowDownLeft, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
          { label: "Today Kitchen Usage", value: `-${totalOut} kg`, sub: "Released for meals", icon: ArrowUpRight, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50" },
          { label: "Spoilage Logged", value: `${totalSpoilage} kg`, sub: "Needs admin review", icon: AlertTriangle, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/50" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{kpi.label}</p>
                <p className="text-xl font-extrabold font-mono text-zinc-900 dark:text-white mt-1">{kpi.value}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{kpi.sub}</p>
              </div>
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Stock Balances & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Stock Balances */}
        <div className="lg:col-span-2 rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-700" />
              Current Store Food Quantities
            </h3>
            <Link
              href="/dashboard/cashier/stock-in"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              Manage Stock <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-amber-900/10 dark:border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400">
                  <th className="py-2.5 px-3">Food Item Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Available Balance</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/10 dark:divide-zinc-800">
                {stockBalances.map((item) => (
                  <tr key={item.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="py-3 px-3 font-bold text-zinc-900 dark:text-white">{item.name}</td>
                    <td className="py-3 px-3 text-zinc-500 font-medium">{item.category}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-xs text-zinc-900 dark:text-white">
                      {item.qty} <span className="text-[10px] text-zinc-500 font-normal">{item.unit}</span>
                    </td>
                    <td className="py-3 px-3">
                      {item.status === "low" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">Low Stock</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">Sufficient</span>
                      )}
                    </td>
                  </tr>
                ))}
                {stockBalances.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-zinc-400 italic text-xs">
                      No stock balance data available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Movements */}
        <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
          <div className="border-b border-amber-900/10 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              Recent Store Movements
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Latest entries logged today</p>
          </div>

          <div className="space-y-3">
            {recentMovements.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="p-3 rounded-xl border border-amber-900/10 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-white text-xs">{act.item}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${act.bg} ${act.color} flex items-center gap-1`}>
                      <Icon className="w-3 h-3" /> {act.qty} {act.unit} ({act.type === "IN" ? "IN" : act.type === "OUT" ? "OUT" : "SPOIL"})
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium">{act.note}</p>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1 pt-1">
                    <Clock className="w-3 h-3" /> {act.time}
                  </div>
                </div>
              );
            })}
            {recentMovements.length === 0 && (
              <div className="p-6 text-center text-zinc-400 text-xs">
                No store movements recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module Shortcut Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: "/dashboard/cashier/stock-in", label: "Stock In", desc: "Record supplier deliveries", icon: ArrowDownLeft, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
          { href: "/dashboard/cashier/stock-out", label: "Stock Out", desc: "Issue kitchen supplies", icon: ArrowUpRight, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50" },
          { href: "/dashboard/cashier/spoilage", label: "Spoilage Log", desc: "Report damaged stock", icon: AlertTriangle, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/50" },
          { href: "/dashboard/cashier/report", label: "Store Report", desc: "Print official reports", icon: FileText, color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/50" },
        ].map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.href}
              href={mod.href}
              className="group p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-600/60 transition-all flex items-start gap-3"
            >
              <div className={`p-2.5 rounded-xl ${mod.bg}`}>
                <Icon className={`w-5 h-5 ${mod.color}`} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-xs text-zinc-900 dark:text-white group-hover:text-emerald-700 transition-colors">{mod.label}</p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{mod.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
