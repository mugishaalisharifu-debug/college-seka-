"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Check,
  RotateCcw,
  Boxes,
  ShieldCheck,
  Phone,
  Sparkles,
  Calendar,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";

// ==========================================
// TYPES
// ==========================================

export type AcademicTerm = "Term 1" | "Term 2" | "Term 3";

export interface RequirementItem {
  id: string;
  name: string;
  category: "Boarding / Tools" | "Academic Supplies" | "Personal Care / Fees";
  scope: "PRIMARY" | "LOWER SECONDARY" | "TVET" | "NURSERY" | "All";
  classId?: string | null;
  className?: string | null;
  academicYear: string;
  applicableTerms: AcademicTerm[];
  description?: string;
}

export interface ClassOption {
  id: string;
  className: string;
  scope: "PRIMARY" | "LOWER SECONDARY" | "TVET" | "NURSERY" | "All";
  tradeName?: string | null;
}

export interface TermCheckInRecord {
  academicYear: string;
  term: AcademicTerm;
  broughtItemIds: string[];
  notes?: string;
}

export interface StudentCheckInRecord {
  id: string;
  studentName: string;
  classId: string;
  className: string;
  educationLevel: "PRIMARY" | "LOWER SECONDARY" | "TVET" | "NURSERY" | "All";
  parentPhone: string;
  checkInHistory: TermCheckInRecord[];
}

// Academic Year Options
const ACADEMIC_YEARS = ["2025-2026", "2026-2027", "2027-2028", "2028-2029", "2029-2030"];
const ACADEMIC_TERMS: AcademicTerm[] = ["Term 1", "Term 2", "Term 3"];

