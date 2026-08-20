"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CATEGORIES } from "@/exports";
import api from "@/lib/api";

interface GalleryRow {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
}

const GallerySection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [items, setItems] = useState<GalleryRow[]>([]);

  useEffect(() => {
    api
      .get<GalleryRow[]>("/admin/public/gallery")
      .then((res) => setItems(res.data))
      .catch(() => setItems([]));
  }, []);

  const filteredGallery =
    selectedCategory === "all"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  return (
    <section className="py-16 md:py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-xs font-semibold tracking-wide mb-3">
            Life at CFSG
          </span>

          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
            Campus Photo Gallery
          </h2>

          <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
            Explore moments from our academic programs, technical workshops, sports activities, and school events.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;

            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20 scale-105"
                    : "bg-[#faf6f0] dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500/40"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-xs border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900"
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
              />

              {/* gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300 flex flex-col justify-end p-5">
                <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 mb-1">
                  {item.category}
                </span>
                <h3 className="text-white font-sans font-bold text-base sm:text-lg leading-snug">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {filteredGallery.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              No photos available in this category yet.
            </p>
          </div>
        )}

      </div>
    </section>
  );
};

export default GallerySection;