"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { AcademicScope, EducationCategory, getScopeConfig } from "@/lib/role-scope";

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

// Mock full profile for a specific student
const STUDENT_PROFILE: StudentProfileData = {
  id: "STU-2026-001",
  fullName: "Jean Paul Nshimiyimana",
  gender: "Male",
  dob: "2009-04-12",
  nationalId: "1 2009 04 123 00012",
  category: "TVET",
  className: "Level 4 (L4)",
  stream: "L4 Software Dev - Stream A",
  admissionNo: "CFSG-2026-8941",
  guardianName: "Pierre Mugisha",
  guardianPhone: "+250 788 123 456",
  guardianEmail: "p.mugisha@gmail.com",
  termFee: 290000,
  arrears: 50000,
  totalPaid: 240000,
  feeHistory: [
    { id: "TX-901", receiptNo: "REC-2026-0881", date: "2026-08-05", amount: 150000, method: "Mobile Money", period: "2026 - Term 1", remarks: "Partial fee payment" },
    { id: "TX-902", receiptNo: "REC-2026-0890", date: "2026-08-10", amount: 90000, method: "Bank Transfer", period: "2026 - Term 1", remarks: "Balance clearance on arrears" },
  ],
  requirements: [
    { label: "Birth Certificate", status: "Received" },
    { label: "Previous School Report", status: "Received" },
    { label: "Passport Photo", status: "Received" },
    { label: "Medical Report", status: "Pending Review" },
    { label: "School Uniform", status: "Received" },
    { label: "TVET Practical Kit", status: "Not Received" },
  ],
};

export default function StudentProfile({ scope }: { scope: AcademicScope }) {
  const config = getScopeConfig(scope);

  const [activeTab, setActiveTab] = useState<
    "overview" | "fees" | "requirements"
  >("overview");

  const profile = STUDENT_PROFILE;

  const netOutstanding = profile.arrears + profile.termFee - profile.totalPaid;
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
