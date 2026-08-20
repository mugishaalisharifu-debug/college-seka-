"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Wallet,
  Search,
  CheckCircle2,
  AlertCircle,
  Printer,
  Info,
  Users,
  TrendingUp,
  FileText,
  History,
  Tag,
  AlertTriangle,
  DollarSign,
  UserX,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";

type EducationLevel = "NURSERY" | "PRIMARY" | "LOWER SECONDARY" | "TVET";
type EducationLevelFilter = "All" | EducationLevel;

export interface FeeItem {
  id: string;
  name: string;
  amount: number;
  isMandatory: boolean;
  isBoardingOnly?: boolean;
  isDayOnly?: boolean;
  isNewStudentOnly?: boolean;
  tradeName?: string | null;
}

export interface Student {
  id: string;
  regNumber: string;
  name: string;
  educationLevel: string;
  className: string;
  tradeName?: string | null;
  parentContact: string;
  studentType: "DAY" | "BOARDING";
  isNewStudent: boolean;
  arrears: number;
  applicableFees: FeeItem[];
  totalPaid?: number;
}

export interface Payment {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  date: string;
  amountPaid: number;
  paymentMethod: string;
  academicPeriod: string;
  remarks?: string;
}

interface DbStudent {
  id: string;
  regNumber: string;
  studentName: string;
  educationLevel: string;
  classId?: string;
  tradeName?: string;
  parentName: string;
  parentPhone: string;
  studentType: "DAY" | "BOARDING";
  isNewStudent: boolean;
  status: string;
}

interface DbClass {
  id: string;
  className: string;
  scope: string;
  tradeName?: string;
}

interface DbPayment {
  id: string;
  receiptNo: string;
  studentId: string;
  amountPaid: string;
  academicPeriod: string;
  remarks?: string;
  createdAt: string;
}

interface DbDebtor {
  studentId: string;
  regNumber: string;
  studentName: string;
  className: string;
  educationLevel: string;
  tradeName?: string;
  parentName: string;
  parentPhone: string;
  totalOutstandingDebt: number;
  currentTermFee: number;
  totalPaidHistorical: number;
}

interface DbFeeStructure {
  id: string;
  academicYear: string;
  term: string;
  scope: string;
  tradeName?: string;
  name: string;
  amount: string;
  isMandatory: boolean;
  isBoardingOnly: boolean;
  isDayOnly: boolean;
  isNewStudentOnly: boolean;
}

