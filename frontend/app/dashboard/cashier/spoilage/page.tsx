"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Package,
  Calendar,
  CheckCircle2,
  Search,
  Clock,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";

// ==========================================
// TYPES
// ==========================================
export interface FoodStockBalance {
  name: string;
  category: string;
  availableQuantity: number;
  unit: "kg" | "liters" | "bags";
}

export interface SpoilageRecord {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: "kg" | "liters" | "bags";
  reason: "Water Damage / Rain" | "Pest Infestation" | "Expired" | "Transportation / Bag Tear" | "Other Spoilage";
  reportedBy: string;
  dateReported: string;
  timeReported: string;
  notes?: string;
}

export default function SpoilageTab() {
  const [balances, setBalances] = useState<FoodStockBalance[]>([]);
  const [records, setRecords] = useState<SpoilageRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [selectedItemName, setSelectedItemName] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [reason, setReason] = useState<SpoilageRecord["reason"]>("Water Damage / Rain");
  const [dateReported, setDateReported] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [timeReported, setTimeReported] = useState<string>("08:00 AM");
  const [notes, setNotes] = useState<string>("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [itemsRes, historyRes] = await Promise.all([
        api.get<FoodStockBalance[]>("/inventory/items"),
        api.get<SpoilageRecord[]>("/inventory/history", { params: { type: "SPOILAGE" } }),
      ]);
      setBalances(itemsRes.data);
      setRecords(historyRes.data);
      if (itemsRes.data.length > 0) {
        setSelectedItemName(itemsRes.data[0].name);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to load spoilage data."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const enteredQty = Number(quantity);

    if (!enteredQty || enteredQty <= 0) {
      setErrorMessage("Please enter a valid spoiled quantity.");
      return;
    }

    const selectedFoodObj = balances.find((b) => b.name === selectedItemName) || balances[0];
    if (enteredQty > selectedFoodObj.availableQuantity) {
      setErrorMessage(
        `Invalid quantity! You cannot log ${enteredQty} ${selectedFoodObj.unit} as spoiled because only ${selectedFoodObj.availableQuantity} ${selectedFoodObj.unit} are available.`
      );
      return;
    }

    try {
      await api.post("/inventory/spoilage", {
        itemId: selectedFoodObj.name,
        quantity: enteredQty,
        reason,
        dateReported,
        timeReported,
        notes: notes || undefined,
      });

      setQuantity("");
      setNotes("");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 4000);
      loadData();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to record spoilage."));
    }
  };

  const filteredRecords = records.filter(
    (r) =>
      r.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* SUCCESS NOTIFICATION */}
      {showSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Spoilage Logged Successfully!</p>
            <p className="text-[11px] opacity-90">
              The damaged stock has been deducted from the main store balance.
            </p>
          </div>
        </div>
      )}

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-bold">Entry Error</p>
            <p className="text-[11px] opacity-90">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. SPOILAGE REPORTING FORM (1 COLUMN) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4 h-fit">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Log Spoiled / Damaged Food
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Record food losses, leaks, or pest damage for the Headmaster.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Select Food Item */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Food Item <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedItemName}
                onChange={(e) => setSelectedItemName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white cursor-pointer"
              >
                {balances.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name} (In Store: {item.availableQuantity} {item.unit})
                  </option>
                ))}
              </select>
              
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-zinc-500">Currently in Store:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">
                  {balances.find((b) => b.name === selectedItemName)?.availableQuantity || 0} {balances.find((b) => b.name === selectedItemName)?.unit || ""}
                </span>
              </div>
            </div>

            {/* Reason Dropdown */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Reason for Loss / Spoilage <span className="text-rose-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as SpoilageRecord["reason"])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white cursor-pointer"
              >
                <option value="Water Damage / Rain">Water Damage / Rain</option>
                <option value="Pest Infestation">Pest Infestation (Rats/Weevils)</option>
                <option value="Expired">Expired Stock</option>
                <option value="Transportation / Bag Tear">Transportation / Bag Tear</option>
                <option value="Other Spoilage">Other Reason</option>
              </select>
            </div>

            {/* Quantity Input */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Spoiled Quantity ({balances.find((b) => b.name === selectedItemName)?.unit?.toUpperCase() || ""}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  max={balances.find((b) => b.name === selectedItemName)?.availableQuantity || 0}
                  placeholder="e.g. 10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-400">
                  {balances.find((b) => b.name === selectedItemName)?.unit || ""}
                </span>
              </div>
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Date Incident</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="date"
                    required
                    value={dateReported}
                    onChange={(e) => setDateReported(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Time</label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={timeReported}
                    onChange={(e) => setTimeReported(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Notes & Explanation */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Detailed Incident Explanation
              </label>
              <textarea
                rows={3}
                placeholder="Describe how it happened so administration can review..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <AlertTriangle className="w-4 h-4" /> Report Spoilage
            </button>
          </form>
        </div>

        {/* 2. SPOILAGE INCIDENT LOG TABLE (2 COLUMNS) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-rose-600" /> Spoilage & Losses Log
              </h3>
              <p className="text-[11px] text-zinc-500">
                History of spoiled stock submitted for administrative review
              </p>
            </div>

            <div className="relative max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search reason or item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-3 text-right">Lost Quantity</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    >
                      <td className="py-3 px-3 font-semibold text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        <p className="font-bold text-zinc-900 dark:text-white">{record.dateReported}</p>
                        <p className="text-[10px] text-zinc-400">{record.timeReported}</p>
                      </td>
                      <td className="py-3 px-3 font-bold text-zinc-900 dark:text-white">
                        {record.itemName}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        -{record.quantity} {record.unit}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                          {record.reason}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-500 max-w-xs truncate">
                        {record.notes || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-zinc-400 italic"
                    >
                      No spoilage records found.
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