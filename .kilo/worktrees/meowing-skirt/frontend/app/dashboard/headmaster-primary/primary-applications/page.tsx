"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  UserX,
  Search,
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  GraduationCap,
  Phone,
  MapPin,
  X,
  Download,
} from "lucide-react";

interface PrimaryApplication {
  id: string;
  applicantName: string;
  category: "Nursery" | "Primary";
  targetClass: string;
  dateOfBirth: string;
  gender: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  appliedDate: string;
  status: "Pending" | "Approved" | "Rejected";
  documents: {
    passportPhoto: string;
    birthCertificate: string;
    previousReport: string;
  };
}

export default function PrimaryApplicationsReviewPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedApp, setSelectedApp] = useState<PrimaryApplication | null>(null);

  // Mock application database SCOPED ONLY to Nursery and Primary
  const [applications, setApplications] = useState<PrimaryApplication[]>([]);

  // Handle application status change (Approve/Reject)
  const handleUpdateStatus = (id: string, newStatus: "Approved" | "Rejected") => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Filter ONLY Nursery & Primary applications
  const filteredApplications = applications.filter((app) => {
    const matchesCategory =
      selectedCategory === "ALL" || app.category === selectedCategory;
    const matchesStatus =
      statusFilter === "ALL" || app.status === statusFilter;
    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* BREADCRUMB & HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <Link
              href="/dashboard/headmaster-primary"
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-emerald-700 dark:hover:text-emerald-400 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
              Primary & Nursery Applications
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Review and approve prospective Nursery and Primary student applications.
            </p>
          </div>

          <span className="self-start sm:self-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" /> Primary Headmaster Approval Scope
          </span>
        </div>

        {/* CONTROLS & FILTERS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          
          {/* SEARCH */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by student or parent name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* CATEGORY FILTER */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === "ALL"
                    ? "bg-white dark:bg-zinc-700 text-emerald-700 dark:text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                All Sections
              </button>
              <button
                onClick={() => setSelectedCategory("Nursery")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === "Nursery"
                    ? "bg-white dark:bg-zinc-700 text-emerald-700 dark:text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Nursery
              </button>
              <button
                onClick={() => setSelectedCategory("Primary")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === "Primary"
                    ? "bg-white dark:bg-zinc-700 text-emerald-700 dark:text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Primary (P1-P6)
              </button>
            </div>

            {/* STATUS FILTER */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* APPLICATIONS TABLE */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">App ID</th>
                  <th className="px-4 py-3">Applicant Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Target Class</th>
                  <th className="px-4 py-3">Parent Name</th>
                  <th className="px-4 py-3">Applied Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-zinc-400">
                      {app.id}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-white">
                      {app.applicantName}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                        {app.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-700 dark:text-emerald-400">
                      {app.targetClass}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">
                      {app.parentName}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-400">
                      {app.appliedDate}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                          app.status === "Approved"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : app.status === "Rejected"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {app.status === "Approved" && <CheckCircle2 className="w-3 h-3" />}
                        {app.status === "Rejected" && <XCircle className="w-3 h-3" />}
                        {app.status === "Pending" && <Clock className="w-3 h-3" />}
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-[11px] transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredApplications.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                No Nursery or Primary applications found matching your search filters.
              </div>
            )}
          </div>
        </div>

        {/* REVIEW MODAL FOR PRIMARY HEADMASTER */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-zinc-400">{selectedApp.id}</span>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {selectedApp.applicantName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* APPLICANT DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 space-y-1.5">
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                    Academic Target
                  </h4>
                  <p><strong>Section:</strong> {selectedApp.category}</p>
                  <p><strong>Class:</strong> {selectedApp.targetClass}</p>
                  <p><strong>DOB:</strong> {selectedApp.dateOfBirth} ({selectedApp.gender})</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 space-y-1.5">
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                    Parent Contact
                  </h4>
                  <p><strong>Name:</strong> {selectedApp.parentName}</p>
                  <p className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-zinc-400" /> {selectedApp.parentPhone}
                  </p>
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-400" /> {selectedApp.address}
                  </p>
                </div>
              </div>

              {/* UPLOADED DOCUMENTS — view applicant images before approving/downloading */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                    Submitted Documents
                  </h4>
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    3 Documents
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Passport Photo", file: selectedApp.documents.passportPhoto, type: "Photo" },
                    { label: "Birth Certificate", file: selectedApp.documents.birthCertificate, type: "Certificate" },
                    { label: "Past Report", file: selectedApp.documents.previousReport, type: "Report" },
                  ].map((doc) => {
                    const isImage = /\.(jpe?g|png|gif|bmp|webp)$/i.test(doc.file);
                    return (
                      <div
                        key={doc.label}
                        className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                            {doc.label}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                            {doc.type}
                          </span>
                        </div>

                        {/* Thumbnail preview */}
                        <div className="h-24 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-center">
                          {isImage ? (
                            <img
                              src={`/documents/${doc.file}`}
                              alt={doc.label}
                              onError={(e) => {
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.innerHTML =
                                    '<div class="flex flex-col items-center justify-center text-center h-full"><span class="text-[9px] text-zinc-500 px-2">Image preview unavailable — use View or Download</span></div>';
                                }
                              }}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center">
                              <FileText className="w-6 h-6 text-zinc-400" />
                              <span className="text-[9px] text-zinc-500 mt-1 px-2">PDF document</span>
                            </div>
                          )}
                        </div>

                        {/* View / Download actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => window.open(`/documents/${doc.file}`, "_blank")}
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-700/40 px-2 py-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                          <a
                            href={`/documents/${doc.file}`}
                            download
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 px-2 py-1.5 text-[10px] font-bold text-white transition-colors"
                          >
                            <Download className="w-3 h-3" /> Download
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Tip: use <strong>View</strong> to preview the applicant&apos;s uploaded images and documents before approving the application.
                </p>
              </div>

              {/* HEADMASTER ACTION BUTTONS */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => handleUpdateStatus(selectedApp.id, "Rejected")}
                  className="px-5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950 font-semibold text-xs transition-all flex items-center gap-1.5"
                >
                  <UserX className="w-4 h-4" /> Reject Application
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedApp.id, "Approved")}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" /> Approve & Admit Student
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}