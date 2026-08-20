"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Phone,
  MoreVertical,
  Edit,
  Trash2,
  Upload,
  FileText,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { downloadTextFile } from "@/lib/file-export";
import ReportViewerModal, { ReportData } from "@/components/dashboard/ReportViewerModal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { AcademicScope, EducationCategory, getScopeConfig } from "@/lib/role-scope";

type Category = EducationCategory;

interface UploadedDocument {
  name: string;
  type: string;
  date: string;
}

interface Student {
  id: string;
  fullName: string;
  gender: "Male" | "Female";
  category: Category;
  classId?: string;
  currentClass: string;
  currentStream?: string;
  academicYear: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  hasS3ResultSlip?: boolean; // Required for TVET Level 3 candidates only
  requirementStatus: "Completed / Cleared" | "Pending Documents" | "Blocked / Incomplete for National Exam";
  documents: UploadedDocument[];
  status: "Active" | "Suspended" | "Discontinued";
}



// The S3 (O-Level) National Exam result slip is ONLY required for TVET Level 3
// candidates and Senior 3 national exam candidates. It does not apply to every student.
function isS3SlipRequired(student: Student): boolean {
  const level = (student.currentClass + " " + (student.currentStream || "")).toUpperCase();
  const isTvetL3 = student.category === "TVET" && (level.includes("L3") || level.includes("LEVEL 3"));
  const isSenior3 = student.category === "Lower Secondary" && (level.includes("SENIOR 3") || level === "S3" || level.includes("S3 ") || level.includes(" S3"));
  return isTvetL3 || isSenior3;
}

