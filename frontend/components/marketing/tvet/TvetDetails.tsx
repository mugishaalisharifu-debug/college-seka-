"use client";

import React from "react";
import Link from "next/link";
import { Check, Download, ArrowLeft } from "lucide-react";

export interface TvetTrade {
  id: string;
  title: string;
  description: string;
}

export interface TvetProgramDetails {
  description: string;
  trades: TvetTrade[];
  features: string[];
  pdfDownloadUrl?: string;
}

const TVET_DATA: TvetProgramDetails = {
  description:
    "The TVET department equips students with practical and employable skills through competency-based training. Our hands-on programs prepare graduates for immediate employment or entrepreneurship.",
  trades: [
    {
      id: "food-processing",
      title: "Food Processing",
      description:
        "Learn food preservation, processing techniques, and quality control",
    },
    {
      id: "construction",
      title: "Construction",
      description:
        "Building technology, masonry, and construction management skills",
    },
    {
      id: "mechanics",
      title: "Mechanics",
      description:
        "General mechanics, machine maintenance, and repair techniques",
    },
    {
      id: "automobile-technology",
      title: "Automobile Technology",
      description:
        "Vehicle diagnostics, repair, and automotive engineering",
    },
    {
      id: "veterinary",
      title: "Veterinary",
      description:
        "Animal health, livestock management, and veterinary assistance",
    },
    {
      id: "agriculture",
      title: "Agriculture",
      description:
        "Modern farming, crop production, and agribusiness management",
    },
  ],
  features: [
    "Competency-based training approach",
    "Modern workshops and equipment",
    "Industry partnership programs",
    "Entrepreneurship skills development",
    "Short-term certificate options available",
  ],
  pdfDownloadUrl: "/documents/babyeyi-curriculum.pdf",
};

const TvetDetailSection: React.FC = () => {
  return (
    <section className=" py-12 md:py-16 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        
        <p className="text-zinc-700 text-base md:text-lg leading-relaxed mb-10 max-w-4xl">
          {TVET_DATA.description}
        </p>

        <div className="mb-12">
          <h2 className="font-sans text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-6">
            Available Trades
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TVET_DATA.trades.map((trade) => (
              <div
                key={trade.id}
                className="p-6 rounded-2xl  border border-amber-900/10 dark:border-zinc-800 transition-all hover:border-emerald-600/40 flex flex-col justify-center"
              >
                <h3 className="font-sans font-bold text-xl text-zinc-900 dark:text-white mb-2">
                  {trade.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {trade.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="font-sans text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-6">
            Program Features
          </h2>

          <div className="flex flex-col gap-3.5">
            {TVET_DATA.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>

                <span className="text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-200">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-4">
          <Link
            href="/apply"
            className="px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg text-center"
          >
            Apply for TVET
          </Link>

          <Link
            href="/programs"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#faf3e8] dark:bg-zinc-900 hover:bg-[#f3edd1] text-zinc-800 dark:text-zinc-200 border border-amber-900/15 dark:border-zinc-800 font-semibold text-sm transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Programs</span>
          </Link>

          <Link
            href="/babyeyi"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-800/10 hover:bg-amber-800/20 text-amber-950 dark:text-amber-300 border border-amber-900/20 dark:border-amber-800/40 font-semibold text-sm transition-all duration-200"
          >
            <Download className="w-4 h-4 text-amber-900 dark:text-amber-400" />
            <span>View parent documents</span>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default TvetDetailSection;