"use client";

import React, { useState, type ElementType } from "react";
import {
  Newspaper,
  Image as ImageIcon,
  FileDown,
  MessageSquare,
  BarChart3,
  Users,
  Plus,
  ArrowUpRight,
  Clock,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default function AdminOverviewPage() {
  // Summary KPI Cards Data
  const [stats, setStats] = useState<{ title: string; count: string; change: string; icon: ElementType; color: string; bgColor: string; href: string }[]>([]);
  const [recentMessages, setRecentMessages] = useState<{ id: string; sender: string; subject: string; time: string; status: string }[]>([]);
  const [recentNews, setRecentNews] = useState<{ id: string; title: string; category: string; date: string; views: string }[]>([]);

  return (
    <div className="space-y-8 pb-10">
      {/* Top Header Banner */}
      <div className="border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xs bg-white dark:bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <Users className="w-4 h-4" /> System Administration Control
          </span>
          <h1 className="font-sans text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mt-1">
            Administrator Dashboard
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Manage public website content, institutional reports, announcements, and portal communication.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/dashboard/administrator/news/add"
            className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Post News</span>
          </Link>
          <Link
            href="/dashboard/administrator/gallery/add"
            className="px-4 py-2.5 rounded-2xl border border-amber-900/15 dark:border-zinc-700 bg-amber-900/5 dark:bg-zinc-800 hover:bg-amber-900/10 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <ImageIcon className="w-4 h-4 text-emerald-700" />
            <span>Upload Media</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              href={stat.href}
              className="p-5 rounded-3xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-emerald-600 transition-all group flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div>
                <span className="text-2xl font-serif font-bold text-zinc-900 dark:text-white">
                  {stat.count}
                </span>
                <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-0.5">
                  {stat.title}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  {stat.change}
                </p>
              </div>
            </Link>
          );
        })}
        {stats.length === 0 && (
          <div className="col-span-full p-8 text-center text-zinc-400 text-xs">
            No KPI data available yet.
          </div>
        )}
      </div>

      {/* Main Overview Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Published News & Download Highlights (2 Columns Wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* News & Announcements Widget */}
          <div className="border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
              <h2 className="font-sans font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-emerald-700" />
                Latest Published Articles & News
              </h2>
              <Link
                href="/dashboard/administrator/news"
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentNews.map((news, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-amber-900/5 dark:bg-zinc-800/50 border border-amber-900/10 dark:border-zinc-800 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase">
                        {news.category}
                      </span>
                      <span className="text-[11px] text-zinc-400">{news.date}</span>
                    </div>
                    <h3 className="font-bold text-xs text-zinc-900 dark:text-white line-clamp-1">
                      {news.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 shrink-0">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{news.views} views</span>
                  </div>
                </div>
              ))}
              {recentNews.length === 0 && (
                <div className="p-8 text-center text-zinc-400 text-xs">
                  No news articles published yet.
                </div>
              )}
            </div>
          </div>

          {/* Quick Institutional Download Documents */}
          <div className="border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
              <h2 className="font-sans font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <FileDown className="w-4 h-4 text-emerald-700" />
                Key Portal Downloads & Documents
              </h2>
              <Link
                href="/dashboard/administrator/downloads"
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                Manage Files <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700">
                  <FileDown className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                    School Prospectus 2026.pdf
                  </h4>
                  <p className="text-[10px] text-zinc-400">Public Portal • 2.4 MB</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700">
                  <FileDown className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                    TVET SOD Curriculum Guide.pdf
                  </h4>
                  <p className="text-[10px] text-zinc-400">Academic • 4.1 MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Portal Inquiries & Reports Shortcut (1 Column Wide) */}
        <div className="space-y-6">
          {/* Messages & Inquiries Feed */}
          <div className="border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 pb-3">
              <h2 className="font-sans font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                Recent Portal Messages
              </h2>
              <Link
                href="/dashboard/administrator/contact-messages"
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                All Messages
              </Link>
            </div>

            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3.5 rounded-2xl bg-amber-900/5 dark:bg-zinc-800/40 border border-amber-900/10 dark:border-zinc-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                      {msg.sender}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        msg.status === "Unread"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : msg.status === "Pending"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}
                    >
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-1">
                    {msg.subject}
                  </p>
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" /> {msg.time}
                  </span>
                </div>
              ))}
              {recentMessages.length === 0 && (
                <div className="p-6 text-center text-zinc-400 text-xs">
                  No portal messages received yet.
                </div>
              )}
            </div>
          </div>

          {/* Report Generation Note — reports are generated by the responsible departments */}
          <div className="border border-amber-900/10 dark:border-zinc-800 rounded-3xl p-6 bg-emerald-900 text-white space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" /> Institutional Reporting
            </span>
            <h3 className="font-sans font-bold text-lg">School Reports generated by departments</h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Operational and financial reports are generated, viewed and downloaded directly by the responsible departments — Primary Headmaster (Nursery &amp; Primary), DOS, Bursar, and Store Manager. The Administrator does not generate department reports.
            </p>
            <div className="space-y-1.5 mt-1">
              {[
                { name: "Primary & Nursery Reports", href: "/dashboard/headmaster-primary/primary-reports" },
                { name: "Store Inventory Reports", href: "/dashboard/store-manager/report" },
                { name: "Bursar Financial Reports", href: "/dashboard/bursar/cash-flow" },
              ].map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="flex items-center justify-between gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-bold text-white transition-colors"
                >
                  <span>{r.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}