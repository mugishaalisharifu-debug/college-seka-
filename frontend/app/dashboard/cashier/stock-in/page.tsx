"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowDownLeft,
  Package,
  Calendar,
  Truck,
  FileText,
  CheckCircle2,
  Search,
  Plus,
  X,
  PlusCircle,
} from "lucide-react";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";

// ==========================================
// TYPES
// ==========================================
export interface FoodItemType {
  id: string;
  name: string;
  category: string;
  unit: "kg" | "liters" | "bags";
}

export interface StockInRecord {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: "kg" | "liters" | "bags";
  supplier: string;
  invoiceNumber: string;
  dateReceived: string;
  notes?: string;
}

export default function StockInTab() {
  // Food items list state (loaded from the backend)
  const [foodItems, setFoodItems] = useState<FoodItemType[]>([]);

  // History logs state (loaded from the backend)
  const [records, setRecords] = useState<StockInRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Form State
  const [selectedItemName, setSelectedItemName] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [supplier, setSupplier] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [dateReceived, setDateReceived] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState<string>("");

  // New Food Item Creator State
  const [isAddingNewFood, setIsAddingNewFood] = useState<boolean>(false);
  const [newFoodName, setNewFoodName] = useState<string>("");
  const [newFoodCategory, setNewFoodCategory] = useState<string>("Grains");
  const [newFoodUnit, setNewFoodUnit] = useState<"kg" | "liters" | "bags">("kg");

  const loadItems = async () => {
    try {
      const res = await api.get<FoodItemType[]>("/inventory/items");
      setFoodItems(res.data);
      setSelectedItemName((prev) =>
        prev || (res.data[0]?.name ?? ""),
      );
    } catch (error) {
      alert(getApiErrorMessage(error, "Failed to load food items."));
    }
  };

  const loadHistory = async () => {
    try {
      const res = await api.get<StockInRecord[]>("/inventory/history", {
        params: { type: "STOCK_IN" },
      });
      setRecords(res.data);
    } catch {
      // no-op
    }
  };

  useEffect(() => {
    loadItems();
    loadHistory();
  }, []);

  // Automatically find unit based on current selection
  const selectedItemObj = foodItems.find((i) => i.name === selectedItemName) || foodItems[0];
  const currentUnit = selectedItemObj ? selectedItemObj.unit : "kg";

  // Handle registering a brand-new food item
  const handleAddNewFoodType = async () => {
    if (!newFoodName.trim()) {
      alert("Please enter the name of the new food item.");
      return;
    }

    try {
      await api.post("/inventory/items", {
        name: newFoodName.trim(),
        category: newFoodCategory,
        unit: newFoodUnit,
      });
      await loadItems();
      setSelectedItemName(newFoodName.trim());
      setNewFoodName("");
      setIsAddingNewFood(false);
    } catch (error) {
      alert(getApiErrorMessage(error, "Failed to create the food item."));
    }
  };

  // Handle saving the stock in record
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantity || Number(quantity) <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (!selectedItemObj) {
      alert("Please select a food item first.");
      return;
    }

    try {
      await api.post("/inventory/stock-in", {
        itemId: selectedItemObj.id,
        quantity: Number(quantity),
        supplier: supplier || undefined,
        invoiceNumber: invoiceNumber || undefined,
        dateReceived,
        notes: notes || undefined,
      });

      // Reset Form
      setQuantity("");
      setSupplier("");
      setInvoiceNumber("");
      setNotes("");

      await loadHistory();

      // Show Notification
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 4000);
    } catch (error) {
      alert(getApiErrorMessage(error, "Failed to record stock in."));
    }
  };

  const filteredRecords = records.filter(
    (r) =>
      r.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* SUCCESS ALERT */}
      {showSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Stock Entry Recorded Successfully!</p>
            <p className="text-[11px] opacity-90">
              The main food inventory balance has been updated automatically.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. STOCK IN FORM (1 COLUMN) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4 h-fit">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-700" /> Record New Delivery (Stock In)
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Enter food received from suppliers or farm into school store.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Food Selection with "New Food" option */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">
                  Food Item <span className="text-rose-500">*</span>
                </label>
                
                {/* Toggle New Food Form */}
                <button
                  type="button"
                  onClick={() => setIsAddingNewFood(!isAddingNewFood)}
                  className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {isAddingNewFood ? (
                    <>
                      <X className="w-3.5 h-3.5" /> Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> + New Food Type
                    </>
                  )}
                </button>
              </div>

              {/* Dynamic Food Dropdown OR New Item Creator */}
              {!isAddingNewFood ? (
                <select
                  value={selectedItemName}
                  onChange={(e) => setSelectedItemName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white cursor-pointer"
                >
                  {foodItems.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name} ({item.category} - {item.unit})
                    </option>
                  ))}
                </select>
              ) : (
                /* MINI CREATOR FOR NEW FOOD TYPES */
                <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 space-y-3">
                  <p className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                    Register New Food Item
                  </p>
                  
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Food Name (e.g. Sorghum / Cassava)"
                      value={newFoodName}
                      onChange={(e) => setNewFoodName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newFoodCategory}
                        onChange={(e) => setNewFoodCategory(e.target.value)}
                        className="px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold"
                      >
                        <option value="Grains">Grains</option>
                        <option value="Legumes">Legumes</option>
                        <option value="Flour">Flour</option>
                        <option value="Liquids">Liquids</option>
                        <option value="Tubers">Tubers / Vegetables</option>
                        <option value="General">General</option>
                      </select>

                      <select
                        value={newFoodUnit}
                        onChange={(e) => setNewFoodUnit(e.target.value as typeof newFoodUnit)}
                        className="px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold"
                      >
                        <option value="kg">Kilograms (kg)</option>
                        <option value="liters">Liters</option>
                        <option value="bags">Bags / Sacks</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddNewFoodType}
                      className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                    >
                      Save & Select New Food
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Input */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Quantity Received ({currentUnit.toUpperCase()}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 250"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-400">
                  {currentUnit}
                </span>
              </div>
            </div>

            {/* Supplier Name */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Supplier / Source Name
              </label>
              <div className="relative">
                <Truck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="e.g. Sina Gerard Farm"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Invoice / Delivery Voucher */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Invoice / Voucher Number
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="e.g. INV-2026-001"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Date Received */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Date Received <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="date"
                  required
                  value={dateReceived}
                  onChange={(e) => setDateReceived(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white cursor-pointer"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Remarks / Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. 5 bags of 50kg each, good quality"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <ArrowDownLeft className="w-4 h-4" /> Save Stock In Record
            </button>
          </form>
        </div>

        {/* 2. STOCK IN HISTORY TABLE (2 COLUMNS) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-700" /> Delivery History Log
              </h3>
              <p className="text-[11px] text-zinc-500">
                List of recent food entries added into the system
              </p>
            </div>

            <div className="relative max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search history..."
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
                  <th className="py-2.5 px-3 text-right">Quantity Received</th>
                  <th className="py-2.5 px-3">Supplier / Voucher</th>
                  <th className="py-2.5 px-3">Remarks</th>
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
                        {record.dateReceived}
                      </td>
                      <td className="py-3 px-3 font-bold text-zinc-900 dark:text-white">
                        {record.itemName}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        +{record.quantity} {record.unit}
                      </td>
                      <td className="py-3 px-3 text-zinc-600 dark:text-zinc-300">
                        <p className="font-semibold">{record.supplier}</p>
                        <p className="text-[10px] text-zinc-400">{record.invoiceNumber}</p>
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
                      No stock in records found.
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