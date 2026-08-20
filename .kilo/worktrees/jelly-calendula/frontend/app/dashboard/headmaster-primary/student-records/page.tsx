"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  Search,
  ArrowLeft,
  X,
  Pencil,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface StudentRecord {
  id: string;
  fullName: string;
  section: "Nursery" | "Primary";
  className: string;
  gender: "Male" | "Female";
  dateOfBirth: string;
  parentName: string;
  parentPhone: string;
  enrollmentDate: string;
}

export default function PrimaryStudentRecordsPage() {
  const [activeSection, setActiveSection] = useState<"ALL" | "Nursery" | "Primary">("ALL");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Available classes created by the Headmaster
  const [availableClasses, setAvailableClasses] = useState<{ name: string; section: string }[]>([]);

  // Initial Student Database
  const [students, setStudents] = useState<StudentRecord[]>([]);

  // Form input state
  const [fullNameInput, setFullNameInput] = useState<string>("");
  const [genderInput, setGenderInput] = useState<"Male" | "Female">("Male");
  const [dobInput, setDobInput] = useState<string>("");
  const [selectedClassInput, setSelectedClassInput] = useState<string>("P1 A");
  const [parentNameInput, setParentNameInput] = useState<string>("");
  const [parentPhoneInput, setParentPhoneInput] = useState<string>("");

  // Edit / Delete state
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingStudent(null);
    setFullNameInput("");
    setGenderInput("Male");
    setDobInput("");
    setSelectedClassInput("P1 A");
    setParentNameInput("");
    setParentPhoneInput("");
    setIsModalOpen(true);
  };

  const openEditModal = (stu: StudentRecord) => {
    setEditingStudent(stu);
    setFullNameInput(stu.fullName);
    setGenderInput(stu.gender);
    setDobInput(stu.dateOfBirth);
    setSelectedClassInput(stu.className);
    setParentNameInput(stu.parentName);
    setParentPhoneInput(stu.parentPhone);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm("Are you sure you want to delete this student record? This action cannot be undone.")) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      if (activeStudentId === id) setActiveStudentId(null);
      toast.success("Student record deleted successfully");
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullNameInput.trim()) {
      toast.error("Please enter the full student name.");
      return;
    }
    if (!parentNameInput.trim()) {
      toast.error("Please enter the parent/guardian name.");
      return;
    }
    if (!parentPhoneInput.trim()) {
      toast.error("Please enter the parent phone number.");
      return;
    }

    setIsSaving(true);

    try {
      const classObj = availableClasses.find((c) => c.name === selectedClassInput);
      const section = (classObj?.section as "Nursery" | "Primary") || "Primary";

      if (editingStudent) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === editingStudent.id
              ? {
                  ...s,
                  fullName: fullNameInput.trim(),
                  section,
                  className: selectedClassInput,
                  gender: genderInput,
                  dateOfBirth: dobInput || s.dateOfBirth,
                  parentName: parentNameInput.trim(),
                  parentPhone: parentPhoneInput.trim(),
                }
              : s,
          ),
        );
        toast.success("Student information updated successfully!");
      } else {
        const newStudent: StudentRecord = {
          id: `STU-2026-00${students.length + 1}`,
          fullName: fullNameInput.trim(),
          section: section,
          className: selectedClassInput,
          gender: genderInput,
          dateOfBirth: dobInput || "2020-01-01",
          parentName: parentNameInput.trim(),
          parentPhone: parentPhoneInput.trim(),
          enrollmentDate: new Date().toISOString().split("T")[0],
        };

        setStudents([newStudent, ...students]);
        toast.success("Student enrolled successfully!");
      }

      setIsModalOpen(false);
      setEditingStudent(null);
      setFullNameInput("");
      setDobInput("");
      setParentNameInput("");
      setParentPhoneInput("");
    } catch {
      toast.error("An error occurred while saving student record.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = students.filter((stu) => {
    const matchesSection = activeSection === "ALL" || stu.section === activeSection;
    const matchesClass = selectedClassFilter === "ALL" || stu.className === selectedClassFilter;
    const matchesSearch =
      stu.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stu.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stu.parentName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSection && matchesClass && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <Link
              href="/dashboard/headmaster-primary"
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-emerald-700 dark:hover:text-emerald-400 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
              Primary &amp; Nursery Student Records
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              View registered students, add new students, update their details, and remove records as needed.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Add New Student
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search student, Reg No, or parent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
              <button
                onClick={() => {
                  setActiveSection("ALL");
                  setSelectedClassFilter("ALL");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSection === "ALL"
                    ? "bg-white dark:bg-zinc-700 text-emerald-700 dark:text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                All Sections
              </button>
              <button
                onClick={() => {
                  setActiveSection("Nursery");
                  setSelectedClassFilter("ALL");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSection === "Nursery"
                    ? "bg-white dark:bg-zinc-700 text-emerald-700 dark:text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Nursery
              </button>
              <button
                onClick={() => {
                  setActiveSection("Primary");
                  setSelectedClassFilter("ALL");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSection === "Primary"
                    ? "bg-white dark:bg-zinc-700 text-emerald-700 dark:text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Primary
              </button>
            </div>

            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">All Classes</option>
              {availableClasses
                .filter((c) => activeSection === "ALL" || c.section === activeSection)
                .map((cls) => (
                  <option key={cls.name} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* STUDENT DETAIL VIEWER */}
        {activeStudentId &&
          (() => {
            const detail = students.find((s) => s.id === activeStudentId);
            if (!detail) return null;
            return (
              <div className="rounded-3xl border border-emerald-600/30 dark:border-emerald-800/50 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-emerald-700/10 dark:bg-emerald-950/40 border-b border-emerald-600/20 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> Student Details — {detail.fullName}
                  </h2>
                  <button
                    onClick={() => setActiveStudentId(null)}
                    className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-800 dark:hover:text-white cursor-pointer"
                  >
                    Close ✕
                  </button>
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">Reg Number</p>
                    <p className="font-mono font-bold text-zinc-900 dark:text-white mt-0.5">{detail.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">Full Name</p>
                    <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{detail.fullName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">Section</p>
                    <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{detail.section}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">Assigned Class</p>
                    <p className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{detail.className}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">Gender</p>
                    <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{detail.gender}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">Date of Birth</p>
                    <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{detail.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">Parent / Guardian</p>
                    <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{detail.parentName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">Parent Phone</p>
                    <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{detail.parentPhone}</p>
                  </div>
                </div>
              </div>
            );
          })()}

        {/* STUDENT RECORDS TABLE */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Reg No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Assigned Class</th>
                  <th className="px-4 py-3">Gender / DOB</th>
                  <th className="px-4 py-3">Parent / Phone</th>
                  <th className="px-4 py-3 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                {filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-zinc-400">
                      {stu.id}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-white">
                      {stu.fullName}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                        {stu.section}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-700 dark:text-emerald-400">
                      {stu.className}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">
                      <div>{stu.gender}</div>
                      <div className="text-[10px] text-zinc-400">{stu.dateOfBirth}</div>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">
                      <div>{stu.parentName}</div>
                      <div className="text-[10px] text-zinc-400">{stu.parentPhone}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveStudentId(activeStudentId === stu.id ? null : stu.id)}
                          className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                          title="View student details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(stu)}
                          className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                          title="Edit student info"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(stu.id)}
                          className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Delete student record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12 text-zinc-500 text-xs">
                No students found matching your filter criteria.
              </div>
            )}
          </div>
        </div>

        {/* MODAL TO ADD NEW STUDENT */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isSaving && setIsModalOpen(false)}
          >
            <div
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" /> {editingStudent ? "Edit Student Information" : "Add New Student"}
                </h3>
                <button
                  disabled={isSaving}
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-white disabled:opacity-50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
                
                {/* STUDENT FULL NAME */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Full Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSaving}
                    placeholder="e.g. Marie Keza"
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50"
                  />
                </div>

                {/* GENDER & DOB */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">
                      Gender
                    </label>
                    <select
                      disabled={isSaving}
                      value={genderInput}
                      onChange={(e) => setGenderInput(e.target.value as "Male" | "Female")}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      disabled={isSaving}
                      value={dobInput}
                      onChange={(e) => setDobInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* CLASS ASSIGNMENT */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Assign to Class
                  </label>
                  <select
                    disabled={isSaving}
                    value={selectedClassInput}
                    onChange={(e) => setSelectedClassInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold text-emerald-700 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50"
                  >
                    {availableClasses.map((cls) => (
                      <option key={cls.name} value={cls.name}>
                        [{cls.section}] {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PARENT DETAILS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">
                      Parent / Guardian Name *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isSaving}
                      placeholder="e.g. Eric Kalisa"
                      value={parentNameInput}
                      onChange={(e) => setParentNameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">
                      Parent Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isSaving}
                      placeholder="+250 788 000 000"
                      value={parentPhoneInput}
                      onChange={(e) => setParentPhoneInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingStudent(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-all shadow-md disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingStudent ? "Update Student Info" : "Enroll Student"}</span>
                    )}
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