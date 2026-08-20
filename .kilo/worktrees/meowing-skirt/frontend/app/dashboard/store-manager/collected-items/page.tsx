"use client";

import React, { useState, useEffect } from "react";
import { Package, Search, Plus, CheckCircle2, Filter, Edit, Trash2, X } from "lucide-react";
import api from "@/lib/api";
import { getApiErrorMessage, formatDate } from "@/lib/api-helpers";

interface CollectedItem {
  id: string;
  itemName: string;
  category: string;
  quantityReceived: string;
  currentBalance: string;
  studentName?: string;
  classLevel: string;
  status: "In Stock" | "Issued" | "Low Stock" | "Depleted";
  lastUpdated: string;
}

interface StockRow {
  id: string;
  itemName: string;
  category: string;
  currentBalance: string;
  unit: string | null;
  createdAt: string;
}

function toCollectedItem(row: StockRow): CollectedItem {
  const balance = Number(row.currentBalance) || 0;
  const suffix = row.unit ? ` ${row.unit}` : "";
  return {
    id: row.id,
    itemName: row.itemName,
    category: row.category,
    quantityReceived: `${row.currentBalance}${suffix}`,
    currentBalance: `${row.currentBalance}${suffix}`,
    classLevel: "",
    status: balance <= 0 ? "Depleted" : balance < 10 ? "Low Stock" : "In Stock",
    lastUpdated: formatDate(row.createdAt),
  };
}

export default function StoreManagerCollectedItemsPage() {
  const [items, setItems] = useState<CollectedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State for Adding/Editing Item
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CollectedItem | null>(null);

  // Form State
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState<CollectedItem["category"]>("General");
  const [quantityReceived, setQuantityReceived] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [studentName, setStudentName] = useState("");

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<StockRow[]>("/store-manager/stock");
      setItems(res.data.map(toCollectedItem));
    } catch (error) {
      alert(getApiErrorMessage(error, "Failed to load collected stock."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setItemName("");
    setCategory("General");
    setQuantityReceived("");
    setCurrentBalance("");
    setClassLevel("");
    setStudentName("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CollectedItem) => {
    setEditingItem(item);
    setItemName(item.itemName);
    setCategory(item.category);
    setQuantityReceived(item.quantityReceived.split(" ")[0] || "");
    setCurrentBalance(item.currentBalance.split(" ")[0] || "");
    setClassLevel(item.classLevel);
    setStudentName(item.studentName || "");
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !quantityReceived) return;

    try {
      await api.post("/store-manager/stock", {
        id: editingItem ? editingItem.id : undefined,
        itemName: itemName.trim(),
        category,
        quantity: Number(quantityReceived),
      });
      setIsModalOpen(false);
      await loadItems();
    } catch (error) {
      alert(getApiErrorMessage(error, "Failed to save the stock item."));
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this stock item record?")) {
      try {
        await api.delete(`/store-manager/stock/${id}`);
        await loadItems();
      } catch (error) {
        alert(getApiErrorMessage(error, "Failed to delete the stock item."));
      }
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.studentName && item.studentName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-violet-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 flex items-center gap-2">
              <Package className="w-4 h-4" /> Student Collected Requirement Items
            </p>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">Collected School Supplies & Tools</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Store manager inventory â€” hoes, toilet paper, soap, paper reams, brooms, and tools collected from incoming students.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-2xl bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Stock Item
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-violet-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by item name or student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-700 cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="KG / Nursery">KG / Nursery</option>
            <option value="Primary">Primary</option>
            <option value="Lower Secondary">Lower Secondary</option>
            <option value="TVET Trades">TVET Trades</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="rounded-3xl border border-violet-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-violet-50 dark:bg-violet-950/40 text-zinc-500 uppercase tracking-wide text-[10px] border-b border-violet-900/10 dark:border-zinc-800">
            <tr>
              <th className="py-4 px-5">Code</th>
              <th className="py-4 px-5">Item Description</th>
              <th className="py-4 px-5">Category / Class</th>
              <th className="py-4 px-5">Total Received</th>
              <th className="py-4 px-5">Current Balance</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-900/10 dark:divide-zinc-800">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="py-4 px-5 font-mono font-bold text-zinc-500">{item.id}</td>
                <td className="py-4 px-5 font-semibold text-zinc-900 dark:text-white">
                  {item.itemName}
                  {item.studentName && (
                    <p className="text-[10px] text-zinc-400 font-normal mt-0.5">Brought by: {item.studentName}</p>
                  )}
                </td>
                <td className="py-4 px-5">
                  <span className="font-bold text-violet-700 dark:text-violet-300">{item.category}</span>
                  <p className="text-[10px] text-zinc-500">{item.classLevel}</p>
                </td>
                <td className="py-4 px-5 font-mono font-medium text-zinc-700 dark:text-zinc-300">{item.quantityReceived}</td>
                <td className="py-4 px-5 font-mono font-bold text-violet-700 dark:text-emerald-400">{item.currentBalance}</td>
                <td className="py-4 px-5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    item.status === "Low Stock" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}>
                    <CheckCircle2 className="w-3 h-3" /> {item.status}
                  </span>
                </td>
                <td className="py-4 px-5 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}

            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-400 italic">
                  No stock items match your search or filter selection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-violet-900/10 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-violet-900/10 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                {editingItem ? "Edit Stock Item Record" : "Add New Collected Item"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Item Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toilet Paper, Hoe, Soap, Paper Ream"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Category / Level</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CollectedItem["category"])}
                    className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="Boarding / Tools">Boarding / Tools</option>
                    <option value="Academic Supplies">Academic Supplies</option>
                    <option value="Personal Care / Fees">Personal Care / Fees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Class / Stream</label>
                  <input
                    type="text"
                    placeholder="e.g. S1A, P5B, TVET L4"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Quantity Received</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50 rolls, 10 units"
                    value={quantityReceived}
                    onChange={(e) => setQuantityReceived(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Current Stock Balance</label>
                  <input
                    type="text"
                    placeholder="e.g. 35 rolls left"
                    value={currentBalance}
                    onChange={(e) => setCurrentBalance(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Student Provider (Optional)</label>
                <input
                  type="text"
                  placeholder="Student name who brought item"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-violet-900/10 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-violet-700 text-white font-bold text-xs hover:bg-violet-800 transition-colors cursor-pointer"
                >
                  {editingItem ? "Update Record" : "Save Item Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
