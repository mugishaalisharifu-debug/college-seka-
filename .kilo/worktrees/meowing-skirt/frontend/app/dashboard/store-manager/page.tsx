"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Warehouse, Package, FileText, BarChart3, AlertTriangle, ArrowRight } from "lucide-react";
import ReportViewerModal, { ReportData } from "@/components/dashboard/ReportViewerModal";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";

export default function StoreManagerOverviewPage() {
  const [activeReport, setActiveReport] = useState<ReportData | null>(null);
  const [stats, setStats] = useState({ items: 0, lowStock: 0, categories: 0 });

  useEffect(() => {
    api
      .get<{ id: string; itemName: string; category: string; currentBalance: string }[]>(
        "/store-manager/stock",
      )
      .then((res) => {
        setStats({
          items: res.data.length,
          lowStock: res.data.filter((i) => Number(i.currentBalance) < 10).length,
          categories: new Set(res.data.map((i) => i.category)).size,
        });
      })
      .catch(() => {
        // no-op
      });
  }, []);

  const handleOpenReport = async () => {
    try {
      const res = await api.get<ReportData>("/reports/store-manager/usage");
      setActiveReport(res.data);
    } catch (error) {
      alert(getApiErrorMessage(error, "Failed to load the inventory report."));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-violet-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-800 dark:text-violet-300 text-xs font-bold uppercase tracking-wide">
              <Warehouse className="w-3.5 h-3.5" />
              Store Manager â€” Inventory & Requirement Control
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-3">
              School Store & Stock Control Center
            </h1>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mt-2">
              Oversee all items collected from incoming students (hoes, toilet paper, soap, paper reams across KG, Primary, Secondary, TVET). Log daily usage to eliminate bad stock management and preview inventory reports.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto">
            {[
              { label: "Items", value: String(stats.items), icon: Package },
              { label: "Low Stock", value: String(stats.lowStock), icon: AlertTriangle },
              { label: "Reports", value: "6", icon: BarChart3 },
              { label: "Categories", value: `${stats.categories} Levels`, icon: FileText },
            ].map((tile) => (
              <div key={tile.label} className="rounded-3xl border border-violet-900/10 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 p-4 text-center">
                <tile.icon className="mx-auto w-5 h-5 text-violet-700 dark:text-violet-300" />
                <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">{tile.value}</p>
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400 mt-1">
                  {tile.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module Gateway Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link
          href="/dashboard/store-manager/collected-items"
          className="rounded-3xl border border-violet-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs hover:border-violet-600/60 transition-all group"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-700 mb-4">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Collected Items & Requirements</h2>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-violet-700 transition-colors" />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
            View requirement items brought by students (toilet paper, hoes, soap, paper reams, brooms) categorized by level (KG, Primary, Secondary, TVET).
          </p>
        </Link>

        <Link
          href="/dashboard/store-manager/usage-log"
          className="rounded-3xl border border-violet-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs hover:border-violet-600/60 transition-all group"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-700 mb-4">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Stock Usage Log (CRUD)</h2>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-violet-700 transition-colors" />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
            Record, update, or remove daily item consumption. Prevents school stock misuse by logging department, class, purpose, and date.
          </p>
        </Link>

        <div
          onClick={handleOpenReport}
          className="rounded-3xl border border-violet-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs hover:border-violet-600/60 transition-all cursor-pointer group"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-700 mb-4">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Inventory Reports (Previewable)</h2>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-violet-700 transition-colors" />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
            Generate and preview full inventory reports on screen before exporting or printing as PDF/CSV.
          </p>
        </div>
      </div>

      {/* Interactive Report Modal */}
      {activeReport && (
        <ReportViewerModal report={activeReport} onClose={() => setActiveReport(null)} />
      )}
    </div>
  );
}
