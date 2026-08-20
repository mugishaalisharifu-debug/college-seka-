"use client";

import React from "react";
import Link from "next/link";
import { Check, Download, ArrowLeft } from "lucide-react";

export interface PrimarySection {
  title: string;
  classes: string[];
}

export interface PrimaryProgramDetails {
  description: string;
  sections: PrimarySection[];
  features: string[];
  pdfDownloadUrl?: string;
}

const PRIMARY_DATA: PrimaryProgramDetails = {
  description:
    "Primary education develops literacy, numeracy, communication, creativity, leadership, and problem-solving skills. Our curriculum follows the Rwandan Competency-Based Curriculum (CBC) ensuring holistic development of every child.",
  sections: [
    {
      title: "Lower Primary",
      classes: [
        "Primary One (P1)",
        "Primary Two (P2)",
        "Primary Three (P3)",
      ],
    },
    {
      title: "Upper Primary",
      classes: [
        "Primary Four (P4)",
        "Primary Five (P5)",
        "Primary Six (P6)",
      ],
    },
  ],
  features: [
    "Competency-Based Curriculum (CBC)",
    "Science and computer literacy",
    "Sports and physical education",
    "Arts and cultural programs",
    "Leadership and life skills training",
  ],
  pdfDownloadUrl: "/documents/babyeyi-curriculum.pdf",
};

const PrimaryDetailSection: React.FC = () => {
  return (
    <section className="py-12 md:py-16 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        
        <p className="text-zinc-700 dark:text-zinc-300 text-base md:text-lg leading-relaxed mb-10 max-w-4xl">
          {PRIMARY_DATA.description}
        </p>

        <div className="mb-12">
          <h2 className="font-sans text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-6">
            Classes by Section
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRIMARY_DATA.sections.map((sec, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-2xl  border border-amber-900/10 dark:border-zinc-800 transition-all hover:border-emerald-600/40"
              >
                <h3 className="font-sans font-bold text-xl text-zinc-900 dark:text-white mb-3">
                  {sec.title}
                </h3>
                
                <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                  {sec.classes.map((cls, classIdx) => (
                    <p key={classIdx}>{cls}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="font-sans text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-6">
            Program Features
          </h2>

          <div className="flex flex-col gap-3.5">
            {PRIMARY_DATA.features.map((feature, index) => (
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
            Apply for Primary
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

export default PrimaryDetailSection;