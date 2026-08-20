"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  UserCheck,
  X,
  GraduationCap,
  Boxes,
  Wrench,
  Filter,
} from "lucide-react";
import ReportViewerModal, { ReportData } from "@/components/dashboard/ReportViewerModal";
import { AcademicScope, EducationCategory, getScopeConfig } from "@/lib/role-scope";

// Types matching Rwandan Academic Structure
type AcademicCategory = EducationCategory;

interface ClassStream {
  id: string;
  category: AcademicCategory;
  tradeName?: string; // Only for TVET (e.g. Agriculture, Mechanics, Software Dev)
  levelName: string; // e.g. "Primary 5", "S2", "L4 Agriculture"
  streamName: string; // e.g. "P5B", "S2A", "L4-AGRI-A"
  enrolled: number;
  capacity: number;
}

interface Application {
  id: string;
  applicantName: string;
  parentName: string;
  parentPhone: string;
  appliedCategory: AcademicCategory;
  appliedTrade?: string; 
  appliedLevel: string;
  submissionDate: string;
  status: "Pending" | "Approved" | "Rejected";
  assignedClass?: string;
  documentsUploaded: string[];
}

const ALL_CATEGORIES_OPTION = "All Trades & Categories";

// Backend `education_level` → local UI category.
function levelToCategory(level: string): AcademicCategory {
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

interface BackendApplication {
  id: string;
  referenceCode: string;
  studentFirstName: string;
  studentLastName: string;
  educationLevel: string;
  tradeName?: string | null;
  appliedClass: string;
  parentName: string;
  parentPhone: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface BackendClass {
  id: string;
  className: string;
  scope?: string | null;
  tradeName?: string | null;
}

interface BackendDocument {
  id: string;
  documentType: string;
  fileUrl: string;
  fileName: string;
}

// Backend class rows → local ClassStream shape, deriving streamName from the class name.
function mapBackendClasses(rows: BackendClass[]): ClassStream[] {
  return (rows || []).map((c) => ({
    id: c.id,
    category: levelToCategory(c.scope || "PRIMARY"),
    tradeName: c.tradeName || undefined,
    levelName: c.className,
    streamName: c.className,
    enrolled: 0,
    capacity: 40,
  }));
}

// Backend application rows → local UI shape.
function mapApplications(rows: BackendApplication[]): Application[] {
  return (rows || []).map((a) => ({
    id: a.id,
    applicantName: `${a.studentFirstName} ${a.studentLastName}`.trim(),
    parentName: a.parentName,
    parentPhone: a.parentPhone,
    appliedCategory: levelToCategory(a.educationLevel),
    appliedTrade: a.tradeName || undefined,
    appliedLevel: a.appliedClass,
    submissionDate: new Date(a.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    status: a.status === "APPROVED" ? "Approved" : a.status === "REJECTED" ? "Rejected" : "Pending",
    assignedClass: a.appliedClass,
    documentsUploaded: [],
  }));
}

export default function ApplicationsReview({ scope }: { scope: AcademicScope }) {
  const config = getScopeConfig(scope);
  const supportsTrades = scope === "tvet";

  // Classes loaded live from /dos/classes (dynamic, managed by DOS dashboards).
  const [availableClasses, setAvailableClasses] = useState<ClassStream[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedTradeFilter, setSelectedTradeFilter] = useState<string>(ALL_CATEGORIES_OPTION);
  
  // Modal State
  const [activeModalApp, setActiveModalApp] = useState<Application | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [activeReport, setActiveReport] = useState<ReportData | null>(null);

  const scopedTrades = Array.from(
    new Set(
      availableClasses
        .filter((c) => config.categories.includes(c.category))
        .map((c) => c.tradeName)
        .filter((t): t is string => Boolean(t))
    )
  );
  const filterOptions = [ALL_CATEGORIES_OPTION, ...scopedTrades, ...config.categories];

  useEffect(() => {
    async function load() {
      try {
        const [classesRes, appRes] = await Promise.all([
          api.get<BackendClass[]>("/dos/classes"),
          api.get<BackendApplication[]>("/applications"),
        ]);
        setAvailableClasses(mapBackendClasses(classesRes.data));
        setApplications(mapApplications(appRes.data));
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not load applications."));
      }
    }
    load();
  }, []);

  const handleOpenApplicationsReport = () => {
    setActiveReport({
      id: "RPT-DOS-APP-2026",
      title: "Online Admissions & Stream Assignment Audit Report",
      academicYear: "2026/2027",
      generatedDate: "August 11, 2026",
      generatedBy: `Director of Studies Office — ${config.label}`,
      summary: "Full summary of student applications, assigned sub-classes, TVET trade allocations, and uploaded document verification statuses.",
      headers: ["App Code", "Applicant Name", "Category / Trade", "Applied Level", "Assigned Stream", "Status"],
      rows: applications.map((a) => [
        a.id,
        a.applicantName,
        a.appliedTrade ? `${a.appliedCategory} (${a.appliedTrade})` : a.appliedCategory,
        a.appliedLevel,
        a.assignedClass || "Unassigned",
        a.status,
      ]),
    });
  };

  // Filter logic covering search, status, AND trade/category
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.appliedLevel.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === "All" || app.status === selectedStatus;

    const matchesTrade =
      selectedTradeFilter === ALL_CATEGORIES_OPTION ||
      app.appliedTrade === selectedTradeFilter ||
      app.appliedCategory === selectedTradeFilter;

    return matchesSearch && matchesStatus && matchesTrade;
  });

  const handleOpenReviewModal = async (app: Application) => {
    // Preload the actual uploaded documents for this application.
    let liveDocs: string[] = [];
    try {
      const res = await api.get<BackendApplication & { documents?: BackendDocument[] }>(
        `/applications/${app.id}`,
      );
      liveDocs = (res.data.documents || []).map((d) => d.fileUrl);
    } catch {
      // Fall back to whatever the row already holds.
    }

    setActiveModalApp({ ...app, documentsUploaded: liveDocs });
    setSelectedClassId("");
    if (supportsTrades && app.appliedTrade) {
      setSelectedTrade(app.appliedTrade);
    } else {
      setSelectedTrade("");
    }
  };

  const handleApproveAndAssign = async () => {
    if (!activeModalApp || !activeModalApp.id) return;

    const chosenClass = availableClasses.find((c) => c.id === selectedClassId);

    try {
      await api.patch(`/applications/${activeModalApp.id}/status`, {
        status: "APPROVED",
      });
      toast.success("Application approved.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to approve the application."));
      return;
    }

    setApplications((prev) =>
      prev.map((app) =>
        app.id === activeModalApp.id
          ? {
              ...app,
              status: "Approved",
              assignedClass: chosenClass ? chosenClass.streamName : "Assigned",
            }
          : app
      )
    );

    setActiveModalApp(null);
  };

  const handleReject = async () => {
    if (!activeModalApp || !activeModalApp.id) return;

    try {
      await api.patch(`/applications/${activeModalApp.id}/status`, {
        status: "REJECTED",
      });
      toast.success("Application rejected.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to reject the application."));
      return;
    }

    setApplications((prev) =>
      prev.map((app) =>
        app.id === activeModalApp.id ? { ...app, status: "Rejected" } : app
      )
    );

    setActiveModalApp(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Admissions & Class Stream Allocation
          </span>
          <h1 className="font-sans text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mt-1">
            {config.label} Online Applications
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Verify student information, select sub-classes and assign
            {supportsTrades ? " TVET trades" : " streams"} for {config.label}.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-4 py-2 rounded-2xl">
            <UserCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <div className="text-left text-xs">
              <p className="font-bold text-emerald-900 dark:text-emerald-300">
                {applications.filter((a) => a.status === "Pending").length} Pending
              </p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Awaiting Action</p>
            </div>
          </div>

          <button
            onClick={handleOpenApplicationsReport}
            className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Eye className="w-4 h-4" /> View Report
          </button>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xs">
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search student, ID, level..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Trade / Faculty Filter Dropdown */}
          <div className="relative w-full sm:w-56">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700 dark:text-emerald-400 pointer-events-none" />
            <select
              value={selectedTradeFilter}
              onChange={(e) => setSelectedTradeFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
            >
              {filterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
          {["All", "Pending", "Approved", "Rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedStatus === status
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[11px] font-bold uppercase tracking-wider border-b border-amber-900/10 dark:border-zinc-800">
                <th className="py-3.5 px-6">App Code</th>
                <th className="py-3.5 px-6">Applicant Name</th>
                <th className="py-3.5 px-6">Category / Trade</th>
                <th className="py-3.5 px-6">Applied Level</th>
                <th className="py-3.5 px-6">Assigned Sub-Class</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/10 dark:divide-zinc-800 text-xs">
              {filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    {app.id}
                  </td>
                  <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-white">
                    {app.applicantName}
                  </td>
                  <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">
                    <span className="font-bold text-amber-800 dark:text-amber-400">{app.appliedCategory}</span>
                    {app.appliedTrade && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold ml-1">
                        ({app.appliedTrade})
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-medium text-zinc-700 dark:text-zinc-300">
                    {app.appliedLevel}
                  </td>
                  <td className="py-4 px-6 font-bold text-emerald-700 dark:text-emerald-400">
                    {app.assignedClass || "—"}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        app.status === "Pending"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                          : app.status === "Approved"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                      }`}
                    >
                      {app.status === "Pending" && <Clock className="w-3 h-3" />}
                      {app.status === "Approved" && <CheckCircle2 className="w-3 h-3" />}
                      {app.status === "Rejected" && <XCircle className="w-3 h-3" />}
                      <span>{app.status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleOpenReviewModal(app)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review & Assign</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredApplications.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-400 text-xs">
                    No applications match the selected trade, status, or search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Class Stream Assignment Modal */}
      {activeModalApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                  {activeModalApp.appliedCategory} Admission Review • {activeModalApp.id}
                </span>
                <h3 className="font-serif text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
                  {activeModalApp.applicantName}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalApp(null)}
                className="p-1 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Information Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-600" /> Student Profile & Application Details
              </h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Parent / Guardian</p>
                  <p className="font-semibold text-zinc-900 dark:text-white mt-0.5">{activeModalApp.parentName}</p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Parent Phone</p>
                  <p className="font-semibold text-zinc-900 dark:text-white mt-0.5 font-mono">{activeModalApp.parentPhone}</p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Requested Level</p>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">{activeModalApp.appliedLevel}</p>
                </div>
              </div>
            </div>

            {/* Uploaded Documents */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Submitted Attachments</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeModalApp.documentsUploaded.map((docUrl, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border border-amber-900/10 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                        {docUrl.split("/").pop() || "document"}
                      </span>
                    </div>
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 dark:text-emerald-400 hover:underline text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      View
                    </a>
                  </div>
                ))}
                {activeModalApp.documentsUploaded.length === 0 && (
                  <p className="text-[11px] text-zinc-400 italic col-span-full">
                    No documents uploaded with this application.
                  </p>
                )}
              </div>
            </div>

            {/* CLASS STREAM & FACULTY ALLOCATION SECTION */}
            <div className="space-y-3 p-4 rounded-2xl border border-emerald-900/20 dark:border-emerald-800/30 bg-emerald-950/5 dark:bg-emerald-950/20">
              
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-emerald-700" />
                  Assign Sub-Class / Stream
                </label>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                  {activeModalApp.appliedCategory} System
                </span>
              </div>

              {/* Special Flow for TVET: Select Trade First */}
              {supportsTrades && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" /> Select TVET Trade / Faculty
                  </label>
                  <select
                    value={selectedTrade}
                    onChange={(e) => {
                      setSelectedTrade(e.target.value);
                      setSelectedClassId("");
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white cursor-pointer"
                  >
                    <option value="">-- Choose Trade / Faculty --</option>
                    {scopedTrades.map((trade) => (
                      <option key={trade} value={trade}>
                        Faculty of {trade}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sub-class List with Real-time seat checks */}
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-bold text-zinc-500">Available Sub-Classes & Seats:</p>

                {availableClasses.filter((c) => {
                  if (supportsTrades) {
                    return c.category === "TVET" && c.tradeName === selectedTrade;
                  }
                  return c.category === activeModalApp.appliedCategory && c.levelName === activeModalApp.appliedLevel;
                }).map((cls) => {
                  const seatsLeft = cls.capacity - cls.enrolled;
                  const isFull = seatsLeft <= 0;
                  const isSelected = selectedClassId === cls.id;

                  return (
                    <div
                      key={cls.id}
                      onClick={() => !isFull && setSelectedClassId(cls.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isFull
                          ? "opacity-50 border-rose-200 bg-rose-50/20 dark:bg-rose-950/20 cursor-not-allowed"
                          : isSelected
                          ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 ring-2 ring-emerald-600"
                          : "border-amber-900/10 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-emerald-500"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-2">
                          {cls.streamName}
                          {cls.tradeName && (
                            <span className="text-[10px] font-normal text-amber-700 dark:text-amber-400">
                              ({cls.tradeName})
                            </span>
                          )}
                        </p>
                      </div>

                      <div>
                        {isFull ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold uppercase">
                            Class Full
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold uppercase">
                            {seatsLeft} Seats Available
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Empty State when no classes exist */}
                {availableClasses.filter((c) =>
                  supportsTrades
                    ? c.category === "TVET" && c.tradeName === selectedTrade
                    : c.category === activeModalApp.appliedCategory && c.levelName === activeModalApp.appliedLevel
                ).length === 0 && (
                  <p className="text-xs text-zinc-400 italic p-3 text-center bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                    {supportsTrades && !selectedTrade
                      ? "Please select a TVET Trade / Faculty above to see available classes."
                      : "No sub-classes defined yet for this level."}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-amber-900/10 dark:border-zinc-800 flex items-center justify-between gap-3">
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-xs hover:bg-rose-700 hover:text-white transition-all cursor-pointer"
              >
                Reject Application
              </button>

              <button
                disabled={!selectedClassId}
                onClick={handleApproveAndAssign}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                  !selectedClassId
                    ? "bg-zinc-300 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
                    : "bg-emerald-700 text-white hover:bg-emerald-800"
                }`}
              >
                Approve & Assign to Stream
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Interactive Report Modal */}
      {activeReport && (
        <ReportViewerModal report={activeReport} onClose={() => setActiveReport(null)} />
      )}
    </div>
  );
}