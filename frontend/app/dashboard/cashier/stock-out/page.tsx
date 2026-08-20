"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowUpRight,
  Package,
  Calendar,
  UserCheck,
  CheckCircle2,
  Search,
  AlertCircle,
  Clock,
  Utensils,
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

export interface StockOutRecord {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: "kg" | "liters" | "bags";
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Special Event" | "Other";
  issuedTo: string;
  dateIssued: string;
  timeIssued: string;
  notes?: string;
}

export default function StockOutTab() {
  const [balances, setBalances] = useState<FoodStockBalance[]>([]);
  const [records, setRecords] = useState<StockOutRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [selectedItemName, setSelectedItemName] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [mealType, setMealType] = useState<StockOutRecord["mealType"]>("Lunch");
  const [issuedTo, setIssuedTo] = useState<string>("");
  const [dateIssued, setDateIssued] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [timeIssued, setTimeIssued] = useState<string>("11:30 AM");
  const [notes, setNotes] = useState<string>("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [itemsRes, historyRes] = await Promise.all([
        api.get<FoodStockBalance[]>("/inventory/items"),
        api.get<StockOutRecord[]>("/inventory/history", { params: { type: "STOCK_OUT" } }),
      ]);
      setBalances(itemsRes.data);
      setRecords(historyRes.data);
      if (itemsRes.data.length > 0) {
        setSelectedItemName(itemsRes.data[0].name);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to load stock data."));
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
      setErrorMessage("Please enter a valid quantity to release.");
      return;
    }

    const selectedFoodObj = balances.find((b) => b.name === selectedItemName) || balances[0];
    if (enteredQty > selectedFoodObj.availableQuantity) {
      setErrorMessage(
        `Insufficient stock! You only have ${selectedFoodObj.availableQuantity} ${selectedFoodObj.unit} of ${selectedItemName} available in the store.`
      );
      return;
    }

    try {
      await api.post("/inventory/stock-out", {
        itemId: selectedFoodObj.name,
        quantity: enteredQty,
        mealType,
        issuedTo: issuedTo || "Main Kitchen Staff",
        dateIssued,
        timeIssued,
        notes: notes || undefined,
      });

      setQuantity("");
      setIssuedTo("");
      setNotes("");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 4000);
      loadData();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to record stock out."));
    }
  };

  const filteredRecords = records.filter(
    (r) =>
      r.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.issuedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.mealType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* SUCCESS NOTIFICATION */}
      {showSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Stock Out Recorded Successfully!</p>
            <p className="text-[11px] opacity-90">
              Food release logged and main store balance updated automatically.
            </p>
          </div>
        </div>
      )}

      {/* ERROR / OVERFLOW ALERT */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-bold">Cannot Complete Stock Release</p>
            <p className="text-[11px] opacity-90">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. STOCK OUT FORM (1 COLUMN) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4 h-fit">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-amber-600" /> Issue Kitchen Stock (Stock Out)
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Log food released from store for daily student meals.
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
              
              {/* Realtime Available Stock Badge */}
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-zinc-500">Store Available Balance:</span>
                <span
                  className={`font-mono font-bold ${
                    (balances.find((b) => b.name === selectedItemName)?.availableQuantity || 0) <= 100
                      ? "text-rose-600"
                      : "text-emerald-700 dark:text-emerald-400"
                  }`}
                >
                  {balances.find((b) => b.name === selectedItemName)?.availableQuantity || 0} {balances.find((b) => b.name === selectedItemName)?.unit || ""}
                </span>
              </div>
            </div>

            {/* Meal Type Selection */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Meal Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Utensils className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as StockOutRecord["mealType"])}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white cursor-pointer"
                >
                  <option value="Breakfast">Breakfast (Porridge)</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Special Event">Special Event / Guest</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Quantity Input */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Quantity to Release ({balances.find((b) => b.name === selectedItemName)?.unit?.toUpperCase() || ""}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  max={balances.find((b) => b.name === selectedItemName)?.availableQuantity || 0}
                  placeholder={`Max: ${balances.find((b) => b.name === selectedItemName)?.availableQuantity || 0}`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-400">
                  {balances.find((b) => b.name === selectedItemName)?.unit || ""}
                </span>
              </div>
            </div>

            {/* Received By / Cook Name */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Issued To / Cook Name
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="e.g. Chef Alphonsine"
                  value={issuedTo}
                  onChange={(e) => setIssuedTo(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Date Issued</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="date"
                    required
                    value={dateIssued}
                    onChange={(e) => setDateIssued(e.target.value)}
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
                    value={timeIssued}
                    onChange={(e) => setTimeIssued(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Meal Details / Remarks
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Prepared for 350 TVET and Secondary students"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <ArrowUpRight className="w-4 h-4" /> Confirm & Issue Stock Out
            </button>
          </form>
        </div>

        {/* 2. STOCK OUT HISTORY LOG TABLE (2 COLUMNS) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" /> Kitchen Usage Log
              </h3>
              <p className="text-[11px] text-zinc-500">
                History of food quantities released to the kitchen
              </p>
            </div>

            <div className="relative max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search meal or food..."
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
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Meal</th>
                  <th className="py-2.5 px-3">Food Item</th>
                  <th className="py-2.5 px-3 text-right">Quantity Released</th>
                  <th className="py-2.5 px-3">Issued To</th>
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
                        <p className="font-bold text-zinc-900 dark:text-white">{record.dateIssued}</p>
                        <p className="text-[10px] text-zinc-400">{record.timeIssued}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          {record.mealType}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-zinc-900 dark:text-white">
                        {record.itemName}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                        -{record.quantity} {record.unit}
                      </td>
                      <td className="py-3 px-3 text-zinc-600 dark:text-zinc-300 font-medium">
                        {record.issuedTo}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-zinc-400 italic"
                    >
                      No stock out records found.
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