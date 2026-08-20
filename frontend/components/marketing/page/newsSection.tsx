"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NEWS_DATA } from "@/exports";
import api from "@/lib/api";
import { formatDate } from "@/lib/api-helpers";

interface LiveNewsItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  createdAt: string;
}

interface RenderedArticle {
  id: string;
  category: string;
  date: string;
  title: string;
  description?: string;
  slug: string;
  isFeatured?: boolean;
}

/** Normalize one item from either the live API or the static fallback into a common shape. */
function toArticle(item: LiveNewsItem): RenderedArticle {
  return {
    id: item.id,
    category: item.category,
    date: formatDate(item.createdAt) || "",
    title: item.title,
    description: item.summary,
    slug: item.slug,
  };
}

const NewsSection: React.FC = () => {
  const [news, setNews] = useState<RenderedArticle[]>(() =>
    NEWS_DATA.map((item) => ({ ...item })),
  );

  useEffect(() => {
    api
      .get<LiveNewsItem[]>("/admin/public/news")
      .then((res) => {
        const live = Array.isArray(res.data) ? res.data : [];
        if (live.length > 0) {
          setNews(live.map(toArticle));
          return;
        }
        setNews(NEWS_DATA.map((item) => ({ ...item })));
      })
      .catch(() => {
        setNews(NEWS_DATA.map((item) => ({ ...item })));
      });
  }, []);

  const featuredNews =
    news.find((item) => item.isFeatured) || news[0] || NEWS_DATA[0];
  const sideNewsList = news.filter((item) => item.id !== featuredNews.id);

  return (
    <section className=" py-16 md:py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:text-emerald-400 text-xs font-semibold tracking-wide mb-3">
              Latest Updates
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
              News & Announcements
            </h2>
          </div>

          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-400 hover:text-emerald-900 transition-colors self-start sm:self-auto"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Content Grid*/}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Features Main Grid */}
          {featuredNews && (
            <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-2xl  dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500/30 transition-all duration-300">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-xs font-semibold">
                    {featuredNews.category}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {featuredNews.date}
                  </span>
                </div>

                <h3 className="font-sans text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-4 leading-tight">
                  {featuredNews.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                  {featuredNews.description}
                </p>
              </div>

              <Link
                href={`/news/${featuredNews.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-400 hover:text-emerald-900 transition-colors w-fit"
              >
                <span>Read More</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Normal Group Grid */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {sideNewsList.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group p-6 rounded-2xl ] dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500/40 hover:shadow-sm transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-xs font-medium">
                    {item.category}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {item.date}
                  </span>
                </div>

                <h4 className="font-sans font-bold text-base text-zinc-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                  {item.title}
                </h4>
              </Link>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default NewsSection;