// Backend `education_level` values → local UI category.
function levelToCategory(level: string): Category {
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

// Local UI category → backend `educationLevel`.
function categoryToLevel(category: Category): string {
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

interface BackendStudent {
  id: string;
  studentName: string;
  gender: "Male" | "Female" | null;
  educationLevel: string;
  tradeName?: string | null;
  classId?: string | null;
  parentName: string;
  parentPhone: string;
  studentType?: string;
  status?: string;
}

// Convert backend student rows into the local UI shape.
function mapStudents(rows: BackendStudent[], map: Record<string, string>): Student[] {
  return (rows || []).map((s) => ({
    id: s.id,
    fullName: s.studentName,
    gender: s.gender || "Male",
    category: levelToCategory(s.educationLevel),
    classId: s.classId || undefined,
    currentClass: s.classId && map[s.classId] ? map[s.classId] : s.tradeName || "",
    currentStream: s.tradeName || undefined,
    academicYear: "2026",
    guardianName: s.parentName,
    guardianPhone: s.parentPhone,
    guardianEmail: "",
    hasS3ResultSlip: false,
    requirementStatus: "Completed / Cleared",
    documents: [],
    status: (s.status === "SUSPENDED" ? "Suspended" : "Active") as Student["status"],
  }));
}

export default function StudentsDirectory({ scope }: { scope: AcademicScope }) {
  const config = getScopeConfig(scope);
  const defaultClass = config.classes[0];

  const [students, setStudents] = useState<Student[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [backendClasses, setBackendClasses] = useState<{id: string, className: string, scope: string, tradeName?: string | null}[]>([]);
  const [classMap, setClassMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const classesRes = await api.get<{ id: string; className: string, scope: string, tradeName?: string | null }>("/dos/classes");
        const map: Record<string, string> = {};
        (classesRes.data || []).forEach(
          (c) => (map[c.id] = c.className),
        );
        setClassMap(map);
        setBackendClasses(classesRes.data || []);

        const studentsRes = await api.get<BackendStudent[]>("/dos/students");
        setStudents(mapStudents(studentsRes.data, map));
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not load students."));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [activeDocsStudent, setActiveDocsStudent] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [activeReport, setActiveReport] = useState<ReportData | null>(null);

  // Form State for Add / Edit Student
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [category, setCategory] = useState<Category>(config.categories[0]);
  const [formSelectedClassId, setFormSelectedClassId] = useState<string>("");
  const [currentClass, setCurrentClass] = useState(defaultClass);
  const [currentStream, setCurrentStream] = useState(config.streams[0]);
  const [academicYear, setAcademicYear] = useState("2026");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [hasS3ResultSlip, setHasS3ResultSlip] = useState(true);

  // Upload Batch CSV/JSON state
  const [rawUploadText, setRawUploadText] = useState("");

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFullName("");
    setGender("Male");
    setCategory(config.categories[0]);
    setFormSelectedClassId("");
    setCurrentClass(defaultClass);
    setCurrentStream(config.streams[0]);
    setAcademicYear("2026");
    setGuardianName("");
    setGuardianPhone("");
    setGuardianEmail("");
    setHasS3ResultSlip(true);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (stu: Student) => {
    setEditingStudent(stu);
    setFullName(stu.fullName);
    setGender(stu.gender);
    setCategory(stu.category);
    setFormSelectedClassId(stu.classId || "");
    setCurrentClass(stu.currentClass);
    setCurrentStream(stu.currentStream || "");
    setAcademicYear(stu.academicYear);
    setGuardianName(stu.guardianName);
    setGuardianPhone(stu.guardianPhone);
    setGuardianEmail(stu.guardianEmail);
    setHasS3ResultSlip(stu.hasS3ResultSlip || false);
    setIsAddEditModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !guardianName || !guardianPhone) {
      toast.error("Full name, guardian name and phone are required.");
      return;
    }

    // Resolve the selected class name into a backend classId (if it exists).
    const classId = formSelectedClassId || null;
    const selectedClass = backendClasses.find(c => c.id === classId);
    const resolvedTradeName = selectedClass?.tradeName || null;

    const payload = {
      studentName: fullName.trim(),
      gender,
      dateOfBirth: new Date().toISOString(),
      educationLevel: categoryToLevel(category),
      tradeName: category === "TVET" ? resolvedTradeName : null,
      classId,
      parentName: guardianName.trim(),
      parentPhone: guardianPhone.trim(),
      studentType: (category === "Lower Secondary" || category === "TVET") ? "BOARDING" : "DAY",
      status: "ACTIVE",
    };

    try {
      if (editingStudent) {
        await api.patch(`/dos/students/${editingStudent.id}`, payload);
        toast.success("Student updated successfully.");
      } else {
        await api.post("/dos/students", payload);
        toast.success("Student registered successfully.");
      }
      setIsAddEditModalOpen(false);

      // Reload the directory from the backend.
      const studentsRes = await api.get<BackendStudent[]>("/dos/students");
      setStudents(mapStudents(studentsRes.data, classMap));
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, editingStudent
          ? "Failed to update the student."
          : "Failed to register the student."),
      );
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    setActiveMenuId(null);
    if (!confirm(`Are you sure you want to delete ${name} (${id}) from the system?`)) return;
    try {
      await api.delete(`/dos/students/${id}`);
      const studentsRes = await api.get<BackendStudent[]>("/dos/students");
      setStudents(mapStudents(studentsRes.data, classMap));
      toast.success("Student deleted successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete the student."));
    }
  };

  const handleBatchImport = async () => {
    if (!rawUploadText.trim()) return;
    try {
      const lines = rawUploadText.trim().split("\n");
      const educationLevel = categoryToLevel(config.categories[0]);

      let imported = 0;
      for (const [index, line] of lines.entries()) {
        const parts = line.split(",");
        const name = parts[0]?.trim() || `Imported Student ${index + 1}`;
        const cls = parts[1]?.trim() || defaultClass;
        const parent = parts[2]?.trim() || "Guardian Name";
        const phone = parts[3]?.trim() || "+250 788 000 000";

        const classId = Object.keys(classMap).find((key) => classMap[key] === cls) || null;

        await api.post("/dos/students", {
          studentName: name,
          gender: index % 2 === 0 ? "Male" : "Female",
          dateOfBirth: new Date().toISOString(),
          educationLevel,
          tradeName: config.categories[0] === "TVET" ? config.streams[0] : null,
          classId,
          parentName: parent,
          parentPhone: phone,
          studentType: (config.categories[0] === "Lower Secondary" || config.categories[0] === "TVET") ? "BOARDING" : "DAY",
          status: "ACTIVE",
        });
        imported += 1;
      }

      const studentsRes = await api.get<BackendStudent[]>("/dos/students");
      setStudents(mapStudents(studentsRes.data, classMap));
      setRawUploadText("");
      setIsImportModalOpen(false);
      toast.success(`Successfully imported ${imported} student(s) into the directory!`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Import failed. Format: Student Name, Class, Parent Name, Phone"));
    }
  };

  const handleOpenReportModal = () => {
    setActiveReport({
      id: `RPT-DOS-STU-${config.shortLabel.toUpperCase()}-2026`,
      title: `${config.label} Student Roster & National Exam Clearance Report`,
      academicYear: selectedYear === "All" ? "2026/2027" : selectedYear,
      generatedDate: "August 11, 2026",
      generatedBy: `Director of Studies Office — ${config.label}`,
      summary: "Student directory audit. Highlights candidate clearance status for National Examinations, missing S3 result slips, parent contacts, and stream allocations.",
      headers: ["Student Code", "Student Name", "Class & Stream", "Parent Contact", "S3 Result Slip", "National Exam Status"],
      rows: filteredStudents.map((s) => [
        s.id,
        s.fullName,
        s.currentStream || s.currentClass,
        `${s.guardianName} (${s.guardianPhone})`,
        s.hasS3ResultSlip ? "Verified (Attached)" : "MISSING RESULT SLIP",
        s.requirementStatus,
      ]),
    });
  };

  // Filter logic
  const filteredStudents = students.filter((stu) => {
    const matchesCategory = selectedCategory === "All" || stu.category === selectedCategory;
    const matchesClass = selectedClass === "All" || stu.currentClass === selectedClass;
    const matchesYear = selectedYear === "All" || stu.academicYear === selectedYear;
    const matchesSearch =
      stu.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.guardianName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesClass && matchesYear && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <Users className="w-4 h-4" /> {config.label} Student Directory & Requirement System
          </span>
          <h1 className="font-sans text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mt-1">
            {config.label} Student Management & Exam Clearance
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Upload student lists, manage parent contact information, verify O-Level result slips for TVET Level 3 candidates, and prevent national exam rejections.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Upload Student List</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Student</span>
          </button>

          <button
            onClick={handleOpenReportModal}
            className="px-4 py-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>View Report</span>
          </button>
        </div>
      </div>

      {/* Warning Alert for National Exam Clearance */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
          <p className="text-xs text-amber-900 dark:text-amber-200 font-medium">
            <strong className="font-bold">National Exam Protection:</strong> Students entering TVET Level 3 MUST have a verified S3 O-Level result slip attached. Incomplete profiles are flagged to prevent national exam rejection.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] uppercase shrink-0">
          {students.filter((s) => s.requirementStatus.includes("Blocked")).length} Blocked Candidates
        </span>
      </div>

      {/* Filter Bar */}
      <div className="border border-amber-900/10 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-emerald-600" /> Directory Filters
          </div>
          <span className="text-xs font-semibold text-zinc-500">Showing {filteredStudents.length} Records</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-white cursor-pointer"
            >
              <option value="All">All Academic Years</option>
              <option value="2026">2026 / 2027</option>
              <option value="2025">2025 / 2026</option>
              <option value="2024">2024 / 2025</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Education Pathway</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedClass("All");
              }}
              className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-white cursor-pointer"
            >
              <option value="All">All Pathways</option>
              {config.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Class / Level</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-white cursor-pointer"
            >
              <option value="All">All Classes</option>
              {config.classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Search Student / Parent</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search name, ID, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Student Table */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : (
        <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-bold uppercase tracking-wider border-b border-amber-900/10 dark:border-zinc-800">
                  <th className="py-3.5 px-6">ID & Year</th>
                  <th className="py-3.5 px-6">Student Name</th>
                  <th className="py-3.5 px-6">Class Stream</th>
                  <th className="py-3.5 px-6">Parent Info</th>
                  <th className="py-3.5 px-6">S3 Result Slip</th>
                  <th className="py-3.5 px-6">Exam Clearance Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/10 dark:divide-zinc-800">
                {filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-zinc-600 dark:text-zinc-400">
                      {stu.id}
                      <p className="text-[10px] text-zinc-400 font-normal">{stu.academicYear} Year</p>
                    </td>
                    <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-white">
                      {stu.fullName}
                      <p className="text-[10px] text-zinc-400 font-normal">{stu.gender}</p>
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-700 dark:text-emerald-400">
                      {stu.currentStream || stu.currentClass}
                    </td>
                    <td className="py-4 px-6 space-y-0.5">
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{stu.guardianName}</p>
                      <p className="font-mono text-[10px] text-zinc-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-zinc-400" /> {stu.guardianPhone}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      {isS3SlipRequired(stu) ? (
                        stu.hasS3ResultSlip ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                            <CheckCircle2 className="w-4 h-4" /> Attached
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                            <AlertTriangle className="w-4 h-4 text-rose-600" /> Missing Slip
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-400 font-bold text-[11px]">
                          <FileText className="w-4 h-4" /> N/A
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          stu.requirementStatus.includes("Blocked")
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : stu.requirementStatus.includes("Pending")
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                      >
                        {stu.requirementStatus}
                      </span>
                    </td>

                    {/* Actions Dropdown / Modal triggers */}
                    <td className="py-4 px-6 text-right relative">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveDocsStudent(stu)}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                          title="View Uploaded Documents"
                        >
                          <FileText className="w-4 h-4 text-emerald-600" />
                        </button>

                        <button
                          onClick={() => setActiveMenuId(activeMenuId === stu.id ? null : stu.id)}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Popover Menu */}
                      {activeMenuId === stu.id && (
                        <div className="absolute right-6 top-12 w-48 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-amber-900/10 dark:border-zinc-700 py-1.5 z-20 text-left">
                          <Link
                            href={`/dashboard/${scope}/students/${stu.id}`}
                            onClick={() => setActiveMenuId(null)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-sky-600" /> View Student Profile
                          </Link>
                          <button
                            onClick={() => handleOpenEditModal(stu)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 text-emerald-600" /> Edit Student Details
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(stu.id, stu.fullName)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Delete Student
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400 italic">
                      No students match the selected category, class, year, or search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: View Uploaded Documents */}
      {activeDocsStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase">{activeDocsStudent.id} • Attached Files</span>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white mt-0.5">{activeDocsStudent.fullName}</h3>
              </div>
              <button onClick={() => setActiveDocsStudent(null)} className="p-1 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Uploaded Requirements</h4>
              {activeDocsStudent.documents.map((doc, i) => (
                <div key={i} className="p-3 rounded-xl border border-amber-900/10 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white">{doc.name}</p>
                      <p className="text-[10px] text-zinc-500">{doc.type} • Uploaded {doc.date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      downloadTextFile(
                        `${doc.name.replace(/\.[a-zA-Z0-9]+$/, "")}.txt`,
                        [
                          `Document: ${doc.name}`,
                          `Type: ${doc.type}`,
                          `Uploaded: ${doc.date}`,
                          `Student: ${activeDocsStudent.fullName} (${activeDocsStudent.id})`,
                        ].join("\n"),
                      )
                    }
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Download
                  </button>
                </div>
              ))}

              {activeDocsStudent.documents.length === 0 && (
                <div className="p-4 rounded-xl border border-dashed border-rose-300 bg-rose-50/50 text-center text-rose-800 font-bold">
                  No documents uploaded yet! S3 O-Level result slip is required for TVET Level 3 candidates.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Batch Upload Student List */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">Batch Upload Student List</h3>
                <p className="text-xs text-zinc-500">Paste student records to import multiple students into directory</p>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-1 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[11px] text-zinc-500">Format: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">Student Name, Class, Parent Name, Parent Phone</code></p>
              <textarea
                rows={6}
                placeholder={`Jean Bosco, Senior 1 (S1), Pierre Mugisha, +250 788 111 222\nMarie Claire, Level 3 (L3), Aline Umutoni, +250 783 333 444`}
                value={rawUploadText}
                onChange={(e) => setRawUploadText(e.target.value)}
                className="w-full p-3 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />

              <div className="pt-2 flex justify-end gap-2">
                <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-bold text-xs">Cancel</button>
                <button onClick={handleBatchImport} className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors">Import Roster</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Add / Edit Single Student */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                {editingStudent ? "Update Student Profile" : "Register New Student"}
              </h3>
              <button onClick={() => setIsAddEditModalOpen(false)} className="p-1 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jean Paul Nshimiyimana"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "Male" | "Female")}
                    className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Academic Year</label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Education Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold cursor-pointer"
                  >
                    {config.categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Assigned Class / Stream</label>
                  <select
                    value={formSelectedClassId}
                    onChange={(e) => setFormSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="">-- No Class Selected --</option>
                    {backendClasses
                      // We can filter by the selected category's scope
                      .filter((c) => {
                         const catScope = category === "Primary" ? "PRIMARY" : category === "Nursery" ? "NURSERY" : category === "Lower Secondary" ? "LOWER SECONDARY" : "TVET";
                         return c.scope === catScope;
                      })
                      .map((cls) => {
                      const enrolled = students.filter(s => s.classId === cls.id).length;
                      const capacity = 40;
                      const remaining = Math.max(0, capacity - enrolled);
                      const isFull = remaining === 0;
                      return (
                        <option key={cls.id} value={cls.id} disabled={isFull && (!editingStudent || editingStudent.classId !== cls.id)}>
                          {cls.className} {cls.tradeName ? `(${cls.tradeName})` : ""} - {isFull ? "FULL" : `${remaining} spaces remain`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Parent name"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Parent Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+250 78..."
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Mandatory Requirement Checkbox */}
              <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 flex items-center justify-between">
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-200">National Exam Result Slip Verified?</p>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">Mandatory document for TVET Level 3 registration only</p>
                </div>
                <input
                  type="checkbox"
                  checked={hasS3ResultSlip}
                  onChange={(e) => setHasS3ResultSlip(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-amber-900/10 dark:border-zinc-800 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddEditModalOpen(false)} className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-bold text-xs">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors">Save Student Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Interactive Report Viewer */}
      {activeReport && (
        <ReportViewerModal report={activeReport} onClose={() => setActiveReport(null)} />
      )}
    </div>
  );
}