"use client";

import React from "react";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import { STATS } from "@/exports";

const parseCount = (count: string): { value: number; suffix: string } => {
  const match = count.match(/([\d,]+)([+,k]*)/i);
  if (!match) return { value: 0, suffix: "" };
  const value = parseInt(match[1].replace(/,/g, ""), 10);
  return { value, suffix: match[2] || "" };
};

const StatsSection: React.FC = () => {
  return (
    <section className="bg-emerald-600 py-10 md:py-14 text-white overflow-hidden">
      <div className="px-4 md:px-6 lg:px-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            const { value, suffix } = parseCount(stat.count);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: index * 0.12, ease: "easeOut" }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 + index * 0.12 }}
                  className="w-12 h-12 flex items-center justify-center mb-3 rounded-full bg-white/15 backdrop-blur-xs"
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>

                <p className="font-heading font-bold text-2xl md:text-3xl text-white tracking-tight">
                  <CountUp end={value} duration={2} separator="," enableScrollSpy scrollSpyOnce />
                  {suffix}
                </p>
                <p className="text-sm font-medium text-emerald-100/80 mt-1">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

