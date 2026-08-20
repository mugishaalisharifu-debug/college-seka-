"use client";

import React, { useState } from "react";
import {
  Boxes,
  Plus,
  Wrench,
  GraduationCap,
  Users,
  Search,
  X,
  UserCheck,
  Edit3,
  Trash2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { AcademicScope, EducationCategory, getScopeConfig } from "@/lib/role-scope";

interface Teacher {
  id: string;
  name: string;
  specialty: string;
}

interface SchoolClass {
  id: string;
  category: EducationCategory;
  tradeName?: string;
  levelName: string; // e.g., "Primary 5A", "Senior 1B", "Agriculture L4A"
  capacity: number;
  enrolled: number;
  classTeacherId?: string;
}



export default function ClassesManager({ scope }: { scope: AcademicScope }) {
  const config = getScopeConfig(scope);
  const supportsTrades = scope === "tvet";

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const EMPTY_TEACHERS: Teacher[] = [];
  const [tvetTrades, setTvetTrades] = useState<string[]>(config.streams);
  const [activeTab, setActiveTab] = useState<EducationCategory>(config.categories[0]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals State
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [isAddTradeModalOpen, setIsAddTradeModalOpen] = useState(false);

  // Editing Selection State
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  // Form States
  const [formCategory, setFormCategory] = useState<EducationCategory>(config.categories[0]);
  const [formTrade, setFormTrade] = useState<string>("");
  const [formLevel, setFormLevel] = useState<string>("");
  const [formCapacity, setFormCapacity] = useState<number>(40);
  const [formTeacherId, setFormTeacherId] = useState<string>("");

  const [newTradeInput, setNewTradeInput] = useState("");

  const filteredClasses = classes.filter((cls) => {
    const matchesCategory = cls.category === activeTab;
    const displayName = `${cls.tradeName || ""} ${cls.levelName}`.toLowerCase();
    return matchesCategory && displayName.includes(searchQuery.toLowerCase());
  });

  // Category Total Capacity & Enrolled Computations
  const categoryClasses = classes.filter((c) => c.category === activeTab);
  const totalEnrolled = categoryClasses.reduce((acc, curr) => acc + curr.enrolled, 0);
  const totalCapacity = categoryClasses.reduce((acc, curr) => acc + curr.capacity, 0);

  const handleOpenEditModal = (cls: SchoolClass) => {
    setEditingClassId(cls.id);
    setFormCategory(cls.category);
    setFormTrade(cls.tradeName || "");
    setFormLevel(cls.levelName);
    setFormCapacity(cls.capacity);
    setFormTeacherId(cls.classTeacherId || "");
    setIsEditClassModalOpen(true);
  };

  const handleDeleteClass = (cls: SchoolClass) => {
    if (cls.enrolled > 0) {
      alert(`Cannot delete ${cls.levelName}! It currently has ${cls.enrolled} enrolled students. Please reassign or promote the students first.`);
      return;
    }

    if (confirm(`Are you sure you want to delete class: "${cls.levelName}"?`)) {
      setClasses((prev) => prev.filter((c) => c.id !== cls.id));
    }
  };

  const handleCreateTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTradeInput.trim()) return;
    if (!tvetTrades.includes(newTradeInput.trim())) {
      setTvetTrades([...tvetTrades, newTradeInput.trim()]);
    }
    setNewTradeInput("");
    setIsAddTradeModalOpen(false);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLevel.trim()) return;

    const slug = formLevel.trim().replace(/[^a-zA-Z0-9]+/g, "-").toUpperCase();
    let id = `CLS-${slug}`;
    let suffix = 2;
    while (classes.some((c) => c.id === id)) {
      id = `CLS-${slug}-${suffix}`;
      suffix += 1;
    }

    const newClassObj: SchoolClass = {
      id,
      category: formCategory,
      tradeName: supportsTrades ? formTrade : undefined,
      levelName: formLevel.trim(),
      capacity: formCapacity,
      enrolled: 0,
      classTeacherId: formTeacherId || undefined,
    };

    setClasses([...classes, newClassObj]);
    setIsAddClassModalOpen(false);
    resetForm();
  };

  const handleUpdateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClassId || !formLevel.trim()) return;

    setClasses((prev) =>
      prev.map((c) =>
        c.id === editingClassId
          ? {
              ...c,
              category: formCategory,
              tradeName: supportsTrades ? formTrade : undefined,
              levelName: formLevel.trim(),
              capacity: formCapacity,
              classTeacherId: formTeacherId || undefined,
            }
          : c
      )
    );

    setIsEditClassModalOpen(false);
    resetForm();
  };

  const handleAssignTeacher = (classId: string, teacherId: string) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, classTeacherId: teacherId || undefined } : c))
    );
  };

  const resetForm = () => {
    setEditingClassId(null);
    setFormLevel("");
    setFormTeacherId("");
    setFormTrade("");
    setFormCapacity(40);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 md:p-8 bg-white dark:bg-zinc-900 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wide">
            <Boxes className="w-3.5 h-3.5" />
            Academic Infrastructure
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {config.label} Class Structure & Allocation
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Manage active {config.label} classes, configure seating capacities and assign class teachers (Patrons)
            {supportsTrades ? ", and structure TVET faculties" : ""}.
          </p>
        </div>

        {/* Header Quick Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 relative z-10">
          {supportsTrades && (
            <button
              onClick={() => setIsAddTradeModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl border border-amber-900/15 dark:border-zinc-700 bg-amber-900/5 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 font-bold text-xs hover:bg-amber-900/10 dark:hover:bg-zinc-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Wrench className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Add TVET Faculty</span>
            </button>
          )}

          <button
            onClick={() => {
              setFormCategory(activeTab);
              resetForm();
              setIsAddClassModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold text-xs transition-all shadow-md hover:shadow-emerald-900/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Class</span>
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Classes</p>
            <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-0.5">{categoryClasses.length}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Enrolled Students</p>
            <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-0.5">{totalEnrolled}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Available Seats</p>
            <p className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
              {Math.max(0, totalCapacity - totalEnrolled)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-amber-900/10 dark:border-zinc-800 pb-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {config.categories.map((cat) => {
            const isActive = activeTab === cat;
            const count = classes.filter((c) => c.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-amber-900/5 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-amber-900/10 dark:hover:bg-zinc-700"
                }`}
              >
                {cat === "TVET" ? <Wrench className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                <span>{cat}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-emerald-800 text-emerald-100"
                      : "bg-amber-900/10 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search class name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((cls) => {
          const effectiveEnrolled = cls.enrolled;
          const seatsAvailable = cls.capacity - effectiveEnrolled;
          const isFull = seatsAvailable <= 0;
          const occupancyPct = Math.min(100, Math.round((effectiveEnrolled / cls.capacity) * 100));

          return (
            <div
              key={cls.id}
              className="group border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-emerald-600/50 dark:hover:border-emerald-500/50 transition-all bg-white dark:bg-zinc-900 flex flex-col justify-between space-y-4 relative"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/50">
                        {cls.category}
                      </span>
                      {cls.tradeName && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-800/50">
                          {cls.tradeName}
                        </span>
                      )}
                    </div>
                    <h3 className="font-sans text-lg font-bold text-zinc-900 dark:text-white pt-0.5">
                      {cls.levelName}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditModal(cls)}
                      className="p-1.5 rounded-xl border border-amber-900/10 dark:border-zinc-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 transition-colors cursor-pointer"
                      title="Edit Class"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls)}
                      className="p-1.5 rounded-xl border border-amber-900/10 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Class"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Seat Badges */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isFull
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}
                    >
                      {isFull ? "Class Full" : `${seatsAvailable} Seats Free`}
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                      {effectiveEnrolled} / {cls.capacity} ({occupancyPct}%)
                    </span>
                  </div>

                </div>

                {/* Class Teacher Assignment */}
                <div className="pt-3 border-t border-amber-900/10 dark:border-zinc-800 space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Class Teacher / Patron
                  </label>
                  <select
                    value={cls.classTeacherId || ""}
                    onChange={(e) => handleAssignTeacher(cls.id, e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/90 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                  >
                    <option value="">-- Unassigned --</option>
                    {EMPTY_TEACHERS.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          );
        })}

        {filteredClasses.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-amber-900/15 dark:border-zinc-800 rounded-3xl bg-white/50 dark:bg-zinc-900/50 space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-900/5 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
              No classes found for the {activeTab} category.
            </p>
            <button
              onClick={() => {
                setFormCategory(activeTab);
                resetForm();
                setIsAddClassModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Class</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal: Add TVET Trade */}
      {isAddTradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
              <h3 className="font-sans text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" /> Add TVET Faculty
              </h3>
              <button onClick={() => setIsAddTradeModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrade} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Faculty / Trade Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Renewable Energy, Tailoring"
                  value={newTradeInput}
                  onChange={(e) => setNewTradeInput(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium"
                />
              </div>

              <div className="pt-3 border-t border-amber-900/10 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTradeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-700 text-white font-bold hover:bg-amber-800 cursor-pointer"
                >
                  Add Trade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Class */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
              <h3 className="font-sans text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-700" /> Create New Class
              </h3>
              <button onClick={() => setIsAddClassModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Education Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as EducationCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold cursor-pointer"
                >
                  {config.categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {supportsTrades && (
                <div>
                  <label className="block font-bold text-amber-800 dark:text-amber-400 mb-1">TVET Trade / Faculty *</label>
                  <select
                    value={formTrade}
                    onChange={(e) => setFormTrade(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="">-- Choose Trade --</option>
                    {tvetTrades.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Class Name *</label>
                <input
                  type="text"
                  placeholder={supportsTrades ? "e.g., Agriculture L4A, L3SWD B" : `e.g., ${config.classes[0]} A`}
                  value={formLevel}
                  onChange={(e) => setFormLevel(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Assign Class Teacher (Optional)</label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium cursor-pointer"
                >
                  <option value="">-- Select Teacher --</option>
                  {EMPTY_TEACHERS.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Max Seating Capacity</label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium"
                />
              </div>

              <div className="pt-3 border-t border-amber-900/10 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 cursor-pointer"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Class */}
      {isEditClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
              <h3 className="font-sans text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-700" />
                Update Class Configuration
              </h3>
              <button onClick={() => setIsEditClassModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateClass} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Education Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as EducationCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold cursor-pointer"
                >
                  {config.categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {supportsTrades && (
                <div>
                  <label className="block font-bold text-amber-800 dark:text-amber-400 mb-1">TVET Trade / Faculty *</label>
                  <select
                    value={formTrade}
                    onChange={(e) => setFormTrade(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="">-- Choose Trade --</option>
                    {tvetTrades.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Class Name *</label>
                <input
                  type="text"
                  value={formLevel}
                  onChange={(e) => setFormLevel(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Class Teacher (Patron)</label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium cursor-pointer"
                >
                  <option value="">-- Select Teacher --</option>
                  {EMPTY_TEACHERS.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Max Seating Capacity</label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium"
                />
              </div>

              <div className="pt-3 border-t border-amber-900/10 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}