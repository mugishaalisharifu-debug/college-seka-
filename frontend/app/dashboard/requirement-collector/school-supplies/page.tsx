"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  ListChecks,
  Trash2,
  CheckCircle2,
  Boxes,
  Search,
  Calendar,
  CalendarPlus,
} from "lucide-react";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";
import { loadAcademicYears, addNextAcademicYear } from "@/lib/academic-years";

// ==========================================
// TYPES (Aligned with Backend Drizzle Schema)
// ==========================================

export type RequirementCategory =
  | "Boarding / Tools"
  | "Academic Supplies"
  | "Personal Care / Fees";

export type SectionScope =
  | "All"
  | "NURSERY"
  | "PRIMARY"
  | "LOWER SECONDARY"
  | "TVET";

export type AcademicTerm = "Term 1" | "Term 2" | "Term 3";

export interface ClassOption {
  id: string;
  className: string;
  scope: SectionScope;
  tradeName?: string | null;
}

export interface MasterRequirementItem {
  id: string;
  name: string;
  category: RequirementCategory;
  scope: SectionScope;
  classId: string | null;
  className: string | null;
  academicYear: string;
  applicableTerms: AcademicTerm[];
  description?: string | null;
  createdAt?: string | null;
}

// Academic Year & Term Options — the year list grows as the school adds future years.
const ACADEMIC_TERMS: AcademicTerm[] = ["Term 1", "Term 2", "Term 3"];

interface MasterRow {
  id: string;
  name: string;
  category: RequirementCategory;
  scope: SectionScope;
  classId: string | null;
  academicYear: string;
  description?: string | null;
  createdAt: string | null;
}

