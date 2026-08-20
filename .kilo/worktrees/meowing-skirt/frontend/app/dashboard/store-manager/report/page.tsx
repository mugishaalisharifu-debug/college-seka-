"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Eye } from "lucide-react";
import ReportViewerModal, { ReportData } from "@/components/dashboard/ReportViewerModal";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";

interface InventoryReportItem {
  id: string;
  title: string;
  category: string;
  status: string;
  updated: string;
  reportData: ReportData;
}

export default function StoreManagerReportPage() {
  const [activeReport, setActiveReport] = useState<ReportData | null>(null);
  const [reports, setReports] = useState<InventoryReportItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [usage, audit] = await Promise.all([
          api.get<ReportData>("/reports/store-manager/usage"),
          api.get<ReportData>("/reports/store-manager/requirement-audit"),
        ]);
        setReports([
          {
            id: usage.data.id,
            title: usage.data.title,
            category: "General Inventory",
            status: "Ready",
            updated: usage.data.generatedDate,
            reportData: usage.data,
          },
          {
            id: audit.data.id,
            title: audit.data.title,
            category: "Incoming Students",
            status: "Ready",
            updated: audit.data.generatedDate,
            reportData: audit.data,
          },
        ]);
      } catch (error) {
        alert(getApiErrorMessage(error, "Failed to load reports."));
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-violet-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Store Inventory Reports
            </p>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">Store Manager Reports</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              View, open, and preview inventory reports directly on screen before downloading PDF/CSV formats.
            </p>
          </div>
          <button
            onClick={() => setActiveReport(reports[0]?.reportData ?? null)}
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-700 hover:bg-violet-800 px-4 py-3 text-white text-xs font-bold uppercase tracking-[0.16em] shadow-xs cursor-pointer transition-all"
          >
            <Eye className="w-4 h-4" /> Preview Main Report
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="rounded-3xl border border-violet-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-violet-900/10 dark:border-zinc-800 text-xs uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400 font-bold">
          Available Inventory Reports Summary
        </div>

        <div className="divide-y divide-violet-900/10 dark:divide-zinc-800">
          {reports.map((report) => (
            <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
              <div>
                <span className="text-[10px] font-mono font-bold text-violet-700 dark:text-violet-300 uppercase">{report.category} â€¢ {report.id}</span>
                <p className="font-semibold text-zinc-900 dark:text-white mt-0.5">{report.title}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Updated {report.updated}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveReport(report.reportData)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40 px-4 py-2 text-violet-700 dark:text-violet-300 font-bold text-xs hover:bg-violet-100 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> View & Open Report
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Report Modal */}
      {activeReport && (
        <ReportViewerModal report={activeReport} onClose={() => setActiveReport(null)} />
      )}
    </div>
  );
}
