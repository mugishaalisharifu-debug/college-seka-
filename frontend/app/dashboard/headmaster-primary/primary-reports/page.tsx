"use client";

import React, { useState, type ElementType } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle2,
  UserCheck,
  Building2,
  FileCheck,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Eye,
  CalendarRange,
  Layers,
  Plus,
} from "lucide-react";
import ReportViewerModal, { ReportData } from "@/components/dashboard/ReportViewerModal";
import { downloadTextFile } from "@/lib/file-export";
import {
  ACADEMIC_TERMS,
  addNextAcademicYear,
  loadAcademicYears,
} from "@/lib/academic-years";

// Available academic terms (the school continues to use the system year after year)
const TERMS = ACADEMIC_TERMS;

interface PrimaryReport {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  format: string;
  lastUpdated: string;
  icon: ElementType;
  buildData: (academicYear: string, term: string) => ReportData;
}

export default function PrimaryReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<string>("2026-2027");
  const [term, setTerm] = useState<string>("Term 1");
  const [activeReport, setActiveReport] = useState<ReportData | null>(null);
  const [reports, setReports] = useState<PrimaryReport[]>([]);

  // Academic-year options that can grow year after year.
  const [academicYears, setAcademicYears] = useState<string[]>(() => loadAcademicYears());

  const handleAddAcademicYear = () => {
    const nextList = addNextAcademicYear(academicYears, academicYear);
    setAcademicYears(nextList);
    // Auto-select the newly added year so reports immediately target it.
    const next = nextList[nextList.length - 1];
    setAcademicYear(next);
  };

  const handleExportReport = (report: PrimaryReport, reportData: ReportData) => {
    downloadTextFile(
      `${report.id}-${report.title.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}.txt`,
      [
        `Report: ${report.title}`,
        `Reference: ${report.id}`,
        `Category: ${report.category}`,
        `Target: ${report.level}`,
        `Academic Year: ${reportData.academicYear}`,
        `Term: ${reportData.term}`,
        `Last Updated: ${report.lastUpdated}`,
        "",
        reportData.summary,
      ].join("\n"),
    );
  };

  // System-generated operational reports for Primary Headmaster.
  // Each report can be generated, viewed/opened, printed and downloaded for the selected year & term.

  const filteredReports = reports.filter((report) => {
    const matchesCategory =
      selectedCategory === "ALL" || report.category === selectedCategory;
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP NAVIGATION / BREADCRUMB */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/headmaster-primary"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Primary Dashboard
          </Link>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Primary Headmaster Scope
          </span>
        </div>

        {/* HEADER SECTION */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                Primary & Nursery Operational Reports
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
                Generate, view, print and download operational, gate intake, fee clearance, and application reports for Nursery and Primary sections.
              </p>
            </div>

            {/* Academic Year & Term Selectors */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <CalendarRange className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="bg-transparent text-xs font-bold text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
                  title="Academic Year"
                >
                  {academicYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddAcademicYear}
                  title={`Add next academic year (${academicYears[academicYears.length - 1]}) for the next school year`}
                  className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="bg-transparent text-xs font-bold text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
                  title="School Term"
                >
                  {TERMS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS: SEARCH & CATEGORY FILTERS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search reports by keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
            />
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "Admissions", "Gate Entry", "Finance", "Enrollment"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                }`}
              >
                {cat === "ALL" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* REPORTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredReports.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-zinc-400">
                        {report.id}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {report.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                      {report.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      {report.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Target: {report.level}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {academicYear} • {term} • Updated {report.lastUpdated}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveReport(report.buildData(academicYear, term))}
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-700/40 text-emerald-700 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> View & Open
                    </button>
                    <button
                      onClick={() => handleExportReport(report, report.buildData(academicYear, term))}
                      className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-sm">
                      <Download className="w-3.5 h-3.5" /> Export ({report.format})
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {filteredReports.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
            <FileSpreadsheet className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              No reports found
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Try adjusting your search query or category filter.
            </p>
          </div>
        )}

      </div>

      {/* Interactive Report Viewer — view & print the selected report */}
      {activeReport && (
        <ReportViewerModal report={activeReport} onClose={() => setActiveReport(null)} />
      )}
    </main>
  );
}