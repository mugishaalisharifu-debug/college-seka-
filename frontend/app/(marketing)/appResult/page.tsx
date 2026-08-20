"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Info, CheckCircle2, X, ArrowLeft } from "lucide-react";
import api from "@/lib/api";

interface ApprovedStudent {
  id: number;
  name: string;
  level: string;
  assignedClass: string;
}

interface PersonalResult {
  applicantName: string;
  applicationCode: string;
  educationLevel: string;
  status: "Admitted" | "Pending" | "Rejected";
  assignedClass?: string;
  note?: string;
}

export default function ApplicationStatusPage() {
  const [tableSearch, setTableSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvedStudents, setApprovedStudents] = useState<ApprovedStudent[]>([]);
  const [listError, setListError] = useState("");
  
  const [appCode, setAppCode] = useState("");
  const [phone, setPhone] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [personalResult, setPersonalResult] = useState<PersonalResult | null>(null);

  useEffect(() => {
    api
      .get<ApprovedStudent[]>("/applications/public/admitted")
      .then((res) => setApprovedStudents(res.data || []))
      .catch(() => setListError("Could not load the admitted students list."));
  }, []);

  const filteredStudents = approvedStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
      student.level.toLowerCase().includes(tableSearch.toLowerCase()) ||
      student.assignedClass.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const handlePersonalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setIsLookingUp(true);
    try {
      const res = await api.get<PersonalResult | null>("/applications/public/status", {
        params: { referenceCode: appCode, phone },
      });
      setPersonalResult(res.data);
    } catch {
      setPersonalResult(null);
    } finally {
      setIsLookingUp(false);
    }
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setAppCode("");
    setPhone("");
    setHasSearched(false);
    setPersonalResult(null);
  };

  return (
    <main className="min-h-screen pt-28 md:pt-36 pb-20 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto">
        
        <Link
          href="/apply"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admissions</span>
        </Link>

        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200 leading-relaxed">
            Successful applicants should visit the school administration office with original documents to complete registration within two weeks of this publication.
          </p>
        </div>

        <div className=" rounded-3xl border border-amber-900/10 dark:border-zinc-800 shadow-sm overflow-hidden mb-12">
          
          <div className="p-6 md:p-8 border-b border-amber-900/10 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-sans text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
                Admitted Students List
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Academic Year 2026/2027 Admission Results
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search name or level..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-[#fcf8f2] dark:bg-zinc-800/80 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-900/5 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider border-b border-amber-900/10 dark:border-zinc-800">
                  <th className="py-4 px-6">#</th>
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Education Level</th>
                  <th className="py-4 px-6">Assigned Class / Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/10 dark:divide-zinc-800 text-sm">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-amber-900/2 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-zinc-500">
                        {student.id}
                      </td>
                      <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-white">
                        {student.name}
                      </td>
                      <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">
                        {student.level}
                      </td>
                      <td className="py-4 px-6 font-semibold text-emerald-700 dark:text-emerald-400">
                        {student.assignedClass}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500 text-sm">
                      No matching student found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center rounded-3xl border border-amber-900/10 dark:border-zinc-800 p-8 shadow-sm">
          <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
            Not on the list? Check your individual application status.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
          >
            Check Your Status
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#faf3e8] dark:bg-zinc-900 w-full max-w-md rounded-3xl border border-amber-900/10 dark:border-zinc-800 p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            <button
              onClick={resetModal}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-amber-900/5 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-sans text-xl font-bold text-zinc-900 dark:text-white mb-1">
              Check Personal Status
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6">
              Enter your Application Code and Phone Number.
            </p>

            <form onSubmit={handlePersonalSearch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Application Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CFSG-2026-8941"
                  value={appCode}
                  onChange={(e) => setAppCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-[#fcf8f2] dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+250 788 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-[#fcf8f2] dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <Search className="w-4 h-4" />
                <span>Verify Status</span>
              </button>
            </form>

            {hasSearched && (
              <div className="mt-6 pt-6 border-t border-amber-900/10 dark:border-zinc-800">
                {personalResult ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500 font-medium">Applicant:</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{personalResult.applicantName}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500 font-medium">Assigned Class:</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">{personalResult.assignedClass}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-start gap-2.5 mt-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-800 dark:text-emerald-300 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                          Status: {personalResult.status}
                        </p>
                        <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                          {personalResult.note}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-amber-100/70 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-center">
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Record Not Found / Under Review
                    </p>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1">
                      Check your code or contact admissions directly.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}