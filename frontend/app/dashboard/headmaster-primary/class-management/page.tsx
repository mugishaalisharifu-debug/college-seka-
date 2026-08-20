"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  School,
  Users,
  ArrowLeft,
  X,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";

interface PrimaryClass {
  id: string;
  className: string;
  section: "Nursery" | "Primary";
  capacity: number;
  enrolled: number;
}

interface BackendClass {
  id: string;
  className: string;
  scope: string;
  tradeName?: string | null;
}

function mapClasses(rows: BackendClass[]): PrimaryClass[] {
  return (rows || []).map((c) => ({
    id: c.id,
    className: c.className,
    section: (c.scope === "NURSERY" ? "Nursery" : "Primary") as "Nursery" | "Primary",
    capacity: 40,
    enrolled: 0,
  }));
}

export default function ManagePrimaryClassesPage() {
  const [activeTab, setActiveTab] = useState<"Nursery" | "Primary">("Primary");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Existing classes stored directly by full class name
  const [classList, setClassList] = useState<PrimaryClass[]>([]);

  // Modal Form Inputs
  const [classNameInput, setClassNameInput] = useState<string>("");
  const [classSectionInput, setClassSectionInput] = useState<"Nursery" | "Primary">("Primary");
  const [capacityInput, setCapacityInput] = useState<number>(40);

  const reloadClasses = async () => {
    try {
      const res = await api.get<BackendClass[]>("/dos/classes");
      setClassList(mapClasses(res.data));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not load classes."));
    }
  };

  useEffect(() => {
    reloadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim()) return;

    try {
      await api.post("/dos/classes", {
        className: classNameInput.trim(),
        scope: classSectionInput === "Nursery" ? "NURSERY" : "PRIMARY",
        tradeName: null,
      });
      toast.success("Class created successfully.");
      setIsModalOpen(false);
      setClassNameInput("");
      setCapacityInput(40);
      await reloadClasses();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to create the class."));
    }
  };

  const handleDeleteClass = async (id: string, name: string) => {
    if (!confirm(`Delete class "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/dos/classes/${id}`);
      toast.success("Class deleted.");
      await reloadClasses();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete the class."));
    }
  };

  const filteredClasses = classList.filter((cls) => cls.section === activeTab);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <Link
              href="/dashboard/headmaster-primary"
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-emerald-700 dark:hover:text-emerald-400 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Create & Manage Classes
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Add primary and nursery classes directly (e.g., P1 A, P2 B, P3 C).
            </p>
          </div>

          <button
            onClick={() => {
              setClassSectionInput(activeTab);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Class
          </button>
        </div>

        {/* SECTION TABS: ONLY NURSERY & PRIMARY */}
        <div className="flex items-center gap-2 bg-zinc-200/60 dark:bg-zinc-900 p-1.5 rounded-2xl w-fit border border-zinc-300/50 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("Nursery")}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "Nursery"
                ? "bg-white dark:bg-zinc-800 text-emerald-700 dark:text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Nursery Classes
          </button>
          <button
            onClick={() => setActiveTab("Primary")}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "Primary"
                ? "bg-white dark:bg-zinc-800 text-emerald-700 dark:text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Primary Classes (P1–P6)
          </button>
        </div>

        {/* CLASSES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => {
            const isFull = cls.enrolled >= cls.capacity;
            return (
              <div
                key={cls.id}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4 hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {cls.section}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400">{cls.id}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteClass(cls.id, cls.className)}
                      title="Delete class"
                      className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                    {cls.className}
                  </h3>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Enrolled
                    </span>
                    <span className={isFull ? "text-rose-600 font-bold" : "text-zinc-800 dark:text-zinc-200"}>
                      {cls.enrolled} / {cls.capacity} Students
                    </span>
                  </div>
                </div>
              </div>
              );
            })}
            {filteredClasses.length === 0 && (
              <div className="text-center py-12 text-zinc-500 text-xs">
                No classes created yet. Click "Create New Class" to add one.
              </div>
            )}
          </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs">
            No classes created yet in {activeTab}. Click &quot;Add Class&quot; to create one.
          </div>
        )}

        {/* MODAL TO ADD CLASS */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-xl">
              
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <School className="w-5 h-5 text-emerald-600" /> Add New Class
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
                
                {/* SECTION SELECTION */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Section
                  </label>
                  <select
                    value={classSectionInput}
                    onChange={(e) => setClassSectionInput(e.target.value as "Nursery" | "Primary")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Primary">Primary</option>
                    <option value="Nursery">Nursery</option>
                  </select>
                </div>

                {/* CLASS NAME INPUT */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Class Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. P1 A, P2 B, or P3 C"
                    value={classNameInput}
                    onChange={(e) => setClassNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* CAPACITY INPUT */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Student Capacity
                  </label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={100}
                    value={capacityInput}
                    onChange={(e) => setCapacityInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* ACTIONS */}
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-all shadow-md"
                  >
                    Save Class
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}