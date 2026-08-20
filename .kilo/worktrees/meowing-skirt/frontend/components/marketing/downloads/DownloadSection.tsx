"use client";

import React, { useState, useEffect } from "react";
import { Download, FileText, ShieldCheck, View, X } from "lucide-react";
import { type DownloadItem } from "@/exports";
import api from "@/lib/api";

const DownloadsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [previewItem, setPreviewItem] = useState<DownloadItem | null>(null);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  useEffect(() => {
    api
      .get<DownloadItem[]>("/admin/public/downloads")
      .then((res) => setDownloads(res.data))
      .catch(() => setDownloads([]));
  }, []);

  const tabs = ["All", "General", "Admissions", "Fees", "Requirements", "Academic"];

  const filteredDownloads =
    activeTab === "All"
      ? downloads
      : downloads.filter((item) => item.category === activeTab);

  return (
    <section className="py-12 md:py-16 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? "bg-emerald-700 text-white shadow-md"
                  : "text-zinc-800 dark:text-zinc-200 border border-amber-900/10 dark:border-zinc-800 hover:bg-[#f3edd1]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-800 dark:bg-emerald-950/30">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-lg text-zinc-900 dark:text-white">Babyeyi documents for parents</h3>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                  Administrators upload the Babyeyi parent document pack here so families can download the next-year requirements, fees, uniforms, and academic calendar.
                </p>
              </div>
            </div>
          </div>
          

          {filteredDownloads.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl border border-amber-900/10 dark:border-zinc-800 p-5 md:p-6 shadow-sm hover:shadow-md hover:border-emerald-600/40 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-lg text-zinc-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold uppercase tracking-wider">
                      {item.fileFormat} • {item.fileSize}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100/80 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPreviewItem(item)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-700 text-emerald-800 dark:text-emerald-300 dark:border-emerald-500/50 bg-white/50 dark:bg-zinc-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all duration-200 text-sm font-semibold shrink-0 cursor-pointer"
                title="Preview this document before downloading"
              >
                <View className="w-4 h-4" />
                <span>View</span>
              </button>

              <a
                href={item.downloadUrl}
                download
                className=" w-full sm:w-auto self-stretch sm:self-center inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-700 text-emerald-800 dark:text-emerald-300 dark:border-emerald-500/50 bg-white/50 dark:bg-zinc-800/50 hover:bg-emerald-700 hover:text-white dark:hover:bg-emerald-700 transition-all duration-200 text-sm font-semibold shrink-0"
              > 
              
                <Download className="w-4 h-4" />
                <span>Download</span>
              </a>
            </div>
          ))}
        </div>

      </div>

      {/* PREVIEW MODAL — view the document before downloading it */}
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
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Document Preview
                  </span>
                  <h2 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">
                    {previewItem.title}
                  </h2>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {previewItem.category} • {previewItem.fileFormat} • {previewItem.fileSize}
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

            {previewItem.downloadUrl.startsWith("blob:") ||
            previewItem.downloadUrl.endsWith(".pdf") ? (
              <div className="rounded-2xl overflow-hidden border border-amber-900/10 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 h-[380px]">
                <iframe
                  src={previewItem.downloadUrl}
                  title={`Preview of ${previewItem.title}`}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-amber-900/10 dark:border-zinc-700 p-8 text-center bg-zinc-50 dark:bg-zinc-800/40">
                <FileText className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Preview not available for this format
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  You can still download the document to open it locally.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/10 dark:border-zinc-800">
              <button
                onClick={() => setPreviewItem(null)}
                className="rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                Close
              </button>
              <a
                href={previewItem.downloadUrl}
                download
                onClick={() => setPreviewItem(null)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-800"
              >
                <Download className="h-4 w-4" /> Download Document
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DownloadsSection;