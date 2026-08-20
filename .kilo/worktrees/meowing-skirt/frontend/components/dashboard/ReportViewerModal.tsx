"use client";

import React from "react";
import { X, Printer, Download, FileText, CheckCircle2, ShieldCheck } from "lucide-react";

export interface ReportData {
  id: string;
  title: string;
  academicYear: string;
  term?: string;
  generatedDate: string;
  generatedBy: string;
  summary: string;
  headers: string[];
  rows: string[][];
}

interface ReportViewerModalProps {
  report: ReportData;
  onClose: () => void;
}

export default function ReportViewerModal({ report, onClose }: ReportViewerModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [report.headers.join(","), ...report.rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${report.id}_${report.title.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Print-only styling: when printing, hide the entire app and only show this report.
          This gives a clean, targeted print of the selected report instead of the whole screen. */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #printable-report-area, #printable-report-area * { visibility: visible !important; }
          #printable-report-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 24px !important;
          }
          .report-print-no-print { display: none !important; }
        }
      `}</style>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div id="printable-report-area" className="bg-white dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto font-sans text-xs">
        
        {/* Top Actions — hidden when printing the targeted report */}
        <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-4 report-print-no-print">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">
                Official School Report Preview • {report.id}
              </span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">{report.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-amber-900/10 dark:border-zinc-800">
          <div>
            <p className="text-[10px] text-zinc-400 uppercase font-bold">Academic Year</p>
            <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{report.academicYear}</p>
          </div>
          {report.term && (
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-bold">School Term</p>
              <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{report.term}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] text-zinc-400 uppercase font-bold">Generated Date</p>
            <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{report.generatedDate}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 uppercase font-bold">Authority</p>
            <p className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{report.generatedBy}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-zinc-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Executive Report Summary
          </h4>
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed bg-amber-900/5 dark:bg-zinc-800/30 p-3 rounded-xl border border-amber-900/10 dark:border-zinc-800">
            {report.summary}
          </p>
        </div>

        {/* Formatted Data Table */}
        <div className="rounded-2xl border border-amber-900/10 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-emerald-900/10 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px] border-b border-amber-900/10 dark:border-zinc-800">
              <tr>
                {report.headers.map((h, i) => (
                  <th key={i} className="py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/10 dark:divide-zinc-800">
              {report.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-amber-900/10 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <p>College Fondation Sina Gerard — Official Document System</p>
          <p className="flex items-center gap-1 text-emerald-600 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Signature
          </p>
        </div>
      </div>
      </div>
    </>
  );
}
