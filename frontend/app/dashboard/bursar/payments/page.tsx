"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Receipt, Search, History, CheckCircle2, Filter, Loader2, AlertCircle, Printer, Trash2, CalendarPlus, Users, GraduationCap } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";

import type { PaymentRecord, ScopeType, TermType } from "@/lib/fees-types";
import { addNextAcademicYear, loadAcademicYears } from "@/lib/academic-years";

interface FeeBreakdownItem {
  id: string;
  name: string;
  amount: string | number;
  isMandatory: boolean;
}

interface StudentLedgerData {
  student: {
    id: string;
    regNumber: string;
    name: string;
    educationLevel: ScopeType;
    className?: string;
    tradeName?: string;
    studentType: "DAY" | "BOARDING";
    isNewStudent: boolean;
  };
  feeBreakdown: FeeBreakdownItem[];
  paymentHistory: PaymentRecord[];
  summary: {
    currentTermFee: number;
    totalCumulativeFees: number;
    totalPaidHistorical: number;
    netOutstanding: number;
    isFullyPaid: boolean;
  };
}

// Raw row shape returned by GET /finance/ledger/:studentId
interface BackendFee {
  id: string;
  name: string;
  amount: string | number;
  isMandatory: boolean;
}
interface BackendLedgerSummary {
  currentTermFee: number;
  totalCumulativeFees: number;
  totalPaidHistorical: number;
  netOutstandingDebt: number;
  isFullyPaid: boolean;
}
interface BackendLedger {
  student: {
    id: string;
    regNumber: string;
    name: string;
    educationLevel: ScopeType;
    className?: string;
    tradeName?: string;
    studentType: "DAY" | "BOARDING";
    isNewStudent: boolean;
  };
  currentTermFeeBreakdown: BackendFee[];
  paymentHistory: PaymentRecord[];
  summary: BackendLedgerSummary;
}

// Class row returned by GET /dos/classes (access allowed for Bursar).
interface BackendClass {
  id: string;
  className: string;
  scope: string;
  tradeName?: string | null;
}

// Map the backend ledger shape onto the shape the UI renders.
function mapLedger(l: BackendLedger): StudentLedgerData {
  return {
    student: {
      id: l.student.id,
      regNumber: l.student.regNumber,
      name: l.student.name,
      educationLevel: l.student.educationLevel,
      className: l.student.className,
      tradeName: l.student.tradeName,
      studentType: l.student.studentType,
      isNewStudent: l.student.isNewStudent,
    },
    feeBreakdown: (l.currentTermFeeBreakdown || []).map((f) => ({
      id: f.id,
      name: f.name,
      amount: Number(f.amount),
      isMandatory: f.isMandatory,
    })),
    paymentHistory: l.paymentHistory || [],
    summary: {
      currentTermFee: l.summary.currentTermFee,
      totalCumulativeFees: l.summary.totalCumulativeFees,
      totalPaidHistorical: l.summary.totalPaidHistorical,
      netOutstanding: l.summary.netOutstandingDebt,
      isFullyPaid: l.summary.isFullyPaid,
    },
  };
}

