"use client";

import React, { useState } from "react";
import {
  UserPlus,
  ArrowLeft,
  GraduationCap,
  User,
  Phone,
  CheckCircle2,
  Save,
} from "lucide-react";
import Link from "next/link";
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

export default function StudentAddForm({ scope }: { scope: AcademicScope }) {
  const config = getScopeConfig(scope);
  const availableClasses = buildClassOptions(scope);
  // Student Information State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [dob, setDob] = useState("");
  const [nationalId, setNationalId] = useState(""); // LIN / NIN

  // Academic Placement State
  const [category, setCategory] = useState<EducationCategory>(config.categories[0]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // Guardian Details State
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("Parent");

  // UI Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // Filter available classes based on chosen Category
  const filteredClasses = availableClasses.filter((c) => c.category === category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API registration delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(true);

      // Reset Form fields
      setFirstName("");
      setLastName("");
      setDob("");
      setNationalId("");
      setSelectedClassId("");
      setGuardianName("");
      setGuardianPhone("");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`${config.basePath}/classes`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-emerald-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Class Roster
          </Link>
          <h1 className="font-sans text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-7 h-7 text-emerald-700 dark:text-emerald-400" />
            Register New Student
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Enroll a new {config.label} student into a class, trade, or stream.
          </p>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Student successfully registered and assigned to class seat!</span>
          </div>
          <button
            onClick={() => setSuccessMessage(false)}
            className="text-emerald-700 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Academic Placement */}
        <div className="p-6 rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <div className="border-b border-amber-900/10 dark:border-zinc-800 pb-3 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="font-sans font-bold text-lg text-zinc-900 dark:text-white">
              1. Academic Placement
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Category Selector */}
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Education Level / Pathway *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as EducationCategory);
                  setSelectedClassId(""); // Reset class selection
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                {config.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Class Stream Selector */}
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Target Class / Stream Assignment *
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="">-- Choose Class / Stream --</option>
                {filteredClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {`${cls.levelName} — ${cls.streamName}`}
                  </option>
                ))}
              </select>
              {filteredClasses.length === 0 && (
                <p className="text-[11px] text-amber-700 mt-1 italic">
                  No active classes found for this category. Create one in Class Management first.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Student Personal Profile */}
        <div className="p-6 rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <div className="border-b border-amber-900/10 dark:border-zinc-800 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="font-sans font-bold text-lg text-zinc-900 dark:text-white">
              2. Student Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* First Name */}
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                First Name (Given Name) *
              </label>
              <input
                type="text"
                placeholder="e.g. Jean Paul"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Last Name (Family Name) *
              </label>
              <input
                type="text"
                placeholder="e.g. Mugisha"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "Male" | "Female")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            {/* National Identification / LIN */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                National Identification Code / LIN <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="1 200X 8 0000000 0 00"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Guardian & Contact Information */}
        <div className="p-6 rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <div className="border-b border-amber-900/10 dark:border-zinc-800 pb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="font-sans font-bold text-lg text-zinc-900 dark:text-white">
              3. Parent / Guardian Contact
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Guardian Full Name */}
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Guardian Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Marie Chantal Uwineza"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Phone Number (SMS Notifications) *
              </label>
              <input
                type="tel"
                placeholder="0788 000 000"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            {/* Relationship */}
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Relationship
              </label>
              <select
                value={guardianRelationship}
                onChange={(e) => setGuardianRelationship(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Legal Guardian</option>
                <option value="Sponsor">Sponsor / Relative</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href={`${config.basePath}/classes`}
            className="px-5 py-2.5 rounded-xl border border-amber-900/20 dark:border-zinc-700 bg-amber-900/5 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-amber-900/10 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Registering Student..." : "Save Student Registration"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}