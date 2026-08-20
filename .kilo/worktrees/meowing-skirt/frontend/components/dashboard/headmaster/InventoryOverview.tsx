"use client";

import React, { useState, useEffect } from "react";
import {
  Boxes,
  Package,
  Warehouse,
  AlertTriangle,
  CheckCircle2,
  Search,
  TrendingUp,
  TrendingDown,
  PackageCheck,
  PackageX,
  Store,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";

// ==========================================
// TYPES
// ==========================================
interface InventoryItem {
  id: string;
  name: string;
  category: "Food Store" | "General Supplies" | "TVET Tools" | "Stationery";
  available: number;
  unit: "kg" | "liters" | "bags" | "units";
  reorderLevel: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

const CATEGORIES = ["All", "Food Store", "General Supplies", "TVET Tools", "Stationery"] as const;

export default function InventoryOverview() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<InventoryItem[]>("/inventory/items");
        const mapped: InventoryItem[] = res.data.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category as InventoryItem["category"],
          available: item.available,
          unit: item.unit as InventoryItem["unit"],
          reorderLevel: 10,
          status: item.available <= 0 ? "Out of Stock" : item.available < 10 ? "Low Stock" : "In Stock",
        }));
        setItems(mapped);
      } catch (error) {
        console.error("Failed to load inventory:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalItems = items.length;
  const totalUnits = items.reduce((sum, item) => sum + item.available, 0);
  const lowStockCount = items.filter((i) => i.status === "Low Stock").length;
  const outOfStockCount = items.filter((i) => i.status === "Out of Stock").length;
  const inStockCount = items.filter((i) => i.status === "In Stock").length;

  return (
    <div className="space-y-6 pb-12">
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-8 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
          <span className="text-xs font-bold">Loading inventory...</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 md:p-8 bg-white dark:bg-zinc-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <Warehouse className="w-4 h-4" /> Central Store Oversight
          </span>
          <h1 className="font-sans text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mt-1">
            School Inventory Overview
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Consolidated stock levels across the food store, stationery, general supplies, and TVET tools.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-4 py-2 rounded-2xl shrink-0">
          <Store className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <div className="text-left text-xs">
            <p className="font-bold text-emerald-900 dark:text-emerald-300">{inStockCount} In Stock</p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Items healthy</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Item Types</p>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white mt-1">{totalItems}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
            <Boxes className="w-3 h-3" /> Across {CATEGORIES.length - 1} categories
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Units Available</p>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{totalUnits}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-1">
            <Package className="w-3 h-3" /> Mixed units
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Low Stock Items</p>
          <p className="text-2xl font-bold font-mono text-amber-600 mt-1">{lowStockCount}</p>
          <p className="text-[10px] text-amber-600 mt-0.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Reorder needed
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Out of Stock</p>
          <p className="text-2xl font-bold font-mono text-rose-600 mt-1">{outOfStockCount}</p>
          <p className="text-[10px] text-rose-500 mt-0.5 flex items-center gap-1">
            <PackageX className="w-3 h-3" /> Critical
          </p>
        </div>
      </div>

      {/* Category Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-amber-900/5 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-amber-900/10"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-amber-900/10 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-700" /> Stock Level Register
          </h3>
          <span className="text-xs text-zinc-500 font-mono">{filteredItems.length} items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-amber-900/5 dark:bg-zinc-800/50 text-zinc-500 font-bold uppercase tracking-wider border-b border-amber-900/10 dark:border-zinc-800">
              <tr>
                <th className="py-3.5 px-6">Item</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Available</th>
                <th className="py-3.5 px-6">Reorder Level</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Indicator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/10 dark:divide-zinc-800">
              {filteredItems.map((item) => {
                const usageRatio = item.available / item.reorderLevel;

                return (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-white">{item.name}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-zinc-700 dark:text-zinc-300">
                      {item.available} <span className="text-zinc-400 font-normal">{item.unit}</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-zinc-500">{item.reorderLevel} {item.unit}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.status === "In Stock"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : item.status === "Low Stock"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {item.status === "In Stock" && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === "Low Stock" && <TrendingDown className="w-3 h-3" />}
                        {item.status === "Out of Stock" && <TrendingUp className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-400">
                          {usageRatio.toFixed(1)}x
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400 text-xs">
                    No inventory items match the selected category or search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Note */}
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 text-xs flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0" />
        <div>
          <span className="font-bold">Note: </span>
          The Cashier manages day-to-day food store entries (Stock In / Stock Out / Spoilage). This page provides the
          Headmaster with a real-time executive summary of inventory health.
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="/dashboard/cashier/stock-in"
          className="group rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs hover:border-emerald-600/50 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-zinc-900 dark:text-white">Stock In (Deliveries)</p>
              <p className="text-[11px] text-zinc-500">Cashier food entry log</p>
            </div>
          </div>
          <TrendingUp className="w-4 h-4 text-zinc-300 group-hover:text-emerald-600 transition-colors" />
        </a>

        <a
          href="/dashboard/cashier/spoilage"
          className="group rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs hover:border-emerald-600/50 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-zinc-900 dark:text-white">Spoilage & Losses</p>
              <p className="text-[11px] text-zinc-500">Damaged food reports</p>
            </div>
          </div>
          <TrendingDown className="w-4 h-4 text-zinc-300 group-hover:text-emerald-600 transition-colors" />
        </a>
      </div>
    </div>
  );
}
