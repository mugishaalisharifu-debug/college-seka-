"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { NEWSCATEGORIES, CategoryFilter } from "@/exports";
import api from "@/lib/api";
import { formatDate } from "@/lib/api-helpers";

interface NewsRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  createdAt: string;
}

const NewsGridSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [articles, setArticles] = useState<NewsRow[]>([]);

  useEffect(() => {
    api
      .get<NewsRow[]>("/admin/public/news")
      .then((res) => setArticles(res.data))
      .catch(() => setArticles([]));
  }, []);

  const filteredArticles =
    selectedCategory === "All"
      ? articles
      : articles.filter((item) => item.category === selectedCategory);

  return (
    <section className="py-12 md:py-16 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* CATEGORY FILTER PILLS */}
        <div className="flex flex-wrap items-center gap-2.5 mb-10">
          {NEWSCATEGORIES.map((category) => {
            const isActive = selectedCategory === category;

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-[#f3edd1]/50 dark:bg-zinc-900 text-amber-950 dark:text-zinc-300 hover:bg-[#e9e2c2]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* 3-COLUMN NEWS CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="group flex flex-col justify-between p-6 sm:p-7 rounded-2xl  dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500/50 hover:shadow-md transition-all duration-300 min-h-[220px]"
            >
              <div>
                {/* CATEGORY BADGE & DATE */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-xs font-semibold">
                    {article.category}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDate(article.createdAt)}
                  </span>
                </div>

                {/* ARTICLE TITLE */}
                <h3 className="font-sans font-bold text-lg sm:text-xl text-zinc-900 dark:text-white mb-3 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                  {article.title}
                </h3>

                {/* ARTICLE SUMMARY */}
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                  {article.summary}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-sm">
              No news or announcements found in this category.
            </p>
          </div>
        )}

      </div>
    </section>
  );
};

export default NewsGridSection;