export default function StudentCheckInTab() {
  const [students, setStudents] = useState<StudentCheckInRecord[]>([]);
  const [classList, setClassList] = useState<ClassOption[]>([]);
  const [masterRequirements, setMasterRequirements] = useState<RequirementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Global Context State for Inspection Period
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("2025-2026");
  const [selectedTerm, setSelectedTerm] = useState<AcademicTerm>("Term 1");

  // Roster Filters
  const [selectedClassId, setSelectedClassId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CLEARED" | "INCOMPLETE">("ALL");
  const [levelFilter, setLevelFilter] = useState<"ALL" | "NURSERY" | "PRIMARY" | "LOWER SECONDARY" | "TVET">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStudentId, setActiveStudentId] = useState<string>("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [classesRes, masterRes, checkInRes] = await Promise.all([
          api.get<ClassOption[]>("/requirements/classes"),
          api.get<RequirementItem[]>("/requirements/master"),
          api.get<any[]>("/requirements/checkin-directory"),
        ]);

        setClassList(classesRes.data);
        setMasterRequirements(masterRes.data);

        const transformedStudents: StudentCheckInRecord[] = checkInRes.data.map((st: any) => ({
          id: st.id,
          studentName: st.studentName,
          classId: st.classId,
          className: st.className || "N/A",
          educationLevel: st.educationLevel || "All",
          parentPhone: st.parentPhone || "",
          checkInHistory: [
            {
              academicYear: selectedAcademicYear,
              term: selectedTerm,
              broughtItemIds: st.broughtItemIds || [],
              notes: st.notes || "",
            },
          ],
        }));

        setStudents(transformedStudents);
        if (transformedStudents.length > 0) {
          setActiveStudentId(transformedStudents[0].id);
        }
      } catch (error) {
        console.error("Failed to load requirement data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Active student object
  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === activeStudentId) || students[0];
  }, [students, activeStudentId]);

  // Helper: Retrieve active student's check-in record for current selected year/term
  const getStudentTermCheckIn = (student: StudentCheckInRecord) => {
    return (
      student.checkInHistory.find(
        (h) => h.academicYear === selectedAcademicYear && h.term === selectedTerm
      ) || { academicYear: selectedAcademicYear, term: selectedTerm, broughtItemIds: [], notes: "" }
    );
  };

  // Helper: Dynamically resolve tools assigned to active student based on scope, classId, Year, and Term
  const getRequirementsForStudent = (student: StudentCheckInRecord) => {
    return masterRequirements.filter((req) => {
      const matchYear = req.academicYear === selectedAcademicYear;
      const matchTerm = req.applicableTerms.includes(selectedTerm);
      if (!matchYear || !matchTerm) return false;

      if (req.classId && req.classId === student.classId) return true;
      if (req.scope === student.educationLevel) return true;
      if (req.scope === "All" && !req.classId) return true;
      return false;
    });
  };

  const activeStudentRequirements = useMemo(() => {
    return getRequirementsForStudent(activeStudent);
  }, [activeStudent, masterRequirements, selectedAcademicYear, selectedTerm]);

  // Helper: check if student is fully cleared based on selected Term & Year requirements
  const isStudentCleared = (student: StudentCheckInRecord) => {
    const required = getRequirementsForStudent(student);
    if (required.length === 0) return true;
    const termRecord = getStudentTermCheckIn(student);
    return required.every((req) => termRecord.broughtItemIds.includes(req.id));
  };

  // Update check-in record helper
  const updateActiveStudentCheckIn = (
    updateFn: (currentBrought: string[], currentNotes?: string) => { broughtItemIds: string[]; notes?: string }
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== activeStudentId) return s;

        const existingHistory = [...s.checkInHistory];
        const recordIndex = existingHistory.findIndex(
          (h) => h.academicYear === selectedAcademicYear && h.term === selectedTerm
        );

        const currentRecord =
          recordIndex >= 0
            ? existingHistory[recordIndex]
            : { academicYear: selectedAcademicYear, term: selectedTerm, broughtItemIds: [], notes: "" };

        const updated = updateFn(currentRecord.broughtItemIds, currentRecord.notes);

        if (recordIndex >= 0) {
          existingHistory[recordIndex] = { ...currentRecord, ...updated };
        } else {
          existingHistory.push({
            academicYear: selectedAcademicYear,
            term: selectedTerm,
            ...updated,
          });
        }

        return { ...s, checkInHistory: existingHistory };
      })
    );
  };

  // Toggle single item for current term/year
  const handleToggleItem = (itemId: string) => {
    updateActiveStudentCheckIn((broughtItemIds, notes) => {
      const isBrought = broughtItemIds.includes(itemId);
      const updatedIds = isBrought
        ? broughtItemIds.filter((id) => id !== itemId)
        : [...broughtItemIds, itemId];
      return { broughtItemIds: updatedIds, notes };
    });
  };

  // Check all applicable items at once for current term/year
  const handleSelectAll = () => {
    const activeReqIds = activeStudentRequirements.map((r) => r.id);
    updateActiveStudentCheckIn((broughtItemIds, notes) => {
      return {
        broughtItemIds: Array.from(new Set([...broughtItemIds, ...activeReqIds])),
        notes,
      };
    });
  };

  // Uncheck all items for current term/year
  const handleClearAll = () => {
    updateActiveStudentCheckIn((_, notes) => ({ broughtItemIds: [], notes }));
  };

  // Save Notes for current term/year
  const handleUpdateNotes = (notesText: string) => {
    updateActiveStudentCheckIn((broughtItemIds) => ({ broughtItemIds, notes: notesText }));
  };

  // Triggers API saving simulation
  const triggerSaveNotification = () => {
    setSaveSuccessMsg(
      `Clearance record saved for ${activeStudent.studentName} (${selectedAcademicYear} - ${selectedTerm})`
    );
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Filtered Student Directory
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesClass = selectedClassId === "ALL" || s.classId === selectedClassId;
      const matchesLevel = levelFilter === "ALL" || s.educationLevel === levelFilter;
      const isCleared = isStudentCleared(s);
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "CLEARED" && isCleared) ||
        (statusFilter === "INCOMPLETE" && !isCleared);

      const matchesSearch =
        s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesClass && matchesLevel && matchesStatus && matchesSearch;
    });
  }, [students, selectedClassId, levelFilter, statusFilter, searchQuery, selectedAcademicYear, selectedTerm]);

  // Group active requirements by category
  const itemsByCategory = useMemo(() => {
    return {
      "Boarding / Tools": activeStudentRequirements.filter((r) => r.category === "Boarding / Tools"),
      "Academic Supplies": activeStudentRequirements.filter((r) => r.category === "Academic Supplies"),
      "Personal Care / Fees": activeStudentRequirements.filter((r) => r.category === "Personal Care / Fees"),
    };
  }, [activeStudentRequirements]);

  const activeTermRecord = getStudentTermCheckIn(activeStudent);
  const activeBroughtCount = activeStudentRequirements.filter((r) =>
    activeTermRecord.broughtItemIds.includes(r.id)
  ).length;

  const activeTotalCount = activeStudentRequirements.length;
  const activeIsCleared = isStudentCleared(activeStudent);

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* SUCCESS TOAST */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-bold">{saveSuccessMsg}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-8 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
          <span className="text-xs font-bold">Loading requirement data...</span>
        </div>
      )}

      {/* HEADER WITH ACADEMIC YEAR & TERM CONTROLS */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Reporting Gate Inspection
          </span>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
            Student Physical Requirements Inspection
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            Verify tools, academic materials, and receipts assigned per academic term and year
          </p>
        </div>

        {/* Global Academic Period Selector */}
        <div className="flex flex-wrap items-center gap-2 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-2 rounded-2xl">
          <div className="flex items-center gap-1.5 px-2 text-emerald-800 dark:text-emerald-300 font-bold">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Inspection Period:</span>
          </div>

          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-800 font-bold text-zinc-900 dark:text-white cursor-pointer"
          >
            {ACADEMIC_YEARS.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value as AcademicTerm)}
            className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-800 font-bold text-zinc-900 dark:text-white cursor-pointer"
          >
            {ACADEMIC_TERMS.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ==========================================
            LEFT PANEL: STUDENT DIRECTORY
        ========================================== */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-700" /> Student Directory
            </h2>
            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              {filteredStudents.length} Students
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs focus:outline-none"
            />
          </div>

          {/* Class, Level and Status Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              <option value="ALL">Class: All</option>
              {classList.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.className}
                </option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as typeof levelFilter)}
              className="w-full px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              <option value="ALL">Level: All</option>
              <option value="NURSERY">Nursery</option>
              <option value="PRIMARY">Primary</option>
              <option value="LOWER SECONDARY">Lower Secondary</option>
              <option value="TVET">TVET</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              <option value="ALL">Status: All</option>
              <option value="CLEARED">Cleared Only</option>
              <option value="INCOMPLETE">Incomplete Only</option>
            </select>
          </div>

          {/* Scrollable Student Directory Cards */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((st) => {
                const cleared = isStudentCleared(st);
                const isSelected = activeStudentId === st.id;
                const totalReqs = getRequirementsForStudent(st).length;
                const termRecord = getStudentTermCheckIn(st);
                const broughtReqsCount = termRecord.broughtItemIds.filter((id) =>
                  getRequirementsForStudent(st).some((r) => r.id === id)
                ).length;

                return (
                  <div
                    key={st.id}
                    onClick={() => setActiveStudentId(st.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs"
                        : "border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-zinc-900 dark:text-white text-xs">{st.studentName}</h3>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {st.className} • {st.educationLevel}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {selectedTerm}: Brought {broughtReqsCount} / {totalReqs} items
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        cleared
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {cleared ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {cleared ? "Cleared" : "Pending"}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-zinc-400 italic">
                No students match the selected filters.
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            RIGHT PANEL: CLASS & TERM-BOUND CHECKLIST
        ========================================== */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-5">
          {/* Active Student Info Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Inspecting Entry Checklist
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-md">
                  Class: {activeStudent.className}
                </span>
                <span className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-md">
                  {selectedAcademicYear} • {selectedTerm}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white mt-0.5">
                {activeStudent.studentName}
              </h2>
              <p className="text-[11px] text-zinc-500 font-mono flex items-center gap-2 mt-0.5">
                <span className="truncate max-w-[150px]">ID: {activeStudent.id}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {activeStudent.parentPhone}
                </span>
              </p>
            </div>

            {/* Clearance Badge */}
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                activeIsCleared
                  ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  : "bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800 text-amber-900 dark:text-amber-200"
              }`}
            >
              {activeIsCleared ? (
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
              )}
              <div>
                <p className="font-extrabold text-xs">
                  {activeIsCleared ? "CLEARED FOR ENTRY" : "INCOMPLETE KIT"}
                </p>
                <p className="text-[10px] opacity-90 font-mono">
                  {activeBroughtCount} of {activeTotalCount} Items Confirmed
                </p>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">Quick Toggles:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all"
              >
                <Check className="w-3 h-3" /> Mark All Brought
              </button>
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-200 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all"
              >
                <RotateCcw className="w-3 h-3" /> Reset All
              </button>
            </div>
          </div>

          {/* CATEGORIZED CLASS & TERM-SPECIFIC CHECKLIST */}
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {Object.entries(itemsByCategory).map(([categoryName, categoryItems]) => {
              if (categoryItems.length === 0) return null;

              return (
                <div key={categoryName} className="space-y-2">
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-1">
                    {categoryName}
                  </h3>

                  <div className="space-y-2">
                    {categoryItems.map((item) => {
                      const isChecked = activeTermRecord.broughtItemIds.includes(item.id);

                      return (
                        <label
                          key={item.id}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isChecked
                              ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30"
                              : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/20 hover:border-zinc-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleItem(item.id)}
                              className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                            />
                            <div>
                              <span
                                className={`font-bold text-xs ${
                                  isChecked
                                    ? "text-emerald-950 dark:text-emerald-200"
                                    : "text-zinc-800 dark:text-zinc-200"
                                }`}
                              >
                                {item.name}
                              </span>
                              {item.className && (
                                <span className="ml-2 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                                  Specific to {item.className}
                                </span>
                              )}
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              isChecked
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                                : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                            }`}
                          >
                            {isChecked ? "Brought" : "Missing"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {activeStudentRequirements.length === 0 && (
              <div className="text-center py-10 text-zinc-400 italic">
                No physical requirements configured for this student for {selectedAcademicYear} - {selectedTerm}.
              </div>
            )}
          </div>

          {/* Remarks / Missing Commitment Field */}
          <div className="space-y-1.5 border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <label className="font-bold text-zinc-700 dark:text-zinc-300 text-[11px]">
              Receptionist Remarks ({selectedAcademicYear} - {selectedTerm}):
            </label>
            <input
              type="text"
              placeholder="e.g. Parent pledged to bring missing item by tomorrow morning..."
              value={activeTermRecord.notes || ""}
              onChange={(e) => handleUpdateNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white"
            />
          </div>

          {/* Confirm & Save Button */}
          <button
            onClick={triggerSaveNotification}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4" /> Save Student Clearance Record
          </button>
        </div>
      </div>
    </div>
  );
}