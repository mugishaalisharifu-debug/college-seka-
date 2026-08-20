"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PROGRAMS } from "@/exports";

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

const MainSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6 lg:px-10 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-3">
            Academic Programs
          </span>
          <h2 className="font-bold text-3xl md:text-5xl text-zinc-900 dark:text-white tracking-tight mb-4">
            Education For Every Stage
          </h2>
          <div className="max-w-2xl mx-auto text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            From Early Education to Technical & Vocational Training, we offer comprehensive programs to build a strong educational foundation for every learner.
          </div>
        </motion.div>

        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {PROGRAMS.map((program) => {
            const Icon = program.icon;

            return (
              <motion.div key={program.link} variants={cardVariants}>
                <Link
                  href={program.link}
                  className="group relative flex flex-col bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 transition-all duration-300 hover:scale-[1.03] hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10"
                >
                  <div className="relative w-full h-48 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <Image
                      src={program.cardImage}
                      alt={program.header}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <div className="absolute bottom-3 left-4 p-2.5 rounded-xl bg-emerald-600 text-white shadow-md">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex flex-col flex-grow p-6">
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                      {program.subheader}
                    </span>

                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {program.header}
                    </h3>

                    <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed flex-grow mb-6">
                      {program.description}
                    </p>

                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full mt-12 flex items-center justify-center"
        >
          <Link
            href="/apply"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-emerald-600 text-emerald-600 font-medium hover:shadow-sm hover:shadow-emerald-600 transition-all"
          >
            <span className="text-sm">Apply Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default MainSection;
