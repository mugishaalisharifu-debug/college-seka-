"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-start overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/image.jpg"
          alt="College Foundation Campus"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
      </div>

      <div className="max-w-7xl mx-auto px-6 flex items-center justify-center w-full pt-32 pb-20 z-10 text-white">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-6 text-center"
        >
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 px-3.5 py-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold font-sans tracking-wider uppercase backdrop-blur-md"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Admissions Open 2026 – 2027</span>
          </motion.div>

          <motion.div
            variants={item}
            className="font-sans text-center text-2xl sm:text-5xl lg:text-7xl font-normal tracking-tight"
          >
            <h1 className="mb-4">College Foundation Sina</h1>
            <h1>Gerard</h1>
          </motion.div>

          <motion.div variants={item} className="text-zinc-300 text-base font-sans sm:text-lg leading-relaxed">
            <p className="text-center">
              Providing quality education from Nursery through TVET, empowering Rwandan
            </p>
            <p className="text-center">learners with academic knowledge, practical skills, and strong moral values.</p>
          </motion.div>

          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2"
          >
            <Link
              href="/apply"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/25"
            >
              <span className="text-sm">Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/programs"
              className="w-full sm:w-auto text-center px-4 text-sm py-3.5 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all"
            >
              Explore Our Programs
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
    </section>
  );
}
