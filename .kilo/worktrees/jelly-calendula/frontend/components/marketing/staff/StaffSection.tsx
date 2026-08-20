"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StaffMember, STAFF_DATA } from "@/exports";

interface StaffSectionProps {
  onSelectStaff?: (staff: StaffMember) => void;
}

const StaffSection: React.FC<StaffSectionProps> = ({ onSelectStaff }) => {
  const [activeTab, setActiveTab] = useState<string>("All");

  const tabs = [
    "All",
    "Administration",
    "TVET",
    "Lower Secondary",
    "Primary",
    "Nursery",
    "Accountant & Finance",
  ];

  const filteredStaff =
    activeTab === "All"
      ? STAFF_DATA
      : STAFF_DATA.filter((member) => member.department === activeTab);

  return (
    <section className=" py-12 md:py-16 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? "bg-emerald-700 text-white shadow-md"
                  : " text-zinc-700 dark:text-zinc-300 border border-amber-900/10 dark:border-zinc-800 hover:bg-[#f3edd1]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((staff) => (
            <Link
              key={staff.id}
              href={`/staff/${staff.id}`}
              onClick={() => onSelectStaff && onSelectStaff(staff)}
              className="group  dark:bg-zinc-900/90 rounded-2xl border border-amber-900/10 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-600/40 cursor-pointer flex flex-col"
            >
              <div className="relative w-full h-64 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <Image
                  src={staff.imageUrl}
                  alt={staff.name}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                    {staff.department}
                  </span>

                  {staff.levelsOrClasses && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300">
                      {staff.levelsOrClasses}
                    </span>
                  )}
                </div>

                <h3 className="font-sans font-bold text-xl text-zinc-900 dark:text-white mb-0.5">
                  {staff.name}
                </h3>

                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                  {staff.role}
                </p>

                {staff.courseOrSubject && (
                  <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-3 uppercase tracking-wider">
                    {staff.courseOrSubject}
                  </p>
                )}

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed mt-auto">
                  {staff.bio}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StaffSection;