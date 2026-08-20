"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  Users,
  Boxes,
  ShieldCheck,
  AlertTriangle,
  Eye,
  FileText,
  Loader2,
} from "lucide-react";
import ReportViewerModal, { ReportData } from "@/components/dashboard/ReportViewerModal";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";

interface TvetStudent {
  id: string;
  studentName: string;
  educationLevel: string;
  tradeName?: string;
  classId?: string;
  status?: string;
}

interface TvetClass {
  id: string;
  className: string;
  scope: string;
  tradeName?: string;
}

export default function DosTvetDashboard() {
  const [activeReport, setActiveReport] = useState<ReportData | null>(null);
  const [students, setStudents] = useState<TvetStudent[]>([]);
  const [classes, setClasses] = useState<TvetClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [studentsRes, classesRes] = await Promise.all([
          api.get<TvetStudent[]>("/dos/students"),
          api.get<TvetClass[]>("/dos/classes"),
        ]);
        setStudents(studentsRes.data);
        setClasses(classesRes.data);
      } catch (error) {
        console.error("Failed to load TVET dashboard data:", getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const tvetStudents = students.filter((s) => s.educationLevel === "TVET");
  const tvetClasses = classes.filter((c) => c.scope === "TVET");
  const uniqueTrades = new Set(tvetClasses.map((c) => c.tradeName).filter(Boolean));

  const handleOpenReport = () => {
    setActiveReport(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wide">
            <Wrench className="w-3.5 h-3.5" /> DOS TVET / Technical & Vocational
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-3">
            TVET Department & Trades Oversight
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mt-1">
            Manage TVET trade programs (L3-L5), verify L3 entry result slips, review student uploaded items, and generate exportable reports.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard/dos-tvet/students"
            className="px-4 py-2.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Users className="w-4 h-4" /> TVET Student List
          </Link>
          <button
            onClick={handleOpenReport}
            className="px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-amber-600" /> View TVET Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">TVET Enrolled</span>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-3">{tvetStudents.length}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Across {uniqueTrades.size} Trade Options</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Active Trade Workshops</span>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-3">{uniqueTrades.size}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Registered TVET classes</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Class Streams</span>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-3">{tvetClasses.length}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Total TVET classes</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Student Status</span>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-3">
            {tvetStudents.filter((s) => s.status === "ACTIVE").length}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Active students</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">TVET Trades & Level Distribution</h3>
              <p className="text-xs text-zinc-500">Student enrollment and result slip clearance</p>
            </div>
            <Link href="/dashboard/dos-tvet/classes" className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline">
              Manage Trade Classes →
            </Link>
          </div>

          <div className="space-y-3">
            {tvetClasses.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-8">No TVET classes found. Create classes to see trade distribution.</p>
            ) : (
              tvetClasses.map((cls) => {
                const enrolled = tvetStudents.filter((s) => s.classId === cls.id).length;
                return (
                  <div key={cls.id} className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white">{cls.className}</p>
                      <p className="text-zinc-500 text-[11px] mt-0.5">Enrolled: {enrolled} Students</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold uppercase">
                        {enrolled} / {enrolled} Cleared
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">TVET DOS Actions</h3>
          <p className="text-xs text-zinc-500">Student list upload & document verification</p>

          <div className="space-y-3 pt-2">
            <Link
              href="/dashboard/dos-tvet/students"
              className="w-full p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-all"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-700" />
                <span>Upload / Manage TVET Roster</span>
              </div>
              <span>→</span>
            </Link>

            <button
              onClick={handleOpenReport}
              className="w-full p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Preview & Print TVET Report</span>
              </div>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Report Modal */}
      {activeReport && (
        <ReportViewerModal report={activeReport} onClose={() => setActiveReport(null)} />
      )}
    </div>
  );
}
