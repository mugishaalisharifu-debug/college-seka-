"use client";

import React, { useState } from "react";
import {
  Edit,
  ArrowLeft,
  GraduationCap,
  User,
  Phone,
  CheckCircle2,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AcademicScope, EducationCategory, getScopeConfig } from "@/lib/role-scope";

interface ClassOption {
  id: string;
  category: EducationCategory;
  levelName: string;
  streamName: string;
}

/** Active class seats of a scope: every managed level combined with its streams or trades. */
function buildClassOptions(scope: AcademicScope): ClassOption[] {
  const config = getScopeConfig(scope);
  return config.categories.flatMap((category) =>
    config.classes.flatMap((levelName) =>
      config.streams.map((streamName) => ({
        id: `CLS-${levelName}-${streamName}`.replace(/[^a-zA-Z0-9]+/g, "-").toUpperCase(),
        category,
        levelName,
        streamName,
      }))
    )
  );
}

export default function StudentEditForm({ scope }: { scope: AcademicScope }) {
  const config = getScopeConfig(scope);
  const availableClasses = buildClassOptions(scope);
  const params = useParams();
  const router = useRouter();
  const studentId = (params?.id as string) || "STU-2026-001";

  // Pre-populated Form State (Simulates fetched student record)
  const [firstName, setFirstName] = useState("Jean Paul");
  const [lastName, setLastName] = useState("Nshimiyimana");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [category, setCategory] = useState<EducationCategory>(config.categories[0]);
  const [selectedClassId, setSelectedClassId] = useState(availableClasses[0].id);
  const [guardianName, setGuardianName] = useState("Pierre Mugisha");
  const [guardianPhone, setGuardianPhone] = useState("0788123456");
  const [status, setStatus] = useState<"Active" | "Suspended" | "Discontinued">("Active");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const filteredClasses = availableClasses.filter((c) => c.category === category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(true);
      setTimeout(() => {
        router.push(`${config.basePath}/students`);
      }, 1200);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div>
        <Link
          href={`${config.basePath}/students`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-emerald-700 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Student Directory
        </Link>
        <h1 className="font-sans text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Edit className="w-7 h-7 text-emerald-700 dark:text-emerald-400" />
          Update Student Record ({studentId})
        </h1>
        <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Modify academic assignment, personal info, or status for this student.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Student profile updated successfully! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Academic Placement */}
        <div className="p-6 rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <div className="border-b border-amber-900/10 dark:border-zinc-800 pb-3 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="font-sans font-bold text-lg text-zinc-900 dark:text-white">
              1. Class & Academic Status
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as EducationCategory);
                  setSelectedClassId("");
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
              >
                {config.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Target Stream Assignment
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium"
              >
                <option value="">-- Select Stream --</option>
                {filteredClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {`${cls.levelName} — ${cls.streamName}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Enrollment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Discontinued">Discontinued</option>
              </select>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="p-6 rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <div className="border-b border-amber-900/10 dark:border-zinc-800 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="font-sans font-bold text-lg text-zinc-900 dark:text-white">
              2. Student Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "Male" | "Female")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* Guardian Information */}
        <div className="p-6 rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <div className="border-b border-amber-900/10 dark:border-zinc-800 pb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="font-sans font-bold text-lg text-zinc-900 dark:text-white">
              3. Parent / Guardian Contact
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Guardian Full Name
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`${config.basePath}/students`}
            className="px-5 py-2.5 rounded-xl border border-amber-900/20 dark:border-zinc-700 bg-amber-900/5 text-zinc-700 dark:text-zinc-300 font-bold text-xs"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Updating..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}