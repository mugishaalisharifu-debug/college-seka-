"use client";

import React, { useState, useEffect } from "react";
import { Loader2, School, Users, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import ReportViewerModal, { ReportData } from "@/components/dashboard/ReportViewerModal";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";

interface DbStudent {
  id: string;
  regNumber: string;
  studentName: string;
  educationLevel: string;
  classId?: string;
  tradeName?: string;
  status?: string;
}

interface DbClass {
  id: string;
  className: string;
  scope: string;
  tradeName?: string;
}

const CLASS_CAPACITY: Record<string, number> = {
  "N1": 25, "N2": 25, "N3": 25,
  "P1": 45, "P2": 45, "P3": 50, "P4": 50, "P5": 45, "P6": 45,
};

export default function HeadmasterPrimaryDashboard() {
  const [activeReport, setActiveReport] = useState<ReportData | null>(null);
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [classes, setClasses] = useState<DbClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [studentsRes, classesRes] = await Promise.all([
          api.get<DbStudent[]>("/dos/students"),
          api.get<DbClass[]>("/dos/classes"),
        ]);
        setStudents(studentsRes.data);
        setClasses(classesRes.data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const nurseryStudents = students.filter((s) => s.educationLevel === "NURSERY" || s.educationLevel === "NURSERY");
  const primaryStudents = students.filter((s) => s.educationLevel === "PRIMARY");
  const nurseryClasses = classes.filter((c) => c.scope === "NURSERY" || c.scope === "PRIMARY");

  const totalStudents = nurseryStudents.length + primaryStudents.length;
  const clearedCount = students.filter((s) => s.status === "ACTIVE").length;
  const pendingDocs = students.filter((s) => !s.status || s.status !== "ACTIVE").length;
  const requirementsPct = totalStudents > 0 ? Math.round((clearedCount / totalStudents) * 100) : 0;

  const handleOpenReport = (title: string, category: string) => {
    const rows = nurseryClasses.map((cls) => {
      const count = students.filter((s) => s.classId === cls.id).length;
      const cap = CLASS_CAPACITY[cls.className] || 30;
      const pct = cap > 0 ? Math.round((count / cap) * 100) : 0;
      const status = pct >= 100 ? "Full" : pct >= 90 ? "Filling Fast" : "Normal";
      return [cls.className, String(count), `${pct}% filled`, count > 0 ? "On track" : "Empty"];
    });
    setActiveReport({
      id: `RPT-PRI-${Date.now().toString().slice(-4)}`,
      title: title,
      academicYear: "2026/2027",
      generatedDate: new Date().toLocaleDateString("en-GB"),
      generatedBy: "Primary Headmaster Office",
      summary: `Detailed institutional summary report for ${category}. Comprehensive overview of primary school metrics, student document verification, and store requirement fulfillment.`,
      headers: ["Class / Stream", "Enrolled Students", "Requirements Cleared", "Pending Docs"],
      rows,
    });
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
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-bold uppercase tracking-wide">
            <School className="w-3.5 h-3.5" /> Primary Headmaster Office
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-3">
            Primary & Nursery School Operations
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mt-1">
            Executive oversight of Nursery (N1-N3) and Primary (P1-P6) departments — student census, supply requirements, and academic performance reports.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleOpenReport("Primary School Performance & Requirements Summary", "Primary Department")}
            className="px-4 py-2.5 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" /> View Primary Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-sky-700 dark:text-sky-400">
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Primary Enrolled</span>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-3">{primaryStudents.length}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">P1 through P6 Students</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-sky-700 dark:text-sky-400">
            <School className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nursery Enrolled</span>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-3">{nurseryStudents.length}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">N1 to N3 Early Childhood</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Requirements Collected</span>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-3">{requirementsPct}%</p>
          <p className="text-[11px] text-zinc-500 mt-1">Of {totalStudents} total students</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pending Docs</span>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-3">{pendingDocs}</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">Birth certs / Transfer letters</p>
        </div>
      </div>

      {/* Class Level Breakdown */}
      <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Primary Class Roster & Capacity</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Overview of streams and student verification status</p>
          </div>
          <button
            onClick={() => handleOpenReport("Primary Roster & Requirements Audit", "Roster Audit")}
            className="text-xs font-bold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
          >
            Open Full Audit Report →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nurseryClasses.map((cls) => {
            const count = students.filter((s) => s.classId === cls.id).length;
            const cap = CLASS_CAPACITY[cls.className] || 30;
            const pct = cap > 0 ? Math.round((count / cap) * 100) : 0;
            const status = pct >= 100 ? "Full" : pct >= 90 ? "Filling Fast" : "Normal";
            return (
              <div key={cls.id} className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white">{cls.className}</p>
                  <p className="text-zinc-500 text-[11px] mt-0.5">{count} / {cap} Students</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  status === "Full" ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                }`}>
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Report Modal */}
      {activeReport && (
        <ReportViewerModal report={activeReport} onClose={() => setActiveReport(null)} />
      )}
    </div>
  );
}