export default function RequirementsSetupTab() {
  const [masterList, setMasterList] = useState<MasterRequirementItem[]>([]);
  const [classList, setClassList] = useState<ClassOption[]>([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>("ALL");
  const [selectedTermFilter, setSelectedTermFilter] = useState<string>("ALL");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [selectedScopeFilter, setSelectedScopeFilter] = useState<string>("ALL");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState<RequirementCategory>("Boarding / Tools");
  const [scope, setScope] = useState<SectionScope>("All");
  const [selectedClassId, setSelectedClassId] = useState<string>("NONE");
  const [academicYear, setAcademicYear] = useState<string>("2026-2027");
  const [availableYears, setAvailableYears] = useState<string[]>(() => loadAcademicYears());
  const [selectedTerms, setSelectedTerms] = useState<AcademicTerm[]>(["Term 1"]);
  const [description, setDescription] = useState("");

  // Add the NEXT academic year so the system keeps working year after year.
  const handleAddAcademicYear = () => {
    const nextList = addNextAcademicYear(availableYears, academicYear);
    setAvailableYears(nextList);
    setAcademicYear(nextList[nextList.length - 1]); // auto-select the new year
  };

  // Load classes and master items from the backend
  const loadData = async () => {
    try {
      const [classesRes, masterRes] = await Promise.all([
        api.get<ClassOption[]>("/requirements/classes"),
        api.get<MasterRow[]>("/requirements/master"),
      ]);
      setClassList(classesRes.data);
      setMasterList(
        masterRes.data.map((row) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          scope: row.scope,
          classId: row.classId,
          className: classesRes.data.find((c) => c.id === row.classId)?.className ?? null,
          academicYear: row.academicYear,
          applicableTerms: ["Term 1"],
          description: row.description,
          createdAt: row.createdAt,
        })),
      );
    } catch (error) {
      alert(getApiErrorMessage(error, "Failed to load requirement configuration."));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handler: Select Specific Class and Auto-Sync Scope
  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId);
    if (classId !== "NONE") {
      const selectedClass = classList.find((c) => c.id === classId);
      if (selectedClass) {
        setScope(selectedClass.scope);
      }
    }
  };

  // Handler: Toggle Term Selection in Form
  const handleTermCheckboxToggle = (term: AcademicTerm) => {
    setSelectedTerms((prev) =>
      prev.includes(term) ? prev.filter((t) => t !== term) : [...prev, term]
    );
  };

  // Add Item Handler (POST /requirements/master)
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedTerms.length === 0) return;

    try {
      await api.post("/requirements/master", {
        name: name.trim(),
        category,
        scope: scope !== "All" ? scope : undefined,
        classId: selectedClassId !== "NONE" ? selectedClassId : undefined,
        academicYear,
        description: description.trim() || undefined,
      });

      // Reset Form
      setName("");
      setDescription("");
      setSelectedClassId("NONE");
      setScope("All");
      setSelectedTerms(["Term 1"]);

      await loadData();

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      alert(getApiErrorMessage(error, "Failed to add the requirement item."));
    }
  };

  // Delete Item Handler (DELETE /requirements/master/:id)
  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to remove this item from the master checklist?")) {
      try {
        await api.delete(`/requirements/master/${id}`);
        await loadData();
      } catch (error) {
        alert(getApiErrorMessage(error, "Failed to delete the requirement item."));
      }
    }
  };

  // Filtered Directory Computation
  const filteredList = useMemo(() => {
    return masterList.filter((item) => {
      const matchesYear =
        selectedYearFilter === "ALL" || item.academicYear === selectedYearFilter;
      const matchesTerm =
        selectedTermFilter === "ALL" ||
        item.applicableTerms.includes(selectedTermFilter as AcademicTerm);
      const matchesCategory =
        selectedCategoryFilter === "ALL" || item.category === selectedCategoryFilter;
      const matchesScope =
        selectedScopeFilter === "ALL" || item.scope === selectedScopeFilter;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesYear && matchesTerm && matchesCategory && matchesScope && matchesSearch;
    });
  }, [
    masterList,
    selectedYearFilter,
    selectedTermFilter,
    selectedCategoryFilter,
    selectedScopeFilter,
    searchQuery,
  ]);

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* SUCCESS TOAST */}
      {showSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Requirement Item Configured!</p>
            <p className="text-[11px] opacity-90">
              Item added to master requirement list for gate clearance.
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            School Configuration
          </span>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
            School Requirements & Tools Setup
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            Configure required tools assigned per academic year, term, educational level, or specific class
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 px-3.5 py-2 rounded-xl text-emerald-800 dark:text-emerald-200 font-bold text-xs">
          <ListChecks className="w-4 h-4 text-emerald-600" />
          <span>{masterList.length} Items Configured</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ==========================================
            1. CREATE NEW REQUIREMENT FORM (5 Cols)
        ========================================== */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4 h-fit">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-700" /> Add Requirement Item
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Specify requirement details, academic period, and target assignment
            </p>
          </div>

          <form onSubmit={handleAddItem} className="space-y-3.5">
            {/* Item Name */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Item Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hoe (Isuka), Ream of Paper, Laptop..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white font-medium"
              />
            </div>

            {/* Academic Year Selector */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Academic Year <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1">
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white cursor-pointer"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddAcademicYear}
                  title={`Add the next academic year for the following school year`}
                  className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all cursor-pointer shrink-0"
                >
                  <CalendarPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Applicable Terms (Checkboxes) */}
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Applicable Term(s) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                {ACADEMIC_TERMS.map((term) => {
                  const isSelected = selectedTerms.includes(term);
                  return (
                    <label
                      key={term}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                        isSelected
                          ? "bg-emerald-100 border-emerald-300 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-700 dark:text-emerald-200"
                          : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTermCheckboxToggle(term)}
                        className="w-3.5 h-3.5 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                      />
                      {term}
                    </label>
                  );
                })}
              </div>
              {selectedTerms.length === 0 && (
                <p className="text-[10px] text-rose-500">Please select at least one applicable term.</p>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RequirementCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white cursor-pointer"
              >
                <option value="Boarding / Tools">Boarding / Tools (Hoe, Broom, Bucket)</option>
                <option value="Academic Supplies">Academic Supplies (Paper, Books, Laptops)</option>
                <option value="Personal Care / Fees">Personal Care / Fees (Haircut Fee, Badge)</option>
              </select>
            </div>

            {/* Educational Scope Dropdown */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Educational Level Scope <span className="text-rose-500">*</span>
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as SectionScope)}
                disabled={selectedClassId !== "NONE"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white cursor-pointer disabled:opacity-50"
              >
                <option value="All">All Students (School-wide)</option>
                <option value="NURSERY">NURSERY</option>
                <option value="PRIMARY">PRIMARY</option>
                <option value="LOWER SECONDARY">LOWER SECONDARY</option>
                <option value="TVET">TVET</option>
                <option value="NURSERY">NURSERY</option>
              </select>
            </div>

            {/* Class Binding */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Assign to Specific Class (Optional)
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => handleClassSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white cursor-pointer"
              >
                <option value="NONE">None (Apply to whole scope selected above)</option>
                {classList.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.className} ({cls.scope}
                    {cls.tradeName ? ` - ${cls.tradeName}` : ""})
                  </option>
                ))}
              </select>
            </div>

            {/* Description / Specific Specs */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Instructions / Specific Specs
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Scientific Calculator for Accounting students..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={selectedTerms.length === 0}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Save Requirement Item
            </button>
          </form>
        </div>

        {/* ==========================================
            2. MASTER CHECKLIST DIRECTORY TABLE (7 Cols)
        ========================================== */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-700" /> Configured Requirements Directory
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Items enforced during gate check-in on reporting day per term & year
              </p>
            </div>
          </div>

          {/* Filters & Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="relative sm:col-span-2 lg:col-span-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search item or spec..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs focus:outline-none"
              />
            </div>

            <select
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(e.target.value)}
              className="px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              <option value="ALL">Year: All</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>

            <select
              value={selectedTermFilter}
              onChange={(e) => setSelectedTermFilter(e.target.value)}
              className="px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              <option value="ALL">Term: All</option>
              {ACADEMIC_TERMS.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              <option value="ALL">Category: All</option>
              <option value="Boarding / Tools">Boarding / Tools</option>
              <option value="Academic Supplies">Academic Supplies</option>
              <option value="Personal Care / Fees">Personal Care / Fees</option>
            </select>

            <select
              value={selectedScopeFilter}
              onChange={(e) => setSelectedScopeFilter(e.target.value)}
              className="px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              <option value="ALL">Scope: All</option>
              <option value="All">All Students</option>
              <option value="NURSERY">NURSERY</option>
              <option value="PRIMARY">PRIMARY</option>
              <option value="LOWER SECONDARY">LOWER SECONDARY</option>
              <option value="TVET">TVET</option>
              <option value="NURSERY">NURSERY</option>
            </select>
          </div>

          {/* Master Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                  <th className="py-2.5 px-3">Item Name & Instructions</th>
                  <th className="py-2.5 px-3">Academic Period</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Target Assignment</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredList.length > 0 ? (
                  filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-zinc-900 dark:text-white">{item.name}</p>
                        {item.description && (
                          <p className="text-[10px] text-zinc-400 mt-0.5">{item.description}</p>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-zinc-800 dark:text-zinc-200">{item.academicYear}</p>
                        <p className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                          {item.applicableTerms.join(", ")}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">
                          {item.className ? `Class: ${item.className}` : `Scope: ${item.scope}`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Remove from checklist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-zinc-400 italic">
                      No configuration items match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}