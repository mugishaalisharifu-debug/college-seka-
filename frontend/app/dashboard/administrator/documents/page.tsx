"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  FileDown,
  Image as ImageIcon,
  Search,
  ExternalLink,
  Loader2,
  FolderOpen,
  Eye,
  X,
  GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getApiErrorMessage, formatDate } from "@/lib/api-helpers";

interface ApplicationDoc {
  id: string;
  applicationId: string;
  documentType: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
  studentName?: string;
  educationLevel?: string;
}

interface DownloadDoc {
  id: string;
  title: string;
  category: string;
  fileSize: string;
  fileFormat: string;
  downloadUrl: string;
  createdAt: string;
}

interface GalleryMedia {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  date: string;
  published: boolean;
}

interface ActivePreview {
  title: string;
  subtitle: string;
  fileUrl: string;
  format?: string;
}

export default function AdminDocumentsPage() {
  const [activeTab, setActiveTab] = useState<"applications" | "downloads" | "gallery">("applications");
  const [appDocs, setAppDocs] = useState<ApplicationDoc[]>([]);
  const [downloadDocs, setDownloadDocs] = useState<DownloadDoc[]>([]);
  const [galleryMedia, setGalleryMedia] = useState<GalleryMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [previewItem, setPreviewItem] = useState<ActivePreview | null>(null);

  useEffect(() => {
    async function loadAllDocuments() {
      setIsLoading(true);
      try {
        const [appsRes, downloadsRes, galleryRes] = await Promise.all([
          api.get<any[]>("/applications"),
          api.get<DownloadDoc[]>("/admin/downloads"),
          api.get<GalleryMedia[]>("/admin/gallery"),
        ]);

        const allAppDocs: ApplicationDoc[] = [];
        for (const app of appsRes.data || []) {
          const studentName = `${app.studentFirstName || ""} ${app.studentLastName || ""}`.trim();
          if (app.documents && Array.isArray(app.documents)) {
            for (const doc of app.documents) {
              allAppDocs.push({
                ...doc,
                studentName: studentName || app.referenceCode,
                educationLevel: app.educationLevel,
              });
            }
          } else {
            try {
              const detail = await api.get<any>(`/applications/${app.id}`);
              if (detail.data.documents && Array.isArray(detail.data.documents)) {
                for (const doc of detail.data.documents) {
                  allAppDocs.push({
                    ...doc,
                    studentName: studentName || app.referenceCode,
                    educationLevel: app.educationLevel,
                  });
                }
              }
            } catch {
              // Ignore single failure
            }
          }
        }

        setAppDocs(allAppDocs);
        setDownloadDocs(downloadsRes.data || []);
        setGalleryMedia(galleryRes.data || []);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load document records."));
      } finally {
        setIsLoading(false);
      }
    }
    loadAllDocuments();
  }, []);

  const filteredAppDocs = appDocs.filter((doc) => {
    const matchesSearch =
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.studentName && doc.studentName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === "All" || doc.educationLevel === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const filteredDownloads = downloadDocs.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const filteredGallery = galleryMedia.filter((media) => {
    const matchesSearch =
      media.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      media.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || media.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-amber-900/10 bg-white p-6 md:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <FolderOpen className="w-4 h-4" /> System Document Repository
          </span>
          <h1 className="font-sans text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mt-1">
            Uploaded Documents &amp; Attachments
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            View, search, and preview student admission attachments, public portal downloads, and institutional media files.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 px-4 py-2.5 rounded-2xl shrink-0">
          <FileText className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <div className="text-left text-xs">
            <p className="font-bold text-emerald-900 dark:text-emerald-300">
              {appDocs.length + downloadDocs.length + galleryMedia.length} Total Files
            </p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Across 3 Repositories</p>
          </div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => { setActiveTab("applications"); setSelectedCategory("All"); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "applications"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Application Docs ({appDocs.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab("downloads"); setSelectedCategory("All"); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "downloads"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            <FileDown className="w-4 h-4" />
            <span>Public Downloads ({downloadDocs.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab("gallery"); setSelectedCategory("All"); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "gallery"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Gallery Media ({galleryMedia.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search documents or student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Main Files Display */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-zinc-500">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
          <span className="text-xs font-bold">Retrieving uploaded files...</span>
        </div>
      ) : (
        <div className="rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
          
          {/* TAB 1: Student Application Documents */}
          {activeTab === "applications" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[11px] font-bold uppercase tracking-wider border-b border-amber-900/10 dark:border-zinc-800">
                    <th className="py-3.5 px-6">Student Applicant</th>
                    <th className="py-3.5 px-6">Document Type</th>
                    <th className="py-3.5 px-6">File Name</th>
                    <th className="py-3.5 px-6">Level / Scope</th>
                    <th className="py-3.5 px-6">Date Uploaded</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-900/10 dark:divide-zinc-800 text-xs">
                  {filteredAppDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-zinc-900 dark:text-white">
                        {doc.studentName}
                      </td>
                      <td className="py-4 px-6 font-semibold text-emerald-700 dark:text-emerald-400">
                        {doc.documentType}
                      </td>
                      <td className="py-4 px-6 font-mono text-zinc-600 dark:text-zinc-300 max-w-xs truncate">
                        {doc.fileName}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase">
                          {doc.educationLevel || "Primary"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-zinc-400">
                        {formatDate(doc.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setPreviewItem({
                            title: doc.documentType,
                            subtitle: `Student: ${doc.studentName} • ${doc.fileName}`,
                            fileUrl: doc.fileUrl,
                            format: doc.fileName.split('.').pop()?.toUpperCase() || 'FILE',
                          })}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview &amp; View</span>
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredAppDocs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-zinc-400 text-xs">
                        No student application documents found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: Public Downloadable Files */}
          {activeTab === "downloads" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[11px] font-bold uppercase tracking-wider border-b border-amber-900/10 dark:border-zinc-800">
                    <th className="py-3.5 px-6">Document Title</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">File Format</th>
                    <th className="py-3.5 px-6">File Size</th>
                    <th className="py-3.5 px-6">Created Date</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-900/10 dark:divide-zinc-800 text-xs">
                  {filteredDownloads.map((doc) => (
                    <tr key={doc.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-zinc-900 dark:text-white">
                        {doc.title}
                      </td>
                      <td className="py-4 px-6 font-semibold text-emerald-700 dark:text-emerald-400">
                        {doc.category}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-zinc-600 dark:text-zinc-300">
                        {doc.fileFormat}
                      </td>
                      <td className="py-4 px-6 text-zinc-500">
                        {doc.fileSize}
                      </td>
                      <td className="py-4 px-6 text-zinc-400">
                        {formatDate(doc.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setPreviewItem({
                            title: doc.title,
                            subtitle: `${doc.category} • ${doc.fileFormat} • ${doc.fileSize}`,
                            fileUrl: doc.downloadUrl,
                            format: doc.fileFormat,
                          })}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview File</span>
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredDownloads.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-zinc-400 text-xs">
                        No downloadable documents match your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Gallery Media */}
          {activeTab === "gallery" && (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredGallery.map((media) => (
                <div
                  key={media.id}
                  className="rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 overflow-hidden space-y-2 p-3"
                >
                  <div className="aspect-video rounded-xl bg-zinc-200 dark:bg-zinc-700 overflow-hidden relative group">
                    <img
                      src={media.imageUrl}
                      alt={media.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      {media.category}
                    </span>
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                      {media.title}
                    </h4>
                  </div>
                  <div className="pt-2 border-t border-amber-900/10 dark:border-zinc-700 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400">{media.date}</span>
                    <button
                      onClick={() => setPreviewItem({
                        title: media.title,
                        subtitle: `${media.category} Media`,
                        fileUrl: media.imageUrl,
                        format: "IMAGE",
                      })}
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> View Image
                    </button>
                  </div>
                </div>
              ))}

              {filteredGallery.length === 0 && (
                <div className="col-span-full py-12 text-center text-zinc-400 text-xs">
                  No gallery media files match your query.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-amber-900/10 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-amber-900/10 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Document Preview
                </span>
                <h2 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">
                  {previewItem.title}
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {previewItem.subtitle}
                </p>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {(() => {
              const url = previewItem.fileUrl;
              const format = previewItem.format || "";
              const ext = format.toLowerCase() || url.split('.').pop()?.split('?')[0].toLowerCase() || '';
              const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'image'].includes(ext) || Boolean(url.match(/\.(png|jpg|jpeg|webp|gif|svg)/i));
              const isPdf = ext === 'pdf' || url.toLowerCase().includes('.pdf');
              const isOffice = ['xlsx', 'xls', 'docx', 'doc', 'pptx', 'ppt', 'csv'].includes(ext) || Boolean(url.match(/\.(xlsx|xls|docx|doc|pptx|ppt|csv)/i));

              if (isImage) {
                return (
                  <div className="flex items-center justify-center p-4 h-[450px] bg-zinc-950/80 rounded-2xl overflow-hidden">
                    <img src={url} alt={previewItem.title} className="max-h-full max-w-full object-contain rounded-lg" />
                  </div>
                );
              }

              if (isPdf) {
                return (
                  <div className="rounded-2xl overflow-hidden border border-amber-900/10 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 h-[480px]">
                    <iframe src={url} title={previewItem.title} className="w-full h-full" />
                  </div>
                );
              }

              if (isOffice && !url.startsWith("blob:")) {
                const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
                return (
                  <div className="rounded-2xl overflow-hidden border border-amber-900/10 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 h-[480px]">
                    <iframe src={officeViewerUrl} title={previewItem.title} className="w-full h-full" />
                  </div>
                );
              }

              return (
                <div className="rounded-2xl border border-dashed border-amber-900/10 dark:border-zinc-700 p-8 text-center bg-zinc-50 dark:bg-zinc-800/40">
                  <FileText className="w-12 h-12 text-emerald-700 mx-auto mb-3" />
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">Document File Ready ({previewItem.format})</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Click Open / Download below to view the file on your device.</p>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/10 dark:border-zinc-800">
              <button
                onClick={() => setPreviewItem(null)}
                className="rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                Close
              </button>
              <a
                href={previewItem.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-800 cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" /> Open / Download File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
