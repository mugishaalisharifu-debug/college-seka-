"use client";

import React from "react";
import Link from "next/link";
import { Check, Download, ArrowLeft } from "lucide-react";

export interface SecondaryClass {
  id: string;
  title: string;
  code: string;
}

export interface SecondaryProgramDetails {
  description: string;
  classes: SecondaryClass[];
  features: string[];
  pdfDownloadUrl?: string;
}

const SECONDARY_DATA: SecondaryProgramDetails = {
  description:
    "The lower secondary section prepares learners for technical education and future career pathways. Students develop critical thinking, analytical skills, and subject mastery across sciences, humanities, and languages.",
  classes: [
    {
      id: "s1",
      title: "Senior One",
      code: "S1",
    },
    {
      id: "s2",
      title: "Senior Two",
      code: "S2",
    },
    {
      id: "s3",
      title: "Senior Three",
      code: "S3",
    },
  ],
  features: [
    "Comprehensive subject coverage",
    "Science laboratory practicals",
    "Computer and technology education",
    "Career guidance and counseling",
    "Preparation for TVET pathways",
  ],
  pdfDownloadUrl: "/documents/babyeyi-curriculum.pdf",
};

const LowerSecondaryDetailSection: React.FC = () => {
  return (
    <section className="py-12 md:py-16 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        
        <p className="text-zinc-700  text-base md:text-lg leading-relaxed mb-10 max-w-4xl">
          {SECONDARY_DATA.description}
        </p>

        <div className="mb-12">
          <h2 className="font-sans text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-6">
            Available Classes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {SECONDARY_DATA.classes.map((cls) => (
              <div
                key={cls.id}
                className="flex flex-col items-center justify-center p-6 rounded-2xl border border-amber-900/10 dark:border-zinc-800 text-center transition-all hover:border-emerald-600/40"
              >
                <h3 className="font-serif font-bold text-xl text-zinc-900 dark:text-white mb-1">
                  {cls.title}
                </h3>
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  {cls.code}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="font-sans text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-6">
            Program Features
          </h2>

          <div className="flex flex-col gap-3.5">
            {SECONDARY_DATA.features.map((feature, index) => (
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
            Apply for Secondary
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

export default LowerSecondaryDetailSection;