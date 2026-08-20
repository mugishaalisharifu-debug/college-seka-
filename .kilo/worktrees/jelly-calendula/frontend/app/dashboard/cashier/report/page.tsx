"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Printer,
  Calendar,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";

// ==========================================
// TYPES & MOCK DATA
// ==========================================
export type ReportType = "ALL" | "STOCK_IN" | "STOCK_OUT" | "SPOILAGE" | "SUMMARY";
export type DatePreset = "TODAY" | "WEEK" | "MONTH" | "CUSTOM";

export interface LogEntry {
  id: string;
  date: string;
  type: "IN" | "OUT" | "SPOILAGE";
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  details: string; // Supplier, Cook Name, or Spoilage Reason
  loggedBy: string;
}

const ALL_LOGS: LogEntry[] = [];

export default function ReportTab() {
  // Filters State
  const [reportType, setReportType] = useState<ReportType>("ALL");
  const [datePreset, setDatePreset] = useState<DatePreset>("WEEK");
  
  // Custom Date Range (Defaults to current week range)
  const [startDate, setStartDate] = useState<string>("2026-08-01");
  const [endDate, setEndDate] = useState<string>("2026-08-06");
  const [logs, setLogs] = useState<LogEntry[]>(ALL_LOGS);

  // Handle Quick Date Range Presets
  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    const todayStr = "2026-08-06"; // Current Date

    if (preset === "TODAY") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "WEEK") {
      setStartDate("2026-08-01"); // Start of current week
      setEndDate(todayStr);
    } else if (preset === "MONTH") {
      setStartDate("2026-08-01"); // Start of current month
      setEndDate(todayStr);
    }
  };

  // Filter Logic
  const filteredLogs = useMemo(() => logs.filter((log) => {
    // 1. Filter by Date Range
    const isWithinDate = log.date >= startDate && log.date <= endDate;

    // 2. Filter by Report Category
    let matchesType = true;
    if (reportType === "STOCK_IN") matchesType = log.type === "IN";
    if (reportType === "STOCK_OUT") matchesType = log.type === "OUT";
    if (reportType === "SPOILAGE") matchesType = log.type === "SPOILAGE";

    return isWithinDate && matchesType;
  }), [logs, reportType, startDate, endDate]);

  // KPI Computations for Selected Filter Range
  const totalInKg = filteredLogs
    .filter((l) => l.type === "IN")
    .reduce((sum, item) => sum + item.quantity, 0);

  const totalOutKg = filteredLogs
    .filter((l) => l.type === "OUT")
    .reduce((sum, item) => sum + item.quantity, 0);

  const totalSpoilageKg = filteredLogs
    .filter((l) => l.type === "SPOILAGE")
    .reduce((sum, item) => sum + item.quantity, 0);

  // Trigger Print Dialog
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* 1. REPORT FILTER CONTROLS PANEL (Hidden during print) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4 print:hidden">
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" /> Stock Report Generator
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Select date ranges and report types to generate customized inventory reports.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" /> Print / Export PDF
          </button>
        </div>

        {/* CONTROLS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Report Type Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-zinc-400" /> Report Category
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white cursor-pointer"
            >
              <option value="ALL">All Store Operations (Full Log)</option>
              <option value="STOCK_IN">Stock In Only (Deliveries)</option>
              <option value="STOCK_OUT">Stock Out Only (Kitchen Usage)</option>
              <option value="SPOILAGE">Spoilage & Losses Only</option>
            </select>
          </div>

          {/* Quick Date Presets */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Quick Date Range
            </label>
            <div className="flex rounded-xl border border-zinc-200 dark:border-zinc-700 p-1 bg-zinc-50 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => handlePresetChange("TODAY")}
                className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  datePreset === "TODAY"
                    ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange("WEEK")}
                className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  datePreset === "WEEK"
                    ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange("MONTH")}
                className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  datePreset === "MONTH"
                    ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Custom Date Range Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 dark:text-zinc-300">
              Custom Date Range (Start & End)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setDatePreset("CUSTOM");
                  setStartDate(e.target.value);
                }}
                className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setDatePreset("CUSTOM");
                  setEndDate(e.target.value);
                }}
                className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 2. PRINTABLE REPORT TEMPLATE SHEET */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* REPORT HEADER */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">
              Official School Food Store Report
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">
              Period Covered: <span className="font-bold text-zinc-800 dark:text-zinc-200">{startDate}</span> to{" "}
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{endDate}</span>
            </p>
          </div>

          <div className="text-right text-[11px] text-zinc-400">
            <p>Generated On: <span className="font-semibold text-zinc-700 dark:text-zinc-300">Aug 06, 2026</span></p>
            <p>Prepared By: <span className="font-semibold text-zinc-700 dark:text-zinc-300">Cashier / Storekeeper</span></p>
          </div>
        </div>

        {/* SUMMARY CARDS IN REPORT */}
        <div className="grid grid-cols-3 gap-4">
          
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <p className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5" /> Total Stock In
            </p>
            <h3 className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
              +{totalInKg} <span className="text-xs font-semibold">kg</span>
            </h3>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
            <p className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Kitchen Usage
            </p>
            <h3 className="text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              -{totalOutKg} <span className="text-xs font-semibold">kg</span>
            </h3>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
            <p className="text-[10px] font-bold uppercase text-rose-800 dark:text-rose-300 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Spoilage & Losses
            </p>
            <h3 className="text-lg font-extrabold text-rose-600 dark:text-rose-400 mt-1">
              -{totalSpoilageKg} <span className="text-xs font-semibold">kg</span>
            </h3>
          </div>

        </div>

        {/* LOG DATA TABLE */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
            Detailed Transaction Log ({filteredLogs.length} Records)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Food Item</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3">Details / Supplier / Reason</th>
                  <th className="py-2.5 px-3">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="py-3 px-3 font-semibold text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {log.date}
                      </td>
                      <td className="py-3 px-3">
                        {log.type === "IN" && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            STOCK IN
                          </span>
                        )}
                        {log.type === "OUT" && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            STOCK OUT
                          </span>
                        )}
                        {log.type === "SPOILAGE" && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            SPOILAGE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-zinc-900 dark:text-white">
                        {log.itemName}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-mono font-bold ${
                          log.type === "IN"
                            ? "text-emerald-700 dark:text-emerald-400"
                            : log.type === "OUT"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {log.type === "IN" ? "+" : "-"}{log.quantity} {log.unit}
                      </td>
                      <td className="py-3 px-3 text-zinc-600 dark:text-zinc-300 font-medium">
                        {log.details}
                      </td>
                      <td className="py-3 px-3 text-zinc-400 text-[11px]">
                        {log.loggedBy}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-zinc-400 italic">
                      No records found for the selected date range and filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIGNATURE SECTION FOR HEADMASTER & CASHIER */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 gap-8 print:block">
          <div className="space-y-8">
            <p className="text-[11px] font-bold text-zinc-500 uppercase">
              Prepared By (Cashier / Storekeeper):
            </p>
            <div className="border-b border-zinc-300 dark:border-zinc-700 w-3/4"></div>
            <p className="text-[10px] text-zinc-400">Signature & Date</p>
          </div>

          <div className="space-y-8">
            <p className="text-[11px] font-bold text-zinc-500 uppercase">
              Approved By (Headmaster / Director):
            </p>
            <div className="border-b border-zinc-300 dark:border-zinc-700 w-3/4"></div>
            <p className="text-[10px] text-zinc-400">Signature & Date</p>
          </div>
        </div>

      </div>

    </div>
  );
}