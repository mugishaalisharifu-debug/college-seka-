"use client";

import React, { useEffect, useState } from "react";
import {
  Edit,
  ArrowLeft,
  GraduationCap,
  User,
  Phone,
  CheckCircle2,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AcademicScope, EducationCategory, getScopeConfig } from "@/lib/role-scope";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";

// Backend class row (as returned by GET /dos/classes).
interface BackendClass {
  id: string;
  className: string;
  scope: string;
  tradeName?: string | null;
}

// Backend student row (as returned by GET /dos/students).
interface BackendStudent {
  id: string;
  studentName: string;
  gender: "Male" | "Female" | null;
  dateOfBirth?: string | null;
  educationLevel: string;
  tradeName?: string | null;
  classId?: string | null;
  parentName: string;
  parentPhone: string;
  studentType?: string;
  status?: string;
}

function backendLevelToCategory(level: string): EducationCategory {
  switch (level) {
    case "NURSERY":
      return "Nursery";
    case "PRIMARY":
      return "Primary";
    case "LOWER SECONDARY":
      return "Lower Secondary";
    case "TVET":
      return "TVET";
    default:
      return "Primary";
  }
}

function uiCategoryToLevel(category: EducationCategory): string {
  switch (category) {
    case "Nursery":
      return "NURSERY";
    case "Primary":
      return "PRIMARY";
    case "Lower Secondary":
      return "LOWER SECONDARY";
    case "TVET":
      return "TVET";
    default:
      return "PRIMARY";
  }
}

function uiStatusToBackend(status: "Active" | "Suspended" | "Discontinued"): string {
  switch (status) {
    case "Suspended":
      return "SUSPENDED";
    case "Discontinued":
      return "TRANSFERRED";
    default:
      return "ACTIVE";
  }
}

export default function StudentEditForm({ scope }: { scope: AcademicScope }) {
  const config = getScopeConfig(scope);
  const params = useParams();
  const router = useRouter();
  const studentId = (params?.id as string) || "";

  // Live class options loaded from the database.
  const [availableClasses, setAvailableClasses] = useState<BackendClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Real student record (dynamic, from the database).
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [dob, setDob] = useState("");
  const [category, setCategory] = useState<EducationCategory>(config.categories[0]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [status, setStatus] = useState<"Active" | "Suspended" | "Discontinued">("Active");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [classesRes, studentRes] = await Promise.all([
          api.get<BackendClass[]>("/dos/classes"),
          // The DOS scope listing is role-scoped; we still find this student in it.
          api.get<BackendStudent[]>("/dos/students"),
        ]);
        if (cancelled) return;

        setAvailableClasses(classesRes.data || []);

        const stu = (studentRes.data || []).find((s) => s.id === studentId);
        if (!stu) {
          setLoadError("Student not found in the database.");
          setIsLoading(false);
          return;
        }

        const nameParts = (stu.studentName || "").split(/\s+/);
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");
        setGender((stu.gender as "Male" | "Female") || "Male");
        setDob(stu.dateOfBirth ? new Date(stu.dateOfBirth).toISOString().slice(0, 10) : "");
        setCategory(backendLevelToCategory(stu.educationLevel));
        setSelectedClassId(stu.classId || "");
        setGuardianName(stu.parentName || "");
        setGuardianPhone(stu.parentPhone || "");
        setStatus(
          stu.status === "SUSPENDED"
            ? "Suspended"
            : stu.status === "TRANSFERRED" || stu.status === "GRADUATED"
              ? "Discontinued"
              : "Active",
        );
      } catch (error) {
        if (!cancelled) {
          setLoadError(getApiErrorMessage(error, "Could not load the student record."));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, scope]);

  const filteredClasses = availableClasses.filter(
    (c) => c.scope === uiCategoryToLevel(category),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      studentName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      gender,
      dateOfBirth: dob ? new Date(dob).toISOString() : new Date().toISOString(),
      educationLevel: uiCategoryToLevel(category),
      tradeName: category === "TVET" ? (filteredClasses.find((c) => c.id === selectedClassId)?.className ?? null) : null,
      classId: selectedClassId || null,
      parentName: guardianName.trim(),
      parentPhone: guardianPhone.trim(),
      studentType:
        category === "Lower Secondary" || category === "TVET" ? "BOARDING" : "DAY",
      status: uiStatusToBackend(status),
    };

    try {
      await api.patch(`/dos/students/${studentId}`, payload);
      setIsSubmitting(false);
      setSuccessMessage(true);
      setTimeout(() => {
        router.push(`${config.basePath}/students`);
        router.refresh();
      }, 1200);
    } catch (err) {
      setIsSubmitting(false);
      setLoadError(getApiErrorMessage(err, "Failed to update the student record."));
    }
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

      {loadError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <span>{loadError}</span>
            <div>
              <button
                type="button"
                onClick={() => {
                  setLoadError(null);
                  setIsLoading(true);
                  window.location.reload();
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="p-6 rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center gap-3 text-xs font-bold text-zinc-500">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          Loading student record from the database...
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
                {filteredClasses.length > 0 ? (
                  filteredClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.className}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No classes available for this level — create one in Class Management first
                  </option>
                )}
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