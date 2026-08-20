"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  GraduationCap,
  User,
  Phone,
  Mail,
  CalendarDays,
  CreditCard,
  Banknote,
  Receipt,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Download,
  Hash,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AcademicScope, EducationCategory, getScopeConfig } from "@/lib/role-scope";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";

// ==========================================
// TYPES & MOCK DATA
// ==========================================
interface FeeRecord {
  id: string;
  receiptNo: string;
  date: string;
  amount: number;
  method: string;
  period: string;
  remarks: string;
}

interface RequirementItem {
  label: string;
  status: "Received" | "Not Received" | "Pending Review";
}

interface StudentProfileData {
  id: string;
  fullName: string;
  gender: "Male" | "Female";
  dob: string;
  nationalId: string;
  category: EducationCategory;
  className: string;
  stream: string;
  admissionNo: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  termFee: number;
  arrears: number;
  totalPaid: number;
  feeHistory: FeeRecord[];
  requirements: RequirementItem[];
}

// Backend row shapes used to build the dynamic profile.
interface BackendStudent {
  id: string;
  regNumber?: string | null;
  studentName: string;
  gender: "Male" | "Female" | null;
  dateOfBirth?: string | null;
  educationLevel: string;
  tradeName?: string | null;
  classId?: string | null;
  parentName: string;
  parentPhone: string;
  studentType?: string;
  status?: string;
}

interface BackendClass {
  id: string;
  className: string;
  scope: string;
  tradeName?: string | null;
}

interface BackendPayment {
  id: string;
  receiptNo: string;
  amountPaid: string | number;
  academicPeriod: string;
  remarks?: string | null;
  createdAt: string;
}

function backendLevelToCategory(level: string): EducationCategory {
  switch (level) {
    case "NURSERY":
      return "Nursery";
    case "PRIMARY":
      return "Primary";
    case "LOWER SECONDARY":
      return "Lower Secondary";
    case "TVET":
      return "TVET";
    default:
      return "Primary";
  }
}

// Standard registration checklist shown on the Requirements tab.
// Day-to-day verification is performed by the Requirement Collector office.
const DEFAULT_REQUIREMENTS: RequirementItem[] = [
  { label: "Birth Certificate", status: "Pending Review" },
  { label: "Previous School Report", status: "Pending Review" },
  { label: "Passport Photo", status: "Pending Review" },
  { label: "Medical Report", status: "Pending Review" },
  { label: "School Uniform", status: "Pending Review" },
];

