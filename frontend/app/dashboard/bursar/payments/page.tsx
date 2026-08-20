"use client";

import React, { useState, useMemo } from "react";
import { Receipt, Search, History, CheckCircle2, Filter } from "lucide-react";

import type { PaymentRecord, ScopeType, TermType } from "@/lib/fees-types";

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
    totalPaidHistorical: number;
    netOutstanding: number;
    isFullyPaid: boolean;
  };
}

export default function StudentFeeLedgerComponent() {
  const [students, setStudents] = useState<StudentLedgerData[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("STU-101");

  // Search and Categorical Filters
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterClass, setFilterClass] = useState<string>("ALL");
  const [filterTrade, setFilterTrade] = useState<string>("ALL");

  // Academic Period State
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("2025-2026");
  const [selectedTerm, setSelectedTerm] = useState<TermType>("TERM_1");

  // Form State
  const [amountToPay, setAmountToPay] = useState<number | "">(50000);
  const [remarks, setRemarks] = useState<string>("School Fee Deposit");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Active student ledger selection
  const activeLedger = useMemo(
    () => students.find((s) => s.student.id === selectedStudentId) || students[0],
    [students, selectedStudentId]
  );

  const activePeriodString = `${selectedAcademicYear} ${selectedTerm}`;

  // Dynamically extract unique Class names and Trade names for filter dropdowns
  const availableClasses = useMemo(() => {
    const classesSet = new Set<string>();
    students.forEach((s) => {
      if (s.student.className) classesSet.add(s.student.className);
    });
    return Array.from(classesSet);
  }, [students]);

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

  const handlePostPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const payVal = Number(amountToPay);
    if (!activeLedger || payVal <= 0) return;

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newPayment: PaymentRecord = {
      id: `TX-${Date.now()}`,
      receiptNo: `REC-${new Date().getFullYear()}-${randomCode}`,
      amountPaid: payVal,
      academicPeriod: activePeriodString,
      remarks,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setStudents((prev) =>
      prev.map((item) => {
        if (item.student.id !== activeLedger.student.id) return item;

        const updatedHistory = [newPayment, ...item.paymentHistory];
        const newTotalPaid = item.summary.totalPaidHistorical + payVal;
        const newOutstanding = Math.max(0, item.summary.currentTermFee - newTotalPaid);

        return {
          ...item,
          paymentHistory: updatedHistory,
          summary: {
            ...item.summary,
            totalPaidHistorical: newTotalPaid,
            netOutstanding: newOutstanding,
            isFullyPaid: newOutstanding === 0,
          },
        };
      })
    );

    setIsSuccess(true);
    setAmountToPay("");
    setTimeout(() => setIsSuccess(false), 3000);
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
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2026-2027">2026-2027</option>
          </select>

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left Column: Multi-Filter Search & Student Selection List */}
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
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto border-t border-zinc-100 dark:border-zinc-800 pt-2">
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

        {/* Right Column: Active Student Ledger & Payment Entry Form */}
        <div className="lg:col-span-8 space-y-3.5">
          {activeLedger && (
            <>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {periodFilteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-zinc-400 italic text-[11px]">
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}