export default function BursarDashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & selection
  const [levelFilter, setLevelFilter] = useState<EducationLevelFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [studentsRes, classesRes, paymentsRes, debtorsRes, feesRes] = await Promise.all([
          api.get<DbStudent[]>("/dos/students"),
          api.get<DbClass[]>("/dos/classes"),
          api.get<DbPayment[]>("/finance/payments"),
          api.get<DbDebtor[]>("/finance/debtors"),
          api.get<DbFeeStructure[]>("/finance/fee-structures"),
        ]);

        const classMap = new Map(classesRes.data.map((c) => [c.id, c.className]));
        const debtorMap = new Map(debtorsRes.data.map((d) => [d.studentId, d]));
        const feeMap = new Map<string, FeeItem[]>();
        feesRes.data.forEach((fee) => {
          const scope = fee.scope;
          if (!feeMap.has(scope)) feeMap.set(scope, []);
          feeMap.get(scope)!.push({
            id: fee.id,
            name: fee.name,
            amount: Number(fee.amount),
            isMandatory: fee.isMandatory,
            isBoardingOnly: fee.isBoardingOnly,
            isDayOnly: fee.isDayOnly,
            isNewStudentOnly: fee.isNewStudentOnly,
            tradeName: fee.tradeName,
          });
        });

        const mappedStudents: Student[] = studentsRes.data.map((stu) => {
          const className = stu.classId ? classMap.get(stu.classId) || "Unassigned" : "Unassigned";
          const debtor = debtorMap.get(stu.id);
          const arrears = debtor ? debtor.totalOutstandingDebt : 0;
          const paid = debtor ? debtor.totalPaidHistorical : 0;
          const applicableFees = feeMap.get(stu.educationLevel) || [];
          return {
            id: stu.id,
            regNumber: stu.regNumber,
            name: stu.studentName,
            educationLevel: stu.educationLevel,
            className,
            tradeName: stu.tradeName || null,
            parentContact: stu.parentPhone,
            studentType: stu.studentType,
            isNewStudent: stu.isNewStudent,
            arrears,
            applicableFees,
            totalPaid: paid,
          };
        });

        setStudents(mappedStudents);
        setPayments(
          paymentsRes.data.map((p) => ({
            id: p.id,
            receiptNo: p.receiptNo,
            studentId: p.studentId,
            studentName:
              mappedStudents.find((s) => s.id === p.studentId)?.name || "Unknown",
            date: new Date(p.createdAt).toISOString().split("T")[0],
            amountPaid: Number(p.amountPaid),
            paymentMethod: "CASH",
            academicPeriod: p.academicPeriod,
            remarks: p.remarks,
          }))
        );
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculated ledger metrics for selected student
  const currentTermFee = useMemo(() => {
    if (!selectedStudent?.applicableFees) return 0;
    return selectedStudent.applicableFees.reduce((sum, item) => sum + item.amount, 0);
  }, [selectedStudent]);

  const totalPaidHistorical = useMemo(() => {
    if (!selectedStudent) return 0;
    return payments
      .filter((p) => p.studentId === selectedStudent.id)
      .reduce((sum, p) => sum + p.amountPaid, 0);
  }, [payments, selectedStudent]);

  const totalCharged =
    (selectedStudent?.applicableFees?.reduce((sum, item) => sum + item.amount, 0) || 0) +
    (selectedStudent?.arrears || 0);
  const netOutstanding = Math.max(0, totalCharged - totalPaidHistorical);

  // Overall statistics
  const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);

  const getStudentOutstanding = (stu: Student) => {
    const feeSum = stu.applicableFees.reduce((sum, item) => sum + item.amount, 0);
    const paidSum = payments
      .filter((p) => p.studentId === stu.id)
      .reduce((sum, p) => sum + p.amountPaid, 0);
    return Math.max(0, feeSum + stu.arrears - paidSum);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((stu) => {
      const matchLevel = levelFilter === "All" || stu.educationLevel === levelFilter;
      const matchSearch =
        stu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stu.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stu.className.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLevel && matchSearch;
    });
  }, [levelFilter, searchQuery, students]);

  // Debtors list calculation
  const debtorsList = useMemo(() => {
    return students
      .map((stu) => {
        const debt = getStudentOutstanding(stu);
        const feeSum = stu.applicableFees.reduce((sum, item) => sum + item.amount, 0);
        const paidSum = payments
          .filter((p) => p.studentId === stu.id)
          .reduce((sum, p) => sum + p.amountPaid, 0);
        return {
          student: stu,
          outstandingDebt: debt,
          totalCharged: feeSum + stu.arrears,
          totalPaid: paidSum,
        };
      })
      .filter((item) => item.outstandingDebt > 0)
      .sort((a, b) => b.outstandingDebt - a.outstandingDebt);
  }, [students, payments]);

  const totalUnpaidDebts = useMemo(() => {
    return debtorsList.reduce((sum, item) => sum + item.outstandingDebt, 0);
  }, [debtorsList]);

  const studentPayments = selectedStudent ? payments.filter((p) => p.studentId === selectedStudent.id) : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-12 font-sans text-xs">
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
        </div>
      )}

      {error && !isLoading && (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300">
          Failed to load financial data: {error}
        </div>
      )}

      {!isLoading && !error && students.length === 0 && (
        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center">
          <p className="text-xs text-zinc-500">No student records available yet. Add students to view billing information.</p>
        </div>
      )}

      {!isLoading && !error && students.length > 0 && (
        <>
          {/* ======= HEADER ======= */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wide">
            <Wallet className="w-3.5 h-3.5" /> Finance & Financial Ledger
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Fee Collection & Student Billing Overview
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Evaluate student ledgers, track active debtors with outstanding balances, and audit unpaid debts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold flex items-center gap-2 hover:bg-zinc-200 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Statement
          </button>
          <Link
            href="/dashboard/bursar/cash-flow"
            className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Reports
          </Link>
        </div>
      </div>

      {/* Scoping note */}
      <div className="p-4 rounded-2xl border border-sky-200 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300 font-semibold flex items-start gap-3">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          <strong>Universal Billing Rules:</strong> TVET student ledgers reflect trade-specific fees. Boarding and day scholar scopes apply to Lower Secondary and TVET, while registration fees apply strictly to new students.
        </p>
      </div>

      {/* ======= SUMMARY METRICS ======= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="font-bold uppercase text-zinc-500 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Total Enrolled
          </p>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white mt-1">{students.length}</p>
          <p className="text-zinc-400 mt-0.5">Active Students</p>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="font-bold uppercase text-zinc-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Total Receipts
          </p>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {totalCollected.toLocaleString()} RWF
          </p>
          <p className="text-zinc-400 mt-0.5">Collected this Term</p>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="font-bold uppercase text-zinc-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Fully Cleared
          </p>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white mt-1">
            {students.filter((s) => getStudentOutstanding(s) === 0).length}
          </p>
          <p className="text-emerald-600 mt-0.5">Zero balance</p>
        </div>

        <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 shadow-xs">
          <p className="font-bold uppercase text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Total Outstanding Arrears
          </p>
          <p className="text-2xl font-bold font-mono text-rose-600 mt-1">
            {totalUnpaidDebts.toLocaleString()} RWF
          </p>
          <p className="text-rose-500 mt-0.5">{debtorsList.length} Active Debtors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ======= LEFT: ROSTER ======= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                Student Directory
              </span>
              <span className="font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                {filteredStudents.length}
              </span>
            </div>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as EducationLevelFilter)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-white"
            >
              <option value="All">All Education Levels</option>
              <option value="NURSERY">Nursery</option>
              <option value="PRIMARY">Primary</option>
              <option value="LOWER SECONDARY">Lower Secondary</option>
              <option value="TVET">TVET</option>
            </select>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search name, reg number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium"
              />
            </div>

            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {filteredStudents.map((stu) => {
                const outstanding = getStudentOutstanding(stu);
                const isSelected = selectedStudentId === stu.id;
                return (
                  <button
                    key={stu.id}
                    onClick={() => setSelectedStudentId(stu.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-400"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-zinc-900 dark:text-white">{stu.name}</p>
                          {stu.isNewStudent && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">New</span>
                          )}
                        </div>
                        <p className="font-mono text-zinc-500 text-[10px]">{stu.regNumber}</p>
                        <p className="text-zinc-500 text-[10px] mt-0.5">
                          {stu.educationLevel} • {stu.className} {stu.tradeName ? `(${stu.tradeName})` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {outstanding === 0 ? (
                          <span className="inline-block font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Cleared
                          </span>
                        ) : (
                          <span className="inline-block font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            {outstanding.toLocaleString()} RWF
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredStudents.length === 0 && (
                <div className="py-8 text-center text-zinc-400">No students match filter.</div>
              )}
            </div>
          </div>
        </div>

        {/* ======= RIGHT: LEDGER & DEBTORS BREAKDOWN ======= */}
        <div className="lg:col-span-8 space-y-4">
          
          {selectedStudent ? (
            <>
              {/* Selected Student Ledger Header */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-base shrink-0">
                  {selectedStudent.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base text-zinc-900 dark:text-white">
                      {selectedStudent.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                      {selectedStudent.studentType}
                    </span>
                    {selectedStudent.isNewStudent && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                        Fresh Intake
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-zinc-500 mt-0.5">
                    {selectedStudent.regNumber} • {selectedStudent.educationLevel} {selectedStudent.tradeName && `[${selectedStudent.tradeName}]`}
                  </p>
                  <p className="text-zinc-500 mt-0.5">
                    Parent Contact: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedStudent.parentContact}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-zinc-500 uppercase text-[10px]">Net Outstanding Balance</p>
                <p className={`text-2xl font-bold font-mono ${netOutstanding === 0 ? "text-emerald-700" : "text-rose-600"}`}>
                  {netOutstanding.toLocaleString()} RWF
                </p>
              </div>
            </div>

            {/* Dynamic Fee Breakdown Matrix */}
            <div className="space-y-2">
              <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase text-[10px] flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-emerald-600" /> Applicable Term Fee Breakdown
              </h4>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                {selectedStudent.applicableFees.map((fee) => (
                  <div key={fee.id} className="p-2.5 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/30">
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-white">{fee.name}</span>
                      {fee.tradeName && (
                        <span className="ml-2 px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 text-[9px] font-bold">
                          {fee.tradeName}
                        </span>
                      )}
                      {fee.isBoardingOnly && (
                        <span className="ml-2 px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[9px] font-bold">
                          Boarders Only
                        </span>
                      )}
                      {fee.isNewStudentOnly && (
                        <span className="ml-2 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                          New Intake Only
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      {fee.amount.toLocaleString()} RWF
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ledger Totals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <p className="font-bold text-zinc-500 uppercase text-[9px]">Term Fee Total</p>
                <p className="font-bold font-mono text-zinc-900 dark:text-white mt-0.5">
                  {currentTermFee.toLocaleString()} RWF
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                <p className="font-bold text-amber-600 uppercase text-[9px]">Prior Arrears</p>
                <p className="font-bold font-mono text-amber-700 dark:text-amber-400 mt-0.5">
                  {selectedStudent.arrears.toLocaleString()} RWF
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                <p className="font-bold text-emerald-600 uppercase text-[9px]">Total Paid Historical</p>
                <p className="font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {totalPaidHistorical.toLocaleString()} RWF
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50">
                <p className="font-bold text-blue-600 uppercase text-[9px]">Total Charged</p>
                <p className="font-bold font-mono text-blue-700 dark:text-blue-400 mt-0.5">
                  {totalCharged.toLocaleString()} RWF
                </p>
              </div>
            </div>
          </div>

          {/* ======= NEW SECTION: DEBTORS DIRECTORY & RECENT UNPAID DEBTS ======= */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-rose-50/30 dark:bg-rose-950/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
                  Active Debtors & Recent Unpaid Debts Breakdown
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-rose-600 bg-rose-100 dark:bg-rose-950 px-2.5 py-1 rounded-lg">
                Total Outstanding: {totalUnpaidDebts.toLocaleString()} RWF
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 text-[9px]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Level & Class</th>
                    <th className="py-3 px-4">Parent Contact</th>
                    <th className="py-3 px-4 text-right">Total Fee</th>
                    <th className="py-3 px-4 text-right">Paid</th>
                    <th className="py-3 px-4 text-right">Unpaid Balance</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {debtorsList.length > 0 ? (
                    debtorsList.map(({ student, outstandingDebt, totalCharged, totalPaid }) => (
                      <tr 
                        key={student.id} 
                        className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors ${
                          selectedStudentId === student.id ? "bg-amber-50/30 dark:bg-amber-950/10" : ""
                        }`}
                      >
                        <td className="py-3 px-4">
                          <p className="font-bold text-zinc-900 dark:text-white">{student.name}</p>
                          <p className="font-mono text-zinc-400 text-[10px]">{student.regNumber}</p>
                        </td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                          {student.educationLevel}
                          <div className="text-[10px] text-zinc-400">{student.className}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                          {student.parentContact}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-zinc-600 dark:text-zinc-400">
                          {totalCharged.toLocaleString()} RWF
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-600 font-semibold">
                          {totalPaid.toLocaleString()} RWF
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                          {outstandingDebt.toLocaleString()} RWF
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedStudentId(student.id)}
                            className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold text-[10px] text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
                          >
                            View Ledger
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-zinc-400 italic">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <UserX className="w-6 h-6 text-emerald-600" />
                          <p className="font-bold text-zinc-600 dark:text-zinc-300 mt-1">No Active Debtors</p>
                          <p className="text-[11px]">All enrolled students have cleared their school fee balances!</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History List */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-700" />
                Receipt History — {selectedStudent.name}
              </h3>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 text-[9px]">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Remarks</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {studentPayments.length > 0 ? (
                    studentPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {p.receiptNo}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-500">{p.date}</td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{p.academicPeriod}</td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{p.paymentMethod}</td>
                        <td className="py-3 px-4 text-zinc-500">{p.remarks || "N/A"}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                          + {p.amountPaid.toLocaleString()} RWF
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-zinc-400 italic">
                        No payments recorded for this student ledger yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </>
        ) : (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 p-8 shadow-xs text-center">
            <p className="text-xs text-zinc-500">No student selected. Add students to view billing details.</p>
          </div>
        )}

         </div>
        </div>
        </>
      )}
    </div>
  );
}