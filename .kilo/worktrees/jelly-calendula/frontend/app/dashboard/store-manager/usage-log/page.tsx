"use client";

import React, { useState, useEffect } from "react";
import { FileText, Plus, Trash2, Edit, X, ShieldAlert } from "lucide-react";
import api from "@/lib/api";
import { getApiErrorMessage, formatDate } from "@/lib/api-helpers";

interface UsageEntry {
  id: string;
  item: string;
  usedFor: string;
  quantity: string;
  department: string;
  authorizedBy: string;
  date: string;
}

interface UsageRow {
  id: string;
  item: string;
  type: string;
  quantity: number;
  department: string | null;
  authorizedBy: string;
  notes: string | null;
  createdAt: string;
}

interface StockOption {
  id: string;
  itemName: string;
}

function toUsageEntry(row: UsageRow): UsageEntry {
  return {
    id: row.id,
    item: row.item,
    usedFor: row.notes || "General usage",
    quantity: `${row.quantity}`,
    department: row.department || "General",
    authorizedBy: row.authorizedBy,
    date: formatDate(row.createdAt),
  };
}

export default function UsageLogPage() {
  const [logs, setLogs] = useState<UsageEntry[]>([]);
  const [stockOptions, setStockOptions] = useState<StockOption[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<UsageEntry | null>(null);

  // Form State
  const [item, setItem] = useState("");
  const [usedFor, setUsedFor] = useState("");
  const [quantity, setQuantity] = useState("");
  const [department, setDepartment] = useState("");
  const [authorizedBy, setAuthorizedBy] = useState("Store Manager");

  const loadLogs = async () => {
    try {
      const res = await api.get<UsageRow[]>("/store-manager/usage-logs");
      setLogs(res.data.map(toUsageEntry));
    } catch (error) {
      alert(getApiErrorMessage(error, "Failed to load usage logs."));
    }
  };

  const loadStockOptions = async () => {
    try {
      const res = await api.get<StockOption[]>("/store-manager/stock");
      setStockOptions(res.data);
    } catch {
      // no-op
    }
  };

  useEffect(() => {
    loadLogs();
    loadStockOptions();
  }, []);

  const handleOpenAddModal = () => {
    setEditingLog(null);
    setItem("");
    setUsedFor("");
    setQuantity("");
    setDepartment("");
    setAuthorizedBy("Store Manager");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (log: UsageEntry) => {
    setEditingLog(log);
    setItem(log.item);
    setUsedFor(log.usedFor);
    setQuantity(log.quantity);
    setDepartment(log.department);
    setAuthorizedBy(log.authorizedBy);
    setIsModalOpen(true);
  };

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !quantity || !usedFor) return;

    const stockItem = stockOptions.find((s) => s.itemName === item);
    if (!stockItem) {
      alert("Item not found in store stock. Please add it in Collected Items first.");
      return;
    }

    try {
      // The backend has no update endpoint, so edits are delete + recreate.
      if (editingLog) {
        await api.delete(`/store-manager/usage-logs/${editingLog.id}`);
      }

      await api.post("/store-manager/usage-logs", {
        storeItemId: stockItem.id,
        quantity: Number(quantity),
        department: department || "General",
        notes: usedFor.trim(),
      });

      setIsModalOpen(false);
      await loadLogs();
    } catch (error) {
      alert(getApiErrorMessage(error, "Failed to save the usage entry."));
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (confirm("Are you sure you want to remove this stock usage entry?")) {
      try {
        await api.delete(`/store-manager/usage-logs/${id}`);
        await loadLogs();
      } catch (error) {
        alert(getApiErrorMessage(error, "Failed to delete the usage entry."));
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-violet-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Stock Control & Usage Log
          </p>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">Store Usage Records</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track and audit stock consumption across departments to eliminate unauthorized usage and waste.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-2xl bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Log New Stock Consumption
        </button>
      </div>

      {/* Usage Warning Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-violet-700 dark:text-emerald-400 shrink-0" />
        <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium">
          <strong className="font-bold">Usage Accountability Active:</strong> Every store item issued requires a target department, authorized signature, and recorded quantity to prevent stock leakage.
        </p>
      </div>

      {/* Usage Table */}
      <div className="rounded-3xl border border-violet-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-violet-50 dark:bg-violet-950/40 text-zinc-500 uppercase tracking-wide text-[10px] border-b border-violet-900/10 dark:border-zinc-800">
            <tr>
              <th className="py-4 px-5">Log ID</th>
              <th className="py-4 px-5">Item Consumed</th>
              <th className="py-4 px-5">Target Department / Purpose</th>
              <th className="py-4 px-5">Quantity Used</th>
              <th className="py-4 px-5">Authorized By</th>
              <th className="py-4 px-5">Date</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-900/10 dark:divide-zinc-800">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="py-4 px-5 font-mono font-bold text-zinc-500">{log.id}</td>
                <td className="py-4 px-5 font-semibold text-zinc-900 dark:text-white">{log.item}</td>
                <td className="py-4 px-5">
                  <p className="font-semibold text-violet-700 dark:text-violet-300">{log.department}</p>
                  <p className="text-[10px] text-zinc-500">{log.usedFor}</p>
                </td>
                <td className="py-4 px-5 font-mono font-bold text-amber-700 dark:text-amber-400">{log.quantity}</td>
                <td className="py-4 px-5 text-zinc-700 dark:text-zinc-300 font-medium">{log.authorizedBy}</td>
                <td className="py-4 px-5 text-zinc-500 dark:text-zinc-400">{log.date}</td>
                <td className="py-4 px-5 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(log)}
                    className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Usage Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-violet-900/10 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-violet-900/10 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                {editingLog ? "Edit Stock Usage Entry" : "Record New Stock Consumption"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toilet Paper, Hoe, Reams of Paper"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Target Department / Class</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nursery, P3, S2A, Agriculture Workshop, Dormitory"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Purpose of Usage</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exam printing, Practical class, Campus sanitation"
                  value={usedFor}
                  onChange={(e) => setUsedFor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Quantity Issued</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10 rolls, 2 hoes"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Authorized By</label>
                  <input
                    type="text"
                    required
                    placeholder="Staff name"
                    value={authorizedBy}
                    onChange={(e) => setAuthorizedBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>
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
                  {editingLog ? "Update Usage Entry" : "Save Usage Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
