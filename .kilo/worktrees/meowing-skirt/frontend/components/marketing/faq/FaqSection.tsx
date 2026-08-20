"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { FAQ_DATA } from "@/exports";

const FaqSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const tabs = [
    "All",
    "Admissions",
    "Programs",
    "Fees",
    "Requirements",
    "Communication",
    "General",
  ];

  const filteredFaqs =
    activeTab === "All"
      ? FAQ_DATA
      : FAQ_DATA.filter((faq) => faq.category === activeTab);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-12 md:py-16 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
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
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;

            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-amber-900/10 dark:border-zinc-800 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none"
                >
                  <span className="font-sans font-bold text-base md:text-lg text-zinc-900 dark:text-white pr-4">
                    {faq.question}
                  </span>

                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-800 dark:text-emerald-300 shrink-0 transition-transform duration-200">
                    {isOpen ? (
                      <Minus className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 md:px-6 text-sm md:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed border-t border-amber-900/5 dark:border-zinc-800/80 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FaqSection;