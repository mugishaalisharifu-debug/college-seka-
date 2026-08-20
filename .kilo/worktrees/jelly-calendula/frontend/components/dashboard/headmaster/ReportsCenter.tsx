"use client";

import React, { useState } from "react";
import {
  BarChart3,
  FileText,
  Printer,
  Download,
  Calendar,
  GraduationCap,
  Wallet,
  Package,
  Eye,
  CheckCircle2,
  Search,
  Plus,
  X,
  Building2,
} from "lucide-react";
import { downloadTextFile } from "@/lib/file-export";

type ReportCategory = "Academic" | "Financial" | "Inventory" | "Staff";
type ReportType =
  | "Academic Performance Summary"
  | "Class Enrolment & Capacity"
  | "Promotion & Repetition Rates"
  | "Fee Collection & Arrears"
  | "Operational Cash Flow"
  | "Food Store Stock Report"
  | "Spoilage & Losses Report"
  | "Stock Usage Report"
  | "Requirement Collection Audit";

interface ReportItem {
  id: string;
  title: ReportType;
  category: ReportCategory;
  description: string;
  generatedOn: string;
  preparedBy: string;
}

interface Department {
  name: string;
  roleKey: string;
  category: ReportCategory;
  description: string;
  reports: ReportType[];
}

const TODAY = new Date().toLocaleDateString("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

const DEPARTMENTS: Department[] = [
  {
    name: "DOS",
    roleKey: "dos",
    category: "Academic",
    description: "Director of Studies — academic performance, enrolment, promotions",
    reports: [
      "Academic Performance Summary",
      "Class Enrolment & Capacity",
      "Promotion & Repetition Rates",
    ],
  },
  {
    name: "Store Manager",
    roleKey: "store-manager",
    category: "Inventory",
    description: "Store Manager — collected items, usage tracking and supply health",
    reports: ["Stock Usage Report", "Requirement Collection Audit"],
  },
  {
    name: "Bursar",
    roleKey: "bursar",
    category: "Financial",
    description: "Bursar desk — fee collections, arrears and cash flow",
    reports: ["Fee Collection & Arrears", "Operational Cash Flow"],
  },
  {
    name: "Cashier",
    roleKey: "cashier",
    category: "Inventory",
    description: "Cashier desk — store stock, spoilage and losses",
    reports: ["Food Store Stock Report", "Spoilage & Losses Report"],
  },
];

export default function ReportsCenter() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<"All" | ReportCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department>(DEPARTMENTS[0]);
  const [selectedReport, setSelectedReport] = useState<ReportType>(DEPARTMENTS[0].reports[0]);
  const [success, setSuccess] = useState("");
  const [activeReport, setActiveReport] = useState<ReportItem | null>(null);

  const filteredReports = reports.filter((rep) => {
    const matchesCategory = activeCategory === "All" || rep.category === activeCategory;
    const matchesSearch =
      rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = reports.reduce((acc, rep) => {
    acc[rep.category] = (acc[rep.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleSelectDepartment = (dept: Department) => {
    setSelectedDept(dept);
    setSelectedReport(dept.reports[0]);
  };

  const handleDownloadReport = (rep: ReportItem) => {
    downloadTextFile(
      `${rep.id}-${rep.title.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}.txt`,
      [
        `Report: ${rep.title}`,
        `Reference: ${rep.id}`,
        `Category: ${rep.category}`,
        `Generated On: ${rep.generatedOn}`,
        `Prepared By: ${rep.preparedBy}`,
        `Received/Reviewed By: Headmaster`,
        "",
        rep.description,
      ].join("\n"),
    );
  };

  const handleGenerateReport = () => {
    const newReport: ReportItem = {
      id: `rep-${String(reports.length + 1).padStart(3, "0")}`,
      title: selectedReport,
      category: selectedDept.category,
      description: `${selectedReport} generated on request by the Headmaster from the ${selectedDept.name} desk.`,
      generatedOn: TODAY,
      preparedBy: selectedDept.name,
    };
    setReports((prev) => [newReport, ...prev]);
    setShowGenerate(false);
    setSuccess(`${selectedReport} has been generated and received successfully.`);
    setTimeout(() => setSuccess(""), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 md:p-8 bg-white dark:bg-zinc-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" /> Executive Reporting Hub
          </span>
          <h1 className="font-sans text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mt-1">
            School Reports & Analytics
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Review consolidated reports generated by the DOS, Store Manager, Bursar, and Cashier departments.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowGenerate(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Generate Report
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center gap-2 hover:bg-zinc-50 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Report Index
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{success}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Reports</p>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white mt-1">{reports.length}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
            <FileText className="w-3 h-3" /> This term
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Academic Reports</p>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{categoryCounts["Academic"] || 0}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-1">
            <GraduationCap className="w-3 h-3" /> DOS
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Financial Reports</p>
          <p className="text-2xl font-bold font-mono text-amber-600 mt-1">{categoryCounts["Financial"] || 0}</p>
          <p className="text-[10px] text-amber-600 mt-0.5 flex items-center gap-1">
            <Wallet className="w-3 h-3" /> Bursar desk
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Inventory & Staff</p>
          <p className="text-2xl font-bold font-mono text-rose-600 mt-1">
            {(categoryCounts["Inventory"] || 0) + (categoryCounts["Staff"] || 0)}
          </p>
          <p className="text-[10px] text-rose-500 mt-0.5 flex items-center gap-1">
            <Package className="w-3 h-3" /> Cashier / DOS
          </p>
        </div>
      </div>

      {/* Category Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["All", "Academic", "Financial", "Inventory", "Staff"] as const).map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as "All" | ReportCategory)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-amber-900/5 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-amber-900/10"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((rep) => (
          <div
            key={rep.id}
            className="group border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-emerald-600/50 transition-all bg-white dark:bg-zinc-900 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    rep.category === "Academic"
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50"
                      : rep.category === "Financial"
                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50"
                      : rep.category === "Inventory"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50"
                      : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50"
                  }`}
                >
                  {rep.category}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">{rep.id}</span>
              </div>

              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{rep.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{rep.description}</p>
            </div>

            <div className="pt-3 border-t border-amber-900/10 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {rep.generatedOn}
                </span>
                <span className="text-zinc-400">{rep.preparedBy}</span>
              </div>

              {/* Report Workflow: Prepared By -> Received By */}
              <div className="rounded-xl bg-amber-900/5 dark:bg-zinc-800/60 border border-amber-900/10 dark:border-zinc-700 p-2.5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span className="text-[10px] text-zinc-600 dark:text-zinc-400">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Prepared By:</span>{" "}
                    {rep.preparedBy}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                  <span className="text-[10px] text-zinc-600 dark:text-zinc-400">
                    <span className="font-bold text-sky-700 dark:text-sky-400">Received/Reviewed By:</span>{" "}
                    Headmaster
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveReport(rep)}
                  className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Eye className="w-3.5 h-3.5" /> View Report
                </button>
                <button
                  onClick={() => handleDownloadReport(rep)}
                  className="p-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 text-zinc-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-all"
                  title="Download report"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="col-span-full p-12 text-center border border-dashed border-amber-900/15 dark:border-zinc-800 rounded-3xl text-zinc-400 text-xs">
            No reports found matching the selected category or search.
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <span className="font-bold">Report Workflow: </span>
          Each department (DOS, Bursar, Cashier) prepares reports within their dashboards. The Headmaster
          reviews and approves them here, or uses &quot;Generate Report&quot; to request a new report from any department
          for board reporting and regulatory compliance.
        </div>
      </div>

      {/* Report Viewer Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-amber-900/10 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-zinc-400">{activeReport.id}</span>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" /> {activeReport.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">{activeReport.description}</p>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-all"
                aria-label="Close report"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Category</dt>
                <dd className="text-zinc-900 dark:text-white font-semibold">{activeReport.category}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Generated On</dt>
                <dd className="text-zinc-900 dark:text-white font-semibold">{activeReport.generatedOn}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Prepared By</dt>
                <dd className="text-zinc-900 dark:text-white font-semibold">{activeReport.preparedBy}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Reviewed By</dt>
                <dd className="text-zinc-900 dark:text-white font-semibold">Headmaster</dd>
              </div>
            </dl>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleDownloadReport(activeReport)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" /> Download Report
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-50 cursor-pointer transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-amber-900/10 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" /> Generate Report
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Select the department and report type to request a new report for the Headmaster.
                </p>
              </div>
              <button
                onClick={() => setShowGenerate(false)}
                className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Department Selection */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Who should generate the report?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept.roleKey}
                    onClick={() => handleSelectDepartment(dept)}
                    className={`text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedDept.roleKey === dept.roleKey
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                        : "border-amber-900/10 dark:border-zinc-800 hover:border-emerald-600/50"
                    }`}
                  >
                    <p className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" /> {dept.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{dept.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Report Type Selection */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Select report type
              </p>
              <div className="space-y-1.5">
                {selectedDept.reports.map((rep) => (
                  <label
                    key={rep}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedReport === rep
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                        : "border-amber-900/10 dark:border-zinc-800 hover:border-emerald-600/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      checked={selectedReport === rep}
                      onChange={() => setSelectedReport(rep)}
                      className="accent-emerald-700"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">{rep}</p>
                      <p className="text-[10px] text-zinc-500">
                        Generated by {selectedDept.name} → Received by Headmaster
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleGenerateReport}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> Generate & Receive
              </button>
              <button
                onClick={() => setShowGenerate(false)}
                className="px-4 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-50 cursor-pointer transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
