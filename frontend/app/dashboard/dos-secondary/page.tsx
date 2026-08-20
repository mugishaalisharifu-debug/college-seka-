"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Boxes,
  ShieldCheck,
  AlertTriangle,
  Eye,
  FileText,
  Loader2,
} from "lucide-react";
import ReportViewerModal, { ReportData } from "@/components/dashboard/ReportViewerModal";
import { StatSkeleton, CardSkeleton } from "@/components/ui/Skeleton";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";

interface SecondaryStudent {
  id: string;
  studentName: string;
  educationLevel: string;
  classId?: string;
  status?: string;
}

interface SecondaryClass {
  id: string;
  className: string;
  scope: string;
}

export default function DosSecondaryDashboard() {
  const [activeReport, setActiveReport] = useState<ReportData | null>(null);
  const [students, setStudents] = useState<SecondaryStudent[]>([]);
  const [classes, setClasses] = useState<SecondaryClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [studentsRes, classesRes] = await Promise.all([
          api.get<SecondaryStudent[]>("/dos/students"),
          api.get<SecondaryClass[]>("/dos/classes"),
        ]);
        setStudents(studentsRes.data);
        setClasses(classesRes.data);
      } catch (error) {
        console.error("Failed to load Secondary dashboard data:", getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const secondaryStudents = students.filter((s) => s.educationLevel === "LOWER SECONDARY");
  const secondaryClasses = classes.filter((c) => c.scope === "LOWER SECONDARY");

  const handleOpenReport = () => {
    setActiveReport(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
        <StatSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CardSkeleton count={2} />
          </div>
          <div>
            <CardSkeleton count={1} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wide">
            <GraduationCap className="w-3.5 h-3.5" /> DOS Lower Secondary
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-3">
            Lower Secondary Academic Management
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mt-1">
            Oversee Senior 1 to Senior 3 academic streams, upload and update student lists with parent information, verify S3 Result Slips, and view interactive reports.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard/dos-secondary/students"
            className="px-4 py-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Users className="w-4 h-4" /> Manage Student List
          </Link>
          <button
            onClick={handleOpenReport}
            className="px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-blue-600" /> View Reports
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-400">
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">S1 - S3 Students</span>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-3">{secondaryStudents.length}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">{secondaryClasses.length} Active Streams</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Active Classes</span>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-3">{secondaryClasses.length}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Registered streams</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Student Status</span>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-3">
            {secondaryStudents.filter((s) => s.status === "ACTIVE").length}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Active students</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-400">
            <Boxes className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Enrolled</span>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-3">{secondaryStudents.length}</p>
          <p className="text-[11px] text-zinc-500 mt-1">All secondary students</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Lower Secondary Stream Allocation</h3>
              <p className="text-xs text-zinc-500">Student list status by class and stream</p>
            </div>
            <Link href="/dashboard/dos-secondary/classes" className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline">
              Manage Streams →
            </Link>
          </div>

          <div className="space-y-3">
            {secondaryClasses.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-8">No secondary classes found. Create classes to see stream allocation.</p>
            ) : (
              secondaryClasses.map((cls) => {
                const enrolled = secondaryStudents.filter((s) => s.classId === cls.id).length;
                return (
                  <div key={cls.id} className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white">{cls.className}</p>
                      <p className="text-zinc-500 text-[11px] mt-0.5">Enrolled: {enrolled} students</p>
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
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Quick DOS Actions</h3>
          <p className="text-xs text-zinc-500">Student list management & report previewing</p>

          <div className="space-y-3 pt-2">
            <Link
              href="/dashboard/dos-secondary/students"
              className="w-full p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200 hover:bg-blue-100 transition-all"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-700" />
                <span>Upload / Import Student List</span>
              </div>
              <span>→</span>
            </Link>

            <button
              onClick={handleOpenReport}
              className="w-full p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Preview & Print Academic Report</span>
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
