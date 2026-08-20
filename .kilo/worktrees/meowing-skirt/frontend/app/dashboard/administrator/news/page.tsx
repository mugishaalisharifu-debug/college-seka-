"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  Clock,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getApiErrorMessage, formatDate } from "@/lib/api-helpers";

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content?: string;
  category: string;
  date: string;
  status: "Published" | "Draft";
}

const NEWSCATEGORIES = ["All", "General", "Admissions", "Facilities", "Events"];

interface NewsRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content?: string | null;
  category: string;
  status: "Published" | "Draft";
  createdAt: string;
}

function toArticle(row: NewsRow): NewsArticle {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    content: row.content ?? "",
    category: row.category,
    date: formatDate(row.createdAt),
    status: row.status,
  };
}

export default function AdministratorNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // UI Action Loading States
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    category: "General",
    date: "",
    status: "Published" as "Published" | "Draft",
  });

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<NewsRow[]>("/admin/news");
      setArticles(res.data.map(toArticle));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load news articles."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    
    setForm((prev) => ({
      ...prev,
      title,
      slug: editing ? prev.slug : slug,
    }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      title: "",
      slug: "",
      summary: "",
      content: "",
      category: "General",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      status: "Published",
    });
    setShowModal(true);
  };

  const openEdit = (n: NewsArticle) => {
    setEditing(n);
    setForm({
      title: n.title,
      slug: n.slug,
      summary: n.summary,
      content: n.content || "",
      category: n.category,
      date: n.date,
      status: n.status,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Pre-flight Validation
    if (!form.title.trim()) {
      toast.error("Please enter a headline title.");
      return;
    }
    if (!form.summary.trim()) {
      toast.error("Please enter a marketing article summary.");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("URL Slug is required.");
      return;
    }

    // 2. Lock UI Submit Guards
    setIsSaving(true);

    // 3. Define Save Task
    const saveTask = async () => {
      if (editing) {
        const res = await api.put(`/admin/news/${editing.id}`, {
          title: form.title.trim(),
          slug: form.slug.trim(),
          summary: form.summary.trim(),
          content: form.content.trim(),
          category: form.category,
          status: form.status,
        });
        return res.data;
      } else {
        const res = await api.post("/admin/news", {
          title: form.title.trim(),
          slug: form.slug.trim(),
          summary: form.summary.trim(),
          content: form.content.trim(),
          category: form.category,
          status: form.status,
        });
        return res.data;
      }
    };

    // 4. Promise Toaster Pattern
    try {
      await toast.promise(saveTask(), {
        loading: editing ? "Updating news article..." : "Publishing news announcement...",
        success: editing ? "Article updated successfully!" : "Article published successfully!",
        error: (err) => getApiErrorMessage(err, "Failed to save the news article."),
      });

      setShowModal(false);
      loadArticles();
    } catch (err) {
      console.error("Save news article error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this news article from the system?")) return;

    setDeletingId(id);
    const deleteTask = async () => {
      await api.delete(`/admin/news/${id}`);
    };

    try {
      await toast.promise(deleteTask(), {
        loading: "Deleting article...",
        success: "News article deleted!",
        error: (err) => getApiErrorMessage(err, "Failed to delete article."),
      });
      loadArticles();
    } catch (err) {
      console.error("Delete article error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const togglePublish = async (id: string) => {
    setTogglingId(id);
    const toggleTask = async () => {
      await api.patch(`/admin/news/${id}/toggle-status`);
    };

    try {
      await toast.promise(toggleTask(), {
        loading: "Updating article status...",
        success: "Status updated successfully!",
        error: (err) => getApiErrorMessage(err, "Failed to update article status."),
      });
      loadArticles();
    } catch (err) {
      console.error("Toggle status error:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const filteredArticles = articles.filter((item) => {
    const matchesCat =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const publishedCount = articles.filter((n) => n.status === "Published").length;
  const draftCount = articles.filter((n) => n.status === "Draft").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-3xl border border-amber-900/10 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-100 p-3.5 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Marketing &amp; Public Portal Sync
              </p>
              <h1 className="font-sans text-2xl font-bold text-zinc-900 dark:text-white">
                School News &amp; Announcements
              </h1>
            </div>
          </div>

          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-800 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Publish Update
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-900/10 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-bold">
            <span>Total Announcements</span>
            <Megaphone className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-zinc-900 dark:text-white">
            {isLoading ? "..." : articles.length}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-900/10 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-bold">
            <span>Live on Marketing Grid</span>
            <Check className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-emerald-700 dark:text-emerald-400">
            {isLoading ? "..." : publishedCount}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-900/10 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-bold">
            <span>Internal Drafts</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-amber-600 dark:text-amber-400">
            {isLoading ? "..." : draftCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-900/10 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {NEWSCATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === category
                  ? "bg-emerald-700 text-white"
                  : "bg-amber-900/5 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-amber-900/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search headline or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* ADMIN NEWS GRID */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
          <span className="text-xs font-bold">Loading news announcements...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => {
            const isDeletingThis = deletingId === article.id;
            const isTogglingThis = togglingId === article.id;

            return (
              <div
                key={article.id}
                className={`group flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 min-h-[220px] shadow-xs ${
                  isDeletingThis ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-xs font-semibold">
                        {article.category}
                      </span>
                      <button
                        disabled={isTogglingThis || isDeletingThis}
                        onClick={() => togglePublish(article.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 ${
                          article.status === "Published"
                            ? "bg-emerald-700 text-white"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                        } ${isTogglingThis ? "opacity-75 cursor-not-allowed" : ""}`}
                      >
                        {isTogglingThis ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          article.status
                        )}
                      </button>
                    </div>

                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {article.date}
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-base sm:text-lg text-zinc-900 dark:text-white mb-2 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3 mb-4">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-emerald-600" /> /{article.slug}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(article)}
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 cursor-pointer"
                      title="Edit Article"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      disabled={isDeletingThis || isTogglingThis}
                      onClick={() => handleDelete(article.id)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Article"
                    >
                      {isDeletingThis ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredArticles.length === 0 && (
            <div className="col-span-full text-center py-12 rounded-2xl border border-dashed border-amber-900/10 dark:border-zinc-800">
              <p className="text-xs text-zinc-500">No news announcements match your filter.</p>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => !isSaving && setShowModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-amber-900/10 my-8 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-amber-900/10 pb-3">
              <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
                {editing ? "Edit News Announcement" : "Publish Announcement"}
              </h2>
              <button
                disabled={isSaving}
                onClick={() => setShowModal(false)}
                className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300">
                  Headline Title *
                </label>
                <input
                  type="text"
                  required
                  disabled={isSaving}
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Admissions intake for 2026–2027 is now open"
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 font-bold focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-white disabled:opacity-50"
                />
              </div>

              {/* Generated Slug */}
              <div>
                <label className="mb-1 block font-bold text-zinc-500 dark:text-zinc-400">
                  URL Slug (Auto-generated for Marketing) *
                </label>
                <input
                  type="text"
                  required
                  disabled={isSaving}
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 font-mono text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 dark:border-zinc-700 disabled:opacity-50"
                />
              </div>

              {/* Marketing Summary */}
              <div>
                <label className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300">
                  Marketing Article Summary *
                </label>
                <textarea
                  rows={3}
                  required
                  disabled={isSaving}
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="Summary snippet displayed on the 3-column news grid..."
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 font-medium focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-white disabled:opacity-50"
                />
              </div>

              {/* Category, Status & Date */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300">
                    Category
                  </label>
                  <select
                    disabled={isSaving}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 font-bold focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 disabled:opacity-50"
                  >
                    {NEWSCATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300">
                    Status
                  </label>
                  <select
                    disabled={isSaving}
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as "Published" | "Draft",
                      })
                    }
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 font-bold focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 disabled:opacity-50"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300">
                    Publish Date
                  </label>
                  <input
                    type="text"
                    disabled={isSaving}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 font-medium focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Full Content */}
              <div>
                <label className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300">
                  Full Article Body (Optional)
                </label>
                <textarea
                  rows={4}
                  disabled={isSaving}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Detailed article body text for the full view page..."
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 font-medium focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-white disabled:opacity-50"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-3 border-t border-amber-900/10">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editing ? "Save Changes" : "Publish Announcement"}</span>
                  )}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}