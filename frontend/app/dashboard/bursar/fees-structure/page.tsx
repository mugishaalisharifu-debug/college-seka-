"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Save, Layers, Plus, Trash2, CheckCircle2, Settings, CalendarPlus, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";
import type {
  AppliesToType,
  FeeStructureItem,
  ScopeType,
  TermType,
} from "@/lib/fees-types";
import {
  ACADEMIC_TERMS,
  addNextAcademicYear,
  loadAcademicYears,
  nextAcademicYear,
} from "@/lib/academic-years";

// Raw row shape returned by GET /finance/fee-structures
interface BackendFeeStructure {
  id: string;
  academicYear: string;
  term: string;
  scope: string;
  tradeName?: string | null;
  name: string;
  amount: string;
  isMandatory: boolean;
  isBoardingOnly: boolean;
  isDayOnly: boolean;
  isNewStudentOnly: boolean;
  customReason?: string | null;
}

const DEFAULT_FEE_ITEMS: Record<ScopeType, FeeStructureItem[]> = {
  NURSERY: [],
  PRIMARY: [],
  "LOWER SECONDARY": [],
  TVET: [],
};

export default function FeeSetupComponent() {
  // Academic years grow year after year (the school keeps using the system).
  const [availableYears, setAvailableYears] = useState<string[]>(() => loadAcademicYears());
  const [selectedYear, setSelectedYear] = useState<string>("2026-2027");
  const [selectedTerm, setSelectedTerm] = useState<TermType>("TERM_1");
  const [selectedCategory, setSelectedCategory] = useState<ScopeType>("TVET");
  const [feeStructures, setFeeStructures] = useState<Record<ScopeType, FeeStructureItem[]>>(DEFAULT_FEE_ITEMS);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Tracks the backend ids that exist for the currently selected period so the
  // save handler can delete any items the user removed from the grid.
  const loadedFeeIds = useRef<Set<string>>(new Set());

  // Load fee structures for the selected academic year + term from the backend.
  const loadFeeStructures = useCallback(async (year: string, term: TermType) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await api.get<BackendFeeStructure[]>("/finance/fee-structures", {
        params: { academicYear: year, term },
      });
      const grouped: Record<ScopeType, FeeStructureItem[]> = {
        NURSERY: [],
        PRIMARY: [],
        "LOWER SECONDARY": [],
        TVET: [],
      };
      loadedFeeIds.current = new Set<string>();
      res.data.forEach((fee) => {
        const key = fee.scope as ScopeType;
        if (!(key in grouped)) return;
        loadedFeeIds.current.add(fee.id);
        grouped[key].push({
          id: fee.id,
          academicYear: fee.academicYear,
          term: fee.term as TermType,
          scope: key,
          tradeName: fee.tradeName ?? null,
          name: fee.name,
          amount: Number(fee.amount),
          isMandatory: fee.isMandatory,
          isBoardingOnly: fee.isBoardingOnly,
          isDayOnly: fee.isDayOnly,
          isNewStudentOnly: fee.isNewStudentOnly,
          customReason: fee.customReason ?? "",
        });
      });
      setFeeStructures(grouped);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, "Failed to load fee structures."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeeStructures(selectedYear, selectedTerm);
  }, [loadFeeStructures, selectedYear, selectedTerm]);

  const handleAddAcademicYear = () => {
    const nextList = addNextAcademicYear(availableYears, selectedYear);
    setAvailableYears(nextList);
    // Auto-select the newly added year
    setSelectedYear(nextList[nextList.length - 1]);
  };

  // Label for the "add next year" tooltip (e.g. 2029-2030)
  const nextAcademicYearLabel = nextAcademicYear(selectedYear);

  const activeFees = feeStructures[selectedCategory] || [];

  // Helper flags for structural enforcement
  const supportsBoardingDay =
    selectedCategory === "LOWER SECONDARY" || selectedCategory === "TVET";
  const isTvetCategory = selectedCategory === "TVET";

  const totalMandatory = activeFees
    .filter((f) => f.isMandatory)
    .reduce((sum, f) => sum + f.amount, 0);

  const totalOptional = activeFees
    .filter((f) => !f.isMandatory)
    .reduce((sum, f) => sum + f.amount, 0);

  const totalFullFee = totalMandatory + totalOptional;

  const handleAmountChange = (id: string, newAmount: number) => {
    setFeeStructures((prev) => ({
      ...prev,
      [selectedCategory]: prev[selectedCategory].map((item) =>
        item.id === id ? { ...item, amount: newAmount } : item
      ),
    }));
  };

  const handleToggleMandatory = (id: string) => {
    setFeeStructures((prev) => ({
      ...prev,
      [selectedCategory]: prev[selectedCategory].map((item) =>
        item.id === id ? { ...item, isMandatory: !item.isMandatory } : item
      ),
    }));
  };

  const handleAppliesToChange = (id: string, appliesToType: AppliesToType) => {
    setFeeStructures((prev) => ({
      ...prev,
      [selectedCategory]: prev[selectedCategory].map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          isBoardingOnly: supportsBoardingDay && appliesToType === "BOARDING_ONLY",
          isDayOnly: supportsBoardingDay && appliesToType === "DAY_ONLY",
          isNewStudentOnly: appliesToType === "NEW_STUDENTS_ONLY",
        };
      }),
    }));
  };

  const getAppliesToValue = (item: FeeStructureItem): AppliesToType => {
    if (item.isBoardingOnly && supportsBoardingDay) return "BOARDING_ONLY";
    if (item.isDayOnly && supportsBoardingDay) return "DAY_ONLY";
    if (item.isNewStudentOnly) return "NEW_STUDENTS_ONLY";
    return "ALL_STUDENTS";
  };

  const handleAddFeeItem = () => {
    const newItem: FeeStructureItem = {
      id: `F-${Date.now()}`,
      academicYear: selectedYear,
      term: selectedTerm,
      scope: selectedCategory,
      tradeName: isTvetCategory ? null : undefined,
      name: "New Fee Head",
      amount: 10000,
      isMandatory: true,
      isBoardingOnly: false,
      isDayOnly: false,
      isNewStudentOnly: false,
      customReason: "",
    };
    setFeeStructures((prev) => ({
      ...prev,
      [selectedCategory]: [...prev[selectedCategory], newItem],
    }));
  };

  const handleRemoveFeeItem = (id: string) => {
    setFeeStructures((prev) => ({
      ...prev,
      [selectedCategory]: prev[selectedCategory].filter((item) => item.id !== id),
    }));
  };

  const savePayload = (item: FeeStructureItem) => ({
      academicYear: item.academicYear,
      term: item.term,
      scope: item.scope,
      tradeName: item.tradeName ?? null,
      name: item.name,
      amount: item.amount,
      isMandatory: item.isMandatory,
      isBoardingOnly: item.isBoardingOnly,
      isDayOnly: item.isDayOnly,
      isNewStudentOnly: item.isNewStudentOnly,
      customReason: item.customReason || null,
    });

  const handleSaveFeeSetup = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // Only persist items that belong to the currently selected period.
      const currentItems: FeeStructureItem[] = [];
      (Object.values(feeStructures) as FeeStructureItem[][])
        .flat()
        .forEach((item) => {
          if (item.academicYear === selectedYear && item.term === selectedTerm) {
            currentItems.push(item);
          }
        });

      const hasBackendId = (id: string) => !id.startsWith("F-");
      const keptIds = new Set(
        currentItems.filter((i) => hasBackendId(i.id)).map((i) => i.id)
      );

      // Remove items that were deleted from the grid.
      const idsToDelete = Array.from(loadedFeeIds.current).filter(
        (id) => !keptIds.has(id)
      );
      await Promise.all(
        idsToDelete.map((id) =>
          api.delete(`/finance/fee-structures/${id}`)
        )
      );

      // Create brand-new items in one bulk call.
      const itemsToCreate = currentItems.filter((i) => !hasBackendId(i.id));
      if (itemsToCreate.length > 0) {
        await api.post("/finance/fee-structures/bulk", {
          fees: itemsToCreate.map(savePayload),
        });
      }

      // Update existing items.
      const itemsToUpdate = currentItems.filter((i) => hasBackendId(i.id));
      await Promise.all(
        itemsToUpdate.map((item) =>
          api.patch(`/finance/fee-structures/${item.id}`, savePayload(item))
        )
      );

      setSavedSuccess(true);
      toast.success("Fee configuration saved successfully.");
      setTimeout(() => setSavedSuccess(false), 3000);
      await loadFeeStructures(selectedYear, selectedTerm);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save fee configuration."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3.5 max-w-7xl mx-auto pb-8 font-sans text-xs">
      
      {/* HEADER BAR */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 bg-white dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 dark:text-white leading-none">
              Academic Fee Structure Setup
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Configure termly fee structures with dynamic scopes (TVET trades, Boarding/Day, New Students).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3 inline mr-1" /> Saved!
            </span>
          )}
          <button
            onClick={handleSaveFeeSetup}
            disabled={isSaving}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 text-[11px] cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? "Saving..." : "Save Fee Config"}</span>
          </button>
        </div>
      </div>

      {/* LOAD / ERROR NOTICES */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 px-3 py-6 text-xs text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading fee structures for {selectedYear} {selectedTerm}...
        </div>
      )}
      {loadError && (
        <div className="flex items-center gap-2 border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl px-3 py-2 text-[11px] font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {loadError}
        </div>
      )}

      {/* FILTER & LEVEL SWITCHER */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {(["NURSERY", "PRIMARY", "LOWER SECONDARY", "TVET"] as ScopeType[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 font-bold text-xs"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr} Academic Year
                </option>
              ))}
            </select>
            <button
              onClick={handleAddAcademicYear}
              title={`Add the next academic year (${nextAcademicYearLabel}) so fees can be set up for the following year`}
              className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4" />
            </button>
          </div>

          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value as TermType)}
            className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 font-bold text-xs"
          >
            <option value="TERM_1">Term 1</option>
            <option value="TERM_2">Term 2</option>
            <option value="TERM_3">Term 3</option>
          </select>
        </div>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold text-zinc-800 dark:text-zinc-200">
              {selectedCategory} Fee Items ({selectedYear} - {selectedTerm})
            </span>
          </div>

          <button
            onClick={handleAddFeeItem}
            className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 font-semibold text-[10px] flex items-center gap-1"
          >
            <Plus className="w-3 h-3 text-emerald-600" />
            <span>Add Fee Head</span>
          </button>
        </div>

        <table className="w-full text-left text-[11px]">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400 font-bold uppercase text-[9px]">
              <th className="py-2 px-3">Fee Head Name</th>
              <th className="py-2 px-3">Amount (RWF)</th>
              <th className="py-2 px-3">Mandatory</th>
              <th className="py-2 px-3">Applies To</th>
              <th className="py-2 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {activeFees.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                <td className="py-2 px-3 font-semibold">{item.name}</td>
                <td className="py-2 px-3 font-mono">
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleAmountChange(item.id, Number(e.target.value))}
                    className="w-28 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 font-bold"
                  />
                </td>
                <td className="py-2 px-3">
                  <button
                    onClick={() => handleToggleMandatory(item.id)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      item.isMandatory
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {item.isMandatory ? "Mandatory" : "Optional"}
                  </button>
                </td>
                <td className="py-2 px-3">
                  <select
                    value={getAppliesToValue(item)}
                    onChange={(e) => handleAppliesToChange(item.id, e.target.value as AppliesToType)}
                    className="px-1.5 py-0.5 rounded border border-zinc-200 text-[10px] font-medium"
                  >
                    <option value="ALL_STUDENTS">All Students</option>
                    {supportsBoardingDay && <option value="DAY_ONLY">Day Students Only</option>}
                    {supportsBoardingDay && <option value="BOARDING_ONLY">Boarders Only</option>}
                    <option value="NEW_STUDENTS_ONLY">New Students Only</option>
                  </select>
                </td>
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={() => handleRemoveFeeItem(item.id)}
                    className="p-1 rounded text-zinc-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
              ))}
              {activeFees.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-zinc-400 italic">
                    No fee items configured yet. Click "Add Fee Head" to create one.
                  </td>
                </tr>
              )}
            </tbody>
        </table>

        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex justify-between font-mono">
          <div className="flex gap-4 text-[10px] text-zinc-500">
            <span>Mandatory: <strong>{totalMandatory.toLocaleString()} RWF</strong></span>
            <span>Optional: <strong>{totalOptional.toLocaleString()} RWF</strong></span>
          </div>
          <div className="text-[11px] font-bold text-emerald-600">
            Total {selectedTerm} Fee: {totalFullFee.toLocaleString()} RWF
          </div>
        </div>
      </div>
    </div>
  );
}