export default function StudentProfile({ scope }: { scope: AcademicScope }) {
  const config = getScopeConfig(scope);
  const params = useParams();
  const studentId = (params?.id as string) || "";

  const [activeTab, setActiveTab] = useState<
    "overview" | "fees" | "requirements"
  >("overview");

  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [studentsRes, classesRes] = await Promise.all([
          api.get<BackendStudent[]>("/dos/students"),
          api.get<BackendClass[]>("/dos/classes"),
        ]);

        // Bursar-only route; DOS sees an empty ledger when the route is not accessible.
        const paymentsData: BackendPayment[] = await api
          .get<BackendPayment[]>(
            studentId ? `/finance/payments?studentId=${studentId}` : "/finance/payments",
          )
          .then((r) => r.data)
          .catch(() => [] as BackendPayment[]);

        if (cancelled) return;

        const stu = (studentsRes.data || []).find((s) => s.id === studentId);
        if (!stu) {
          setLoadError("Student not found in the database.");
          return;
        }

        const classMap = new Map(
          (classesRes.data || []).map((c) => [c.id, c.className]),
        );
        const className = stu.classId && classMap.get(stu.classId) ? classMap.get(stu.classId)! : "";

        const feeHistory: FeeRecord[] = (paymentsData || []).map((p) => ({
          id: p.id,
          receiptNo: p.receiptNo,
          date: new Date(p.createdAt).toISOString().slice(0, 10),
          amount: Number(p.amountPaid) || 0,
          method: "Paid",
          period: p.academicPeriod || "",
          remarks: p.remarks || "",
        }));

        const totalPaid = feeHistory.reduce((sum, f) => sum + f.amount, 0);

        setProfile({
          id: stu.id,
          fullName: stu.studentName || "Unnamed Student",
          gender: stu.gender || "Male",
          dob: stu.dateOfBirth ? new Date(stu.dateOfBirth).toISOString().slice(0, 10) : "—",
          nationalId: stu.regNumber || stu.id,
          category: backendLevelToCategory(stu.educationLevel),
          className: className || stu.tradeName || stu.educationLevel,
          stream: stu.tradeName || "",
          admissionNo: stu.regNumber || stu.id,
          guardianName: stu.parentName || "—",
          guardianPhone: stu.parentPhone || "—",
          guardianEmail: "",
          termFee: 0,
          arrears: 0,
          totalPaid,
          feeHistory,
          requirements: DEFAULT_REQUIREMENTS,
        });
      } catch (error) {
        if (!cancelled) {
          setLoadError(getApiErrorMessage(error, "Could not load the student profile."));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, scope]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-20 text-xs font-bold text-zinc-500">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
        Loading student profile from the database...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-3xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h2 className="font-bold text-rose-800 dark:text-rose-300 text-base">
          Student profile unavailable
        </h2>
        <p className="text-xs text-rose-700 dark:text-rose-400">{loadError}</p>
        <Link
          href={`${config.basePath}/students`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Student Directory
        </Link>
      </div>
    );
  }

  const netOutstanding = Math.max(0, profile.arrears + profile.termFee - profile.totalPaid);
  const requirementReceived = profile.requirements.filter((r) => r.status === "Received").length;

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: User },
    { key: "fees" as const, label: "Fees & Billing", icon: CreditCard },
    { key: "requirements" as const, label: "Requirements", icon: ClipboardCheck },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`${config.basePath}/students`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-emerald-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Student Directory
          </Link>
          <h1 className="font-sans text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-emerald-700 dark:text-emerald-400" />
            Student Profile
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Complete academic, financial, and requirement record for {profile.fullName}.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center gap-2 hover:bg-zinc-50 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Profile
          </button>
          <button
            onClick={() => alert("Exporting student profile data...")}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Header Identity Card */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-md">
            {profile.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>

          {/* Identity Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">
                {profile.fullName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase">
                {profile.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase">
                Active
              </span>
            </div>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1">
              {profile.stream} • {profile.className}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" /> {profile.admissionNo}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> {profile.gender}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" /> DOB: {profile.dob}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Term Fee</p>
          <p className="text-lg font-bold font-mono text-zinc-900 dark:text-white mt-1">
            {profile.termFee.toLocaleString()} RWF
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            {profile.totalPaid.toLocaleString()} paid
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Outstanding</p>
          <p className="text-lg font-bold font-mono text-rose-600 mt-1">
            {netOutstanding.toLocaleString()} RWF
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Includes arrears</p>
        </div>

        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Requirements Met</p>
          <p className="text-lg font-bold font-mono text-emerald-700 mt-1">
            {requirementReceived}/{profile.requirements.length}
          </p>
          <p className="text-[10px] text-amber-600 mt-0.5">Some pending review</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-amber-900/10 dark:border-zinc-800 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-amber-900/5 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-amber-900/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal & Guardian Info */}
          <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700" /> Personal & Guardian Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Full Name</p>
                <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{profile.fullName}</p>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                <p className="text-[10px] text-zinc-400 font-bold uppercase">National ID / LIN</p>
                <p className="font-mono text-zinc-900 dark:text-white mt-0.5">{profile.nationalId}</p>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Guardian / Parent</p>
                <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{profile.guardianName}</p>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Guardian Phone</p>
                <p className="font-mono text-zinc-900 dark:text-white mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {profile.guardianPhone}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 sm:col-span-2">
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Guardian Email</p>
                <p className="text-zinc-900 dark:text-white mt-0.5 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {profile.guardianEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Academic Placement */}
          <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" /> Academic Placement
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Education Category</p>
                <p className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{profile.category}</p>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Class / Level</p>
                <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{profile.className}</p>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 sm:col-span-2">
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Stream / Trade</p>
                <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{profile.stream}</p>
              </div>
            </div>

            {/* Quick Academic Actions */}
            <div className="pt-3 border-t border-amber-900/10 dark:border-zinc-800 flex flex-wrap gap-2">
              <Link
                href={`${config.basePath}/classes`}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-800"
              >
                <TrendingUp className="w-3.5 h-3.5" /> Manage Class
              </Link>
              <Link
                href={`${config.basePath}/students`}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center gap-1.5 hover:bg-zinc-50"
              >
                <GraduationCap className="w-3.5 h-3.5" /> Student Directory
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* FEES TAB */}
      {activeTab === "fees" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-emerald-600" /> Total Paid
              </p>
              <p className="text-xl font-bold font-mono text-emerald-700 mt-1">{profile.totalPaid.toLocaleString()} RWF</p>
            </div>
            <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Arrears
              </p>
              <p className="text-xl font-bold font-mono text-amber-600 mt-1">{profile.arrears.toLocaleString()} RWF</p>
            </div>
            <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-rose-600" /> Net Outstanding
              </p>
              <p className="text-xl font-bold font-mono text-rose-600 mt-1">{netOutstanding.toLocaleString()} RWF</p>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-amber-900/10 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-700" /> Payment History
              </h3>
              <Link
                href="/dashboard/bursar/payments"
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Manage in Bursar
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-900/5 dark:bg-zinc-800/60 border-b border-amber-900/10 dark:border-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Receipt #</th>
                    <th className="px-5 py-3">Period</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Remarks</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-900/10 dark:divide-zinc-800">
                  {profile.feeHistory.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="px-5 py-3 font-mono text-zinc-500">{tx.date}</td>
                      <td className="px-5 py-3 font-mono font-bold text-emerald-600">{tx.receiptNo}</td>
                      <td className="px-5 py-3 text-zinc-700 dark:text-zinc-300">{tx.period}</td>
                      <td className="px-5 py-3 text-zinc-500">{tx.method}</td>
                      <td className="px-5 py-3 text-zinc-500">{tx.remarks}</td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                        +{tx.amount.toLocaleString()} RWF
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REQUIREMENTS TAB */}
      {activeTab === "requirements" && (
        <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-emerald-700" /> Registration Requirements Checklist
            </h3>
            <Link
              href="/dashboard/requirement-collector/student-check"
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Manage in Requirement Collector
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.requirements.map((req) => (
              <div
                key={req.label}
                className="p-3.5 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex items-center justify-between"
              >
                <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">{req.label}</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    req.status === "Received"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : req.status === "Not Received"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {req.status === "Received" && <CheckCircle2 className="w-3 h-3 inline mr-0.5" />}
                  {req.status}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-amber-900/10 dark:border-zinc-800 flex items-center">
            <FileText className="w-4 h-4 text-emerald-600 mr-2" />
            <span className="text-xs text-zinc-500">
              {requirementReceived} of {profile.requirements.length} requirements received. Missing items flagged for action.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
