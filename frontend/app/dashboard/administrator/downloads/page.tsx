"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Upload,
  Trash2,
  X,
  Search,
  FileCheck,
  Eye,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { type DownloadItem } from "@/exports";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";

const CATEGORIES = ["All", "General", "Admissions", "Academic", "Fees", "Requirements"] as const;
const CATEGORY_OPTIONS: DownloadItem["category"][] = ["General", "Admissions", "Academic", "Fees", "Requirements"];

export default function AdministratorDownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [previewItem, setPreviewItem] = useState<DownloadItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI Action Loading States
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const [form, setForm] = useState<{
    title: string;
    description: string;
    category: DownloadItem["category"];
    fileSize: string;
    fileFormat: string;
    downloadUrl: string;
  }>({
    title: "",
    description: "",
    category: "General",
    fileSize: "1.2 MB",
    fileFormat: "PDF",
    downloadUrl: "#",
  });

  const [fileName, setFileName] = useState<string>("");

  const loadDownloads = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<DownloadItem[]>("/admin/downloads");
      setDownloads(res.data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load document resources."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDownloads();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);

      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr = file.size > 1024 * 1024 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`;
      const ext = file.name.split(".").pop()?.toUpperCase() || "PDF";

      setForm((prev) => ({
        ...prev,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
        fileSize: sizeStr,
        fileFormat: ext,
      }));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Pre-flight Validation
    if (!form.title.trim()) {
      toast.error("Please enter a document title.");
      return;
    }

    if (!selectedFile && (form.downloadUrl === "#" || !form.downloadUrl.trim())) {
      toast.error("Please attach a file or provide a valid download URL.");
      return;
    }

    // 2. Lock UI Guards
    setIsUploading(true);

    // 3. Define Upload Task
    const uploadTask = async () => {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim() || "Official institutional document.");
      fd.append("category", form.category);
      fd.append("downloadUrl", form.downloadUrl === "#" ? "" : form.downloadUrl);
      if (selectedFile) {
        fd.append("file", selectedFile);
      }
      const res = await api.post("/admin/downloads", fd, {
        headers: {
          "Content-Type": undefined,
        },
      });
      return res.data;
    };

    // 4. Promise Toaster Pattern
    try {
      await toast.promise(uploadTask(), {
        loading: "Uploading document resource to server...",
        success: "Document uploaded and published successfully!",
        error: (err) => getApiErrorMessage(err, "Failed to upload document."),
      });

      setShowModal(false);
      setSelectedFile(null);
      setFileName("");
      setForm({
        title: "",
        description: "",
        category: "General",
        fileSize: "1.2 MB",
        fileFormat: "PDF",
        downloadUrl: "#",
      });
      loadDownloads();
    } catch (err) {
      console.error("Document upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this document resource?")) return;

    setDeletingId(id);
    const deleteTask = async () => {
      await api.delete(`/admin/downloads/${id}`);
    };

    try {
      await toast.promise(deleteTask(), {
        loading: "Deleting document from server...",
        success: "Document removed successfully!",
        error: (err) => getApiErrorMessage(err, "Failed to delete document."),
      });
      loadDownloads();
    } catch (err) {
      console.error("Delete document error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const triggerDownload = async (item: DownloadItem) => {
    try {
      if (item.downloadUrl === "#" || !item.downloadUrl) {
        toast.error("No download file attached to this resource yet.");
        return;
      }

      if (item.downloadUrl.startsWith("blob:")) {
        const a = document.createElement("a");
        a.href = item.downloadUrl;
        a.download = `${item.title.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}.${item.fileFormat.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(`Downloading: ${item.title}`);
        return;
      }

      const res = await fetch(item.downloadUrl);
      if (!res.ok) {
        window.open(item.downloadUrl, "_blank");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.title.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}.${item.fileFormat.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Downloading: ${item.title}`);
    } catch {
      window.open(item.downloadUrl, "_blank");
    }
  };

  const filteredDownloads = downloads.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-3xl border border-amber-900/10 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Resource Center
            </span>
            <h1 className="mt-1 font-serif text-2xl font-bold text-zinc-900 dark:text-white">
              Institution Downloads & Documents
            </h1>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-800 shrink-0 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-900/10 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-emerald-700 text-white"
                  : "bg-amber-900/5 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-amber-900/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Document List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
          <span className="text-xs font-bold">Loading document repository...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDownloads.map((item) => {
            const isDeletingThis = deletingId === item.id || deletingId === item.title;

            return (
              <div
                key={item.id || item.title}
                className={`flex flex-col gap-4 rounded-2xl border border-amber-900/10 bg-white p-5 shadow-xs transition-all hover:border-emerald-500/50 md:flex-row md:items-center md:justify-between dark:border-zinc-800 dark:bg-zinc-900 ${
                  isDeletingThis ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                      {item.title}
                    </h2>
                    <p className="mt-1 max-w-xl text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                      <span className="rounded-full bg-emerald-100/60 dark:bg-emerald-950/40 px-2.5 py-0.5 text-emerald-800 dark:text-emerald-400">
                        {item.category}
                      </span>
                      <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5">
                        {item.fileSize}
                      </span>
                      <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 uppercase">
                        {item.fileFormat}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-700/40 px-3.5 py-2 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-50 dark:border-emerald-500/50 dark:text-emerald-300 dark:hover:bg-emerald-950/40 cursor-pointer"
                    title="Preview document before downloading"
                  >
                    <Eye className="h-4 w-4" /> View &amp; Preview
                  </button>
                  <button
                    onClick={() => triggerDownload(item)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-800 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    disabled={isDeletingThis}
                    onClick={() => handleDelete(item.id || item.title)}
                    className="rounded-xl border border-rose-200 p-2 text-rose-600 transition-all hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Document"
                  >
                    {isDeletingThis ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredDownloads.length === 0 && (
            <div className="text-center py-12 rounded-2xl border border-dashed border-amber-900/10 dark:border-zinc-800">
              <p className="text-xs text-zinc-500">No documents found matching your filter.</p>
            </div>
          )}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => !isUploading && setShowModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-amber-900/10 my-8 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-amber-900/10 pb-3">
              <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
                Upload New Institutional Document
              </h2>
              <button
                disabled={isUploading}
                onClick={() => setShowModal(false)}
                className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Select File (PDF, DOCX, ZIP, etc.) *
                </label>
                <div
                  className={`relative border-2 border-dashed border-emerald-900/20 dark:border-zinc-700 rounded-2xl p-4 text-center bg-emerald-900/5 dark:bg-zinc-800/40 ${
                    isUploading ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <input
                    type="file"
                    disabled={isUploading}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  {fileName ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                      <FileCheck className="w-5 h-5" />
                      <span>{fileName}</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 mx-auto text-emerald-700" />
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                        Click to choose a file from device
                      </p>
                      <p className="text-[10px] text-zinc-500">Auto-detects file size &amp; format extension</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  disabled={isUploading}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Academic Prospectus 2026-2027"
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 font-bold focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300">
                  Description
                </label>
                <textarea
                  rows={2}
                  disabled={isUploading}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of the document contents..."
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 font-medium focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-white disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300">
                    Category
                  </label>
                  <select
                    disabled={isUploading}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as DownloadItem["category"] })}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 font-bold focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 disabled:opacity-50"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300">
                    File Format
                  </label>
                  <input
                    type="text"
                    disabled={isUploading}
                    value={form.fileFormat}
                    onChange={(e) => setForm({ ...form, fileFormat: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 font-bold uppercase focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-amber-900/10">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Upload &amp; Publish</span>
                  )}
                </button>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-amber-900/10 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-amber-900/10 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Document Preview
                  </span>
                  <h2 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">
                    {previewItem.title}
                  </h2>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {previewItem.category} &bull; {previewItem.fileFormat} &bull; {previewItem.fileSize}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {previewItem.description}
            </div>

            {(() => {
              const url = previewItem.downloadUrl;
              const format = previewItem.fileFormat || "";
              const ext = format.toLowerCase() || url.split('.').pop()?.split('?')[0].toLowerCase() || '';
              const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) || Boolean(url.match(/\.(png|jpg|jpeg|webp|gif|svg)/i));
              const isPdf = ext === 'pdf' || url.toLowerCase().includes('.pdf');
              const isOffice = ['xlsx', 'xls', 'docx', 'doc', 'pptx', 'ppt', 'csv'].includes(ext) || Boolean(url.match(/\.(xlsx|xls|docx|doc|pptx|ppt|csv)/i));

              if (isImage) {
                return (
                  <div className="flex items-center justify-center p-4 h-[420px] bg-zinc-950/80 rounded-2xl overflow-hidden">
                    <img src={url} alt={previewItem.title} className="max-h-full max-w-full object-contain rounded-lg" />
                  </div>
                );
              }

              if (isPdf) {
                return (
                  <div className="rounded-2xl overflow-hidden border border-amber-900/10 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 h-[450px]">
                    <iframe src={url} title={`Preview of ${previewItem.title}`} className="w-full h-full" />
                  </div>
                );
              }

              if (isOffice && !url.startsWith("blob:")) {
                const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
                return (
                  <div className="rounded-2xl overflow-hidden border border-amber-900/10 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 h-[450px]">
                    <iframe src={officeViewerUrl} title={`Preview of ${previewItem.title}`} className="w-full h-full" />
                  </div>
                );
              }

              return (
                <div className="rounded-2xl border border-dashed border-amber-900/10 dark:border-zinc-700 p-8 text-center bg-zinc-50 dark:bg-zinc-800/40">
                  <FileText className="w-12 h-12 text-emerald-700 mx-auto mb-3" />
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">Document File Ready ({previewItem.fileFormat})</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Click Download below to open or save the file on your device.</p>
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
              <button
                onClick={() => triggerDownload(previewItem)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-800 cursor-pointer"
              >
                <Download className="h-4 w-4" /> Download Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}