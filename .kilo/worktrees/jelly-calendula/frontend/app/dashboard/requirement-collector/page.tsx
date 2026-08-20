"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Printer,
  Search,
  Boxes,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";

export interface StudentReport {
  id: string;
  studentName: string;
  className: string;
  status: "CLEARED" | "INCOMPLETE";
  broughtItems: string[];
  missingItems: string[];
  categorySummary: {
    boardingTools: "COMPLETE" | "INCOMPLETE";
    academicSupplies: "COMPLETE" | "INCOMPLETE";
    feesAndCare: "COMPLETE" | "INCOMPLETE";
  };
}

export default function RequirementOverviewTab() {
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [reports, setReports] = useState<StudentReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<StudentReport[]>("/requirements/checkin-directory");
        setReports(res.data);
      } catch (error) {
        console.error("Failed to load requirement reports:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadReports();
  }, []);

  // Stats
  const totalStudents = reports.length;
  const clearedStudents = reports.filter((r) => r.status === "CLEARED").length;
  const incompleteStudents = reports.filter((r) => r.status === "INCOMPLETE").length;

  // Incomplete list for Pending Zone (Limit preview to top 6)
  const incompleteList = reports.filter((r) => r.status === "INCOMPLETE");
  const pendingPreview = incompleteList.slice(0, 6);

  // Filtered Table Logic
  const filteredReports = reports.filter((r) => {
    const matchesClass = selectedClass === "ALL" || r.className === selectedClass;
    const matchesStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "CLEARED" && r.status === "CLEARED") ||
      (selectedStatus === "INCOMPLETE" && r.status === "INCOMPLETE");

    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesClass && matchesStatus && matchesSearch;
  });

  // Paginated Data
  const totalPages = Math.ceil(filteredReports.length / pageSize) || 1;
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* 1. HEADER */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            School-Wide Collector Analytics
          </span>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
            Requirements & Materials Dashboard
          </h1>
          <p className="text-zinc-500 text-xs">
            Tracking physical items across {totalStudents} registered students
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold flex items-center gap-1.5 hover:bg-zinc-100 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" /> Print Summary Report
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-8 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
          <span className="text-xs font-bold">Loading requirement data...</span>
        </div>
      )}

      {/* 2. STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Enrolled</span>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">{totalStudents}</h2>
          <p className="text-[10px] text-zinc-500">All streams combined</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Fully Cleared</span>
          <h2 className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">{clearedStudents}</h2>
          <p className="text-[10px] text-zinc-500">Brought all required items</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending / Owe Items</span>
          <h2 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">{incompleteStudents}</h2>
          <p className="text-[10px] text-zinc-500">Requires follow-up</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Clearance Rate</span>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">
            {Math.round((clearedStudents / totalStudents) * 100)}%
          </h2>
          <p className="text-[10px] text-zinc-500">Reporting day progress</p>
        </div>
      </div>

      {/* 3. CONTROLLED PENDING ZONE (LIMIT PREVIEW TO 6) */}
      <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-800/60 pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <h2 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                Recent Pending Submissions ({incompleteStudents} Total)
              </h2>
              <p className="text-[10px] text-amber-800/80 dark:text-amber-300">
                Previewing latest students who entered without complete items
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedStatus("INCOMPLETE");
              document.getElementById("report-table")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-[10px] font-bold text-amber-900 dark:text-amber-200 bg-amber-200/70 hover:bg-amber-300/80 dark:bg-amber-900 px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
          >
            View All {incompleteStudents} Incomplete <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Grid Preview (Limited to 6 cards max) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {pendingPreview.map((st) => (
            <div
              key={st.id}
              className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 space-y-1.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-zinc-900 dark:text-white text-xs">{st.studentName}</h3>
                <span className="text-[10px] text-zinc-500 font-mono">{st.className}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {st.missingItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800"
                  >
                    Owes: {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. PAGINATED MASTER TABLE */}
      <div id="report-table" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-700" /> Student Clearance Directory
            </h3>
            <p className="text-[11px] text-zinc-500">
              Filtered table view with page navigation
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs focus:outline-none"
            />
          </div>

          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer"
          >
            <option value="ALL">Class: All Streams</option>
            <option value="P5B">Primary 5 (P5B)</option>
            <option value="S1A">Senior 1 (S1A)</option>
            <option value="S2B">Senior 2 (S2B)</option>
            <option value="TVET-L3 SD">TVET L3 Software Dev</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer"
          >
            <option value="ALL">Status: All Students</option>
            <option value="CLEARED">Cleared Only</option>
            <option value="INCOMPLETE">Incomplete / Owing Only</option>
          </select>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400">
                <th className="py-2.5 px-3">Student & ID</th>
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Missing Items Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {paginatedReports.length > 0 ? (
                paginatedReports.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="py-3 px-3">
                      <p className="font-bold text-zinc-900 dark:text-white">{r.studentName}</p>
                      <p className="text-[10px] font-mono text-zinc-400">{r.id}</p>
                    </td>
                    <td className="py-3 px-3 font-semibold text-zinc-700 dark:text-zinc-300">
                      {r.className}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                          r.status === "CLEARED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {r.status === "CLEARED" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {r.status === "CLEARED" ? "Cleared" : "Incomplete"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {r.missingItems.length > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                          {r.missingItems.join(", ")}
                        </span>
                      ) : (
                        <span className="text-zinc-400 italic">None (All brought)</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-zinc-400 italic">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. PAGINATION CONTROLS */}
        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <p className="text-[11px] text-zinc-500">
            Showing <span className="font-bold text-zinc-800 dark:text-zinc-200">
              {filteredReports.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span> to <span className="font-bold text-zinc-800 dark:text-zinc-200">
              {Math.min(currentPage * pageSize, filteredReports.length)}
            </span> of <span className="font-bold text-zinc-800 dark:text-zinc-200">{filteredReports.length}</span> students
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}