export default function StudentFeeLedgerComponent() {
  const [students, setStudents] = useState<StudentLedgerData[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // School class list (Bursar sees all classes via /dos/classes).
  const [classes, setClasses] = useState<BackendClass[]>([]);

  // Search and Categorical Filters
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterClass, setFilterClass] = useState<string>("ALL");
  const [filterTrade, setFilterTrade] = useState<string>("ALL");

  // Academic Period State — the system lets the bursar set the academic year
  // (from the persisted list, plus "add next year" like every other module).
  const [availableYears, setAvailableYears] = useState<string[]>(() => loadAcademicYears());
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(() => {
    const years = loadAcademicYears();
    // Prefer the school's current operational year; fall back to the newest saved.
    return years.includes("2026-2027")
      ? "2026-2027"
      : years[years.length - 1] || "2026-2027";
  });
  const [selectedTerm, setSelectedTerm] = useState<TermType>("TERM_1");

  // Form State
  const [amountToPay, setAmountToPay] = useState<number | "">(50000);
  const [remarks, setRemarks] = useState<string>("School Fee Deposit");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Let the bursar create/set an extra academic year on the fly.
  const handleAddAcademicYear = () => {
    const updated = addNextAcademicYear(availableYears, selectedAcademicYear);
    setAvailableYears(updated);
    setSelectedAcademicYear(updated[updated.length - 1]);
  };

  // Load the full school class list so the class filter always reflects every
  // class available in the school (not only classes that currently have data).
  useEffect(() => {
    api
      .get<BackendClass[]>("/dos/classes")
      .then((res) => setClasses(res.data || []))
      .catch(() => {
        // Non-fatal: the class filter falls back to the student-derived list.
      });
  }, []);

  // Keep the selected class consistent with the chosen category.
  useEffect(() => {
    if (filterCategory === "ALL" || filterClass === "ALL") return;
    const cls = classes.find((c) => c.className === filterClass);
    if (cls && cls.scope !== filterCategory) setFilterClass("ALL");
  }, [filterCategory, filterClass, classes]);

  // Active student ledger selection
  const activeLedger = useMemo(
    () => students.find((s) => s.student.id === selectedStudentId) || students[0],
    [students, selectedStudentId]
  );

  const activePeriodString = `${selectedAcademicYear} ${selectedTerm}`;

  // Load the full student roster and each student's live ledger from the backend.
  const loadLedgers = useCallback(async () => {
    if (!selectedAcademicYear || !selectedTerm) return;
    setIsLoadingStudents(true);
    setLoadError(null);
    try {
      const rosterRes = await api.get<{ id: string }[]>("/dos/students");
      const ledgerRes = await Promise.all(
        rosterRes.data.map((s) =>
          api.get<BackendLedger>(`/finance/ledger/${s.id}`, {
            params: { academicYear: selectedAcademicYear, term: selectedTerm },
          })
        )
      );
      const mapped = ledgerRes.map((r) => mapLedger(r.data));
      setStudents(mapped);
      setSelectedStudentId((prev) => {
        if (prev && mapped.some((m) => m.student.id === prev)) return prev;
        return mapped[0]?.student.id || "";
      });
    } catch (err) {
      setLoadError(getApiErrorMessage(err, "Failed to load student ledgers."));
    } finally {
      setIsLoadingStudents(false);
    }
  }, [selectedAcademicYear, selectedTerm]);

  useEffect(() => {
    loadLedgers();
  }, [loadLedgers]);

  // Dynamically extract unique Class names and Trade names for filter dropdowns.
  // The class list is the full school roster from /dos/classes (scoped by the
  // selected category), merged with classes students actually belong to.
  const availableClasses = useMemo(() => {
    const classesSet = new Set<string>();
    students.forEach((s) => {
      if (s.student.className) classesSet.add(s.student.className);
    });
    classes.forEach((c) => {
      if (filterCategory === "ALL" || c.scope === filterCategory) {
        classesSet.add(c.className);
      }
    });
    return Array.from(classesSet);
  }, [classes, students, filterCategory]);

  const availableTrades = useMemo(() => {
    const tradesSet = new Set<string>();
    students.forEach((s) => {
      if (s.student.tradeName) tradesSet.add(s.student.tradeName);
    });
    return Array.from(tradesSet);
  }, [students]);

  // Enhanced Filter Logic
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const searchLower = studentSearch.toLowerCase();
      const matchesSearch =
        s.student.name.toLowerCase().includes(searchLower) ||
        s.student.regNumber.toLowerCase().includes(searchLower);

      const matchesCategory =
        filterCategory === "ALL" || s.student.educationLevel === filterCategory;

      const matchesClass =
        filterClass === "ALL" || s.student.className === filterClass;

      const matchesTrade =
        filterTrade === "ALL" || s.student.tradeName === filterTrade;

      return matchesSearch && matchesCategory && matchesClass && matchesTrade;
    });
  }, [students, studentSearch, filterCategory, filterClass, filterTrade]);

  // When filtering to a specific class (or search), keep the active student
  // within the visible roster so the bursar always sees the chosen class' work.
  useEffect(() => {
    if (filteredStudents.length === 0) return;
    if (!filteredStudents.some((s) => s.student.id === selectedStudentId)) {
      setSelectedStudentId(filteredStudents[0].student.id);
    }
  }, [filteredStudents, selectedStudentId]);

  // Payment history for selected active period
  const periodFilteredPayments = useMemo(() => {
    if (!activeLedger) return [];
    return activeLedger.paymentHistory.filter(
      (p) => p.academicPeriod === activePeriodString
    );
  }, [activeLedger, activePeriodString]);

  const totalPaidInPeriod = useMemo(() => {
    return periodFilteredPayments.reduce(
      (sum, p) => sum + Number(p.amountPaid),
      0
    );
  }, [periodFilteredPayments]);

  const handlePostPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const payVal = Number(amountToPay);
    if (!activeLedger || payVal <= 0) return;

    try {
      await api.post("/finance/payments", {
        studentId: activeLedger.student.id,
        amountPaid: payVal,
        academicPeriod: activePeriodString,
        remarks: remarks || undefined,
      });
      toast.success("Payment recorded successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to record the payment."));
      return;
    }

    setIsSuccess(true);
    setAmountToPay("");
    setTimeout(() => setIsSuccess(false), 3000);
    // Refresh ledgers so the summary and history reflect the new payment.
    await loadLedgers();
  };

  // Build a printable HTML receipt/statement for a student's period payments.
  const buildReceiptHtml = (
    ledger: StudentLedgerData,
    payments: { receiptNo: string; amountPaid: string | number; academicPeriod: string; remarks?: string | null; createdAt: string }[],
    title: string
  ): string => {
    const total = payments.reduce((s, p) => s + Number(p.amountPaid), 0);
    const rows =
      payments.length > 0
        ? payments
            .map(
              (p) =>
                `<tr>
                  <td>${p.receiptNo}</td>
                  <td>${p.createdAt}</td>
                  <td>${p.academicPeriod}</td>
                  <td>${p.remarks || "-"}</td>
                  <td style="text-align:right">${Number(p.amountPaid).toLocaleString()} RWF</td>
                </tr>`
            )
            .join("")
        : `<tr><td colspan="5" style="text-align:center;color:#999">No payments recorded for this period.</td></tr>`;

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #18181b; padding: 24px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  h2 { font-size: 13px; margin: 0 0 16px; color: #047857; }
  .school { font-size: 11px; color: #52525b; border-bottom: 2px solid #047857; padding-bottom: 10px; margin-bottom: 14px; }
  .meta { font-size: 12px; margin-bottom: 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { text-align: left; background: #f4f4f5; padding: 6px 8px; border-bottom: 1px solid #e4e4e7; }
  td { padding: 6px 8px; border-bottom: 1px solid #f4f4f5; }
  .total { font-weight: 700; font-size: 12px; }
  .footer { font-size: 10px; color: #71717a; margin-top: 18px; border-top: 1px solid #e4e4e7; padding-top: 10px; }
</style>
</head>
<body>
  <h1>College Foundation of Sina & Gerard</h1>
  <div class="school">${title} — generated ${new Date().toLocaleString()}</div>
  <div class="meta">
    <strong>Student:</strong> ${ledger.student.name} (${ledger.student.regNumber})<br>
    <strong>Level:</strong> ${ledger.student.educationLevel}${ledger.student.className ? " — " + ledger.student.className : ""}<br>
    <strong>Type:</strong> ${ledger.student.studentType}${ledger.student.isNewStudent ? " • New Student" : ""}
  </div>
  <table>
    <thead>
      <tr><th>Receipt #</th><th>Date</th><th>Period</th><th>Remarks</th><th style="text-align:right">Amount</th></tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td colspan="4" style="text-align:right;font-weight:700">TOTAL PAID</td><td style="text-align:right;font-weight:700">${total.toLocaleString()} RWF</td></tr></tfoot>
  </table>
  <div class="footer">This is a system-generated receipt. Please retain it for your records.</div>
</body>
</html>`;
  };

  const handlePrintReceipt = () => {
    if (!activeLedger) return;
    const payments = activeLedger.paymentHistory.filter(
      (p) => p.academicPeriod === activePeriodString
    );
    const win = window.open("", "_blank", "width=560,height=700");
    if (!win) {
      toast.error("Please allow pop-ups to print the receipt.");
      return;
    }
    win.document.write(
      buildReceiptHtml(activeLedger, payments, `Payment Receipt — ${activeLedger.student.name}`)
    );
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 250);
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm("Delete this payment record? This cannot be undone.")) return;
    try {
      await api.delete(`/finance/payments/${paymentId}`);
      toast.success("Payment record deleted.");
      await loadLedgers();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete the payment record."));
    }
  };

  return (
    <div className="space-y-3.5 max-w-7xl mx-auto pb-8 font-sans text-xs">
      {/* Top Header & Period Selector */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 bg-white dark:bg-zinc-900 flex flex-wrap justify-between items-center gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 dark:text-white">
              Student Fee Ledger Station
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Record fee payments and review student accounts across academic terms.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-1.5 rounded-lg">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase">Target Period:</span>
          
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold px-2 py-1 rounded-md"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddAcademicYear}
            title="Add the next academic year so fees can be set/recorded for the following year"
            className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" />
          </button>

          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value as TermType)}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold px-2 py-1 rounded-md"
          >
            <option value="TERM_1">Term 1</option>
            <option value="TERM_2">Term 2</option>
            <option value="TERM_3">Term 3</option>
          </select>
        </div>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl px-3 py-2 text-[11px] font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {loadError}
        </div>
      )}

      {isLoadingStudents && (
        <div className="flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 px-3 py-6 text-xs text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading student ledgers for {activePeriodString}...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left Column: Multi-Filter Search & Student Selection List */}
        {!isLoadingStudents && (
        <div className="lg:col-span-4 space-y-3">
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 p-3 shadow-2xs space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search name or reg no..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs"
              />
            </div>

            {/* Categorical Dropdown Filters */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {/* Category Scope Filter */}
              <div>
                <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-0.5">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] p-1 rounded-md"
                >
                  <option value="ALL">All Categories</option>
                  <option value="NURSERY">Nursery</option>
                  <option value="PRIMARY">Primary</option>
                  <option value="LOWER SECONDARY">Lower Secondary</option>
                  <option value="TVET">TVET</option>
                </select>
              </div>

              {/* Class Filter */}
              <div>
                <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-0.5">Class</label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] p-1 rounded-md"
                >
                  <option value="ALL">All Classes</option>
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Trade Filter (Enabled conditionally if TVET selected or available) */}
              <div className="col-span-2">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-0.5">Trade / Specialty</label>
                <select
                  value={filterTrade}
                  onChange={(e) => setFilterTrade(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] p-1 rounded-md"
                >
                  <option value="ALL">All Trades</option>
                  {availableTrades.map((trade) => (
                    <option key={trade} value={trade}>{trade}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Student List Display */}
            <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-2">
              <span className="text-[9px] font-bold uppercase text-zinc-400 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Students ({filteredStudents.length})
              </span>
              <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                {filterClass !== "ALL"
                  ? filterClass
                  : filterCategory !== "ALL"
                    ? filterCategory
                    : "All Classes"}
              </span>
            </div>
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <p className="text-center text-zinc-400 italic py-4 text-[11px]">
                  No students found matching filters.
                </p>
              ) : (
                filteredStudents.map((item) => {
                  const isSelected = activeLedger?.student.id === item.student.id;
                  const outstanding = item.summary.netOutstanding;

                  return (
                    <div
                      key={item.student.id}
                      onClick={() => setSelectedStudentId(item.student.id)}
                      className={`p-2.5 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500"
                          : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 text-[11px]">{item.student.name}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          {item.student.regNumber} {item.student.className ? `• ${item.student.className}` : ""}
                        </p>
                      </div>
                      <div className="text-right font-mono">
                        <p className={`text-[10px] font-bold ${outstanding > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                          {outstanding > 0 ? `${outstanding.toLocaleString()} RWF` : "Paid"}
                        </p>
                        <span className="text-[9px] text-zinc-400 uppercase block">{item.student.educationLevel}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        )}

        {/* Right Column: Active Student Ledger & Payment Entry Form */}
        {!isLoadingStudents && (
        <div className="lg:col-span-8 space-y-3.5">
          {activeLedger && (
            <>
              {/* Selected student header with quick actions */}
              <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white text-sm">{activeLedger.student.name}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {activeLedger.student.regNumber} • {activeLedger.student.className || activeLedger.student.educationLevel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeLedger.summary.isFullyPaid ? (
                    <span className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3 inline mr-1" /> Fully Paid
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-bold border border-rose-200 dark:border-rose-800">
                      Outstanding: {activeLedger.summary.netOutstanding.toLocaleString()} RWF
                    </span>
                  )}
                  <button
                    onClick={handlePrintReceipt}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-[10px] flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Printer className="w-3 h-3" /> Print Receipt
                  </button>
                </div>
              </div>

              {/* Financial Metrics Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
                  <p className="text-[9px] font-bold uppercase text-zinc-400">Current Term Fee</p>
                  <p className="text-sm font-bold font-mono text-zinc-900 dark:text-white mt-1">
                    {activeLedger.summary.currentTermFee.toLocaleString()} RWF
                  </p>
                  <p className="text-[9px] text-zinc-400 mt-0.5">Assigned fee structure total</p>
                </div>

                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
                  <p className="text-[9px] font-bold uppercase text-zinc-400 flex items-center gap-1">
                    <History className="w-3 h-3 text-emerald-500" /> Total Paid
                  </p>
                  <p className="text-sm font-bold font-mono text-emerald-600 mt-1">
                    {activeLedger.summary.totalPaidHistorical.toLocaleString()} RWF
                  </p>
                  <p className="text-[9px] text-zinc-400 mt-0.5">Historical payments aggregate</p>
                </div>

                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
                  <p className="text-[9px] font-bold uppercase text-zinc-400">Net Outstanding</p>
                  <p className="text-sm font-bold font-mono text-rose-600 mt-1">
                    {activeLedger.summary.netOutstanding.toLocaleString()} RWF
                  </p>
                  <p className="text-[9px] text-zinc-400 mt-0.5">Cumulative unpaid balance</p>
                </div>
              </div>

              {/* Term Fee Breakdown for the selected period */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-2xs overflow-hidden">
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                    Term Fee Breakdown ({activePeriodString})
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {activeLedger.feeBreakdown.length} fee head(s)
                  </span>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {activeLedger.feeBreakdown.length === 0 ? (
                    <p className="p-4 text-center text-zinc-400 italic text-[11px]">
                      No fee heads configured for this level/period.
                    </p>
                  ) : (
                    activeLedger.feeBreakdown.map((f) => (
                      <div key={f.id} className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px]">{f.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${f.isMandatory ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                            {f.isMandatory ? "Mandatory" : "Optional"}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-zinc-900 dark:text-white text-[11px]">
                          {Number(f.amount).toLocaleString()} RWF
                        </span>
                      </div>
                    ))
                  )}
                  <div className="flex items-center justify-between px-3 py-2 bg-zinc-50/60 dark:bg-zinc-800/40">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300 text-[11px]">Total Term Fee</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">
                      {activeLedger.summary.currentTermFee.toLocaleString()} RWF
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Entry Form */}
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-2xs space-y-3">
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <h3 className="font-bold text-xs text-zinc-900 dark:text-white">
                    Record Payment for <span className="text-emerald-600">{activeLedger.student.name}</span>
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {activeLedger.student.className || activeLedger.student.educationLevel}
                  </span>
                </div>

                {isSuccess && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Payment recorded successfully!
                  </div>
                )}

                <form onSubmit={handlePostPayment} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Amount Paid (RWF)</label>
                    <input
                      type="number"
                      value={amountToPay}
                      onChange={(e) => setAmountToPay(Number(e.target.value))}
                      placeholder="e.g. 50000"
                      className="w-full p-2 border border-zinc-200 dark:border-zinc-700 rounded-md font-mono font-bold text-xs bg-zinc-50 dark:bg-zinc-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Remarks / Narration</label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. Bank deposit reference"
                      className="w-full p-2 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs bg-zinc-50 dark:bg-zinc-800"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-1">
                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md text-xs transition-colors cursor-pointer"
                    >
                      Post Payment ({activePeriodString})
                    </button>
                  </div>
                </form>
              </div>

              {/* Payment History Logs */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-2xs overflow-hidden">
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                    Payment History Logs (<span className="text-emerald-600">{activePeriodString}</span>)
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Total Paid in Period: {totalPaidInPeriod.toLocaleString()} RWF
                  </span>
                </div>

                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400 font-bold uppercase text-[9px]">
                      <th className="py-2 px-3">Receipt No</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Period</th>
                      <th className="py-2 px-3">Remarks</th>
                      <th className="py-2 px-3 text-right">Amount Paid</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {periodFilteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-zinc-400 italic text-[11px]">
                          No payments recorded for {activePeriodString} yet.
                        </td>
                      </tr>
                    ) : (
                      periodFilteredPayments.map((tx) => (
                        <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="py-2 px-3 font-mono font-bold text-emerald-600">{tx.receiptNo}</td>
                          <td className="py-2 px-3 text-zinc-500">{tx.createdAt}</td>
                          <td className="py-2 px-3 font-semibold">{tx.academicPeriod}</td>
                          <td className="py-2 px-3 text-zinc-600 dark:text-zinc-300">{tx.remarks || "-"}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                            {Number(tx.amountPaid).toLocaleString()} RWF
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  if (!activeLedger) return;
                                  const win = window.open("", "_blank", "width=560,height=700");
                                  if (win) {
                                    win.document.write(buildReceiptHtml(activeLedger, [tx], `Receipt — ${tx.receiptNo}`));
                                    win.document.close();
                                    win.focus();
                                    setTimeout(() => win.print(), 250);
                                  }
                                }}
                                title="Print this receipt"
                                className="p-1 rounded text-zinc-400 hover:text-emerald-600 transition-colors cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePayment(tx.id)}
                                title="Delete this payment record"
                                className="p-1 rounded text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        )}
      </div>
    </div>
  );
}