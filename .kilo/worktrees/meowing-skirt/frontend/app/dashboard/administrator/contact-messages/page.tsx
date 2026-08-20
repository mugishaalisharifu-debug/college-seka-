"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  MessageSquareText,
  Check,
  X,
  Send,
  Trash2,
  Search,
  Phone,
  User,
  Eye,
  Reply,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getApiErrorMessage, formatDate } from "@/lib/api-helpers";

export interface ContactMessage {
  id: string;
  sender: string;
  email: string;
  phone?: string | null;
  category?: string | null;
  subject: string;
  message: string;
  status: "New" | "Pending" | "Reviewed" | "Responded";
  createdAt: string;
  updatedAt: string;
}

const SUBJECT_FILTERS = [
  "All",
  "Admissions Inquiry",
  "School Fees Question",
  "Academic Programs & Support",
  "Schedule Visit",
  "Other Inquiries",
];

export default function AdministratorContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [viewModalMessage, setViewModalMessage] = useState<ContactMessage | null>(null);
  const [replyModalMessage, setReplyModalMessage] = useState<ContactMessage | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("All");
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // UI Action Loading States
  const [isReplying, setIsReplying] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<ContactMessage[]>("/admin/contact-messages");
      setMessages(res.data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load messages."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const markReviewed = async (id: string) => {
    setReviewingId(id);
    const reviewTask = async () => {
      await api.patch(`/admin/contact-messages/${id}/status`, {
        status: "Reviewed",
      });
    };

    try {
      await toast.promise(reviewTask(), {
        loading: "Marking message as reviewed...",
        success: "Message status updated to Reviewed!",
        error: (err) => getApiErrorMessage(err, "Failed to update status."),
      });
      loadMessages();
    } catch (err) {
      console.error("Mark reviewed error:", err);
    } finally {
      setReviewingId(null);
    }
  };

  const openReply = (msg: ContactMessage) => {
    setViewModalMessage(null);
    setReplyModalMessage(msg);
    setReplyText(`Dear ${msg.sender},\n\nThank you for reaching out to College Fondation Sina Gerard regarding "${msg.subject}".\n\n`);
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Pre-flight Validation
    if (!replyText.trim()) {
      toast.error("Please enter a email response body before sending.");
      return;
    }
    if (!replyModalMessage) return;

    // 2. Lock UI Guards
    setIsReplying(true);

    // 3. Define Send Task
    const replyTask = async () => {
      const res = await api.post(`/admin/contact-messages/${replyModalMessage.id}/reply`, {
        replyMessage: replyText.trim(),
      });
      return res.data;
    };

    // 4. Promise Toaster Pattern
    try {
      await toast.promise(replyTask(), {
        loading: `Sending email response to ${replyModalMessage.email}...`,
        success: `Email reply sent successfully to ${replyModalMessage.email}!`,
        error: (err) => getApiErrorMessage(err, "Failed to send response email."),
      });

      setReplyModalMessage(null);
      setReplyText("");
      loadMessages();
    } catch (err) {
      console.error("Send reply error:", err);
    } finally {
      setIsReplying(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message permanently from inbox?")) return;

    setDeletingId(id);
    const deleteTask = async () => {
      await api.delete(`/admin/contact-messages/${id}`);
    };

    try {
      await toast.promise(deleteTask(), {
        loading: "Deleting message from inbox...",
        success: "Message deleted successfully!",
        error: (err) => getApiErrorMessage(err, "Failed to delete message."),
      });
      if (viewModalMessage?.id === id) setViewModalMessage(null);
      loadMessages();
    } catch (err) {
      console.error("Delete message error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesSubject =
      selectedSubjectFilter === "All" ||
      msg.subject.toLowerCase().includes(selectedSubjectFilter.toLowerCase());
    const matchesSearch =
      msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const newCount = messages.filter((m) => m.status === "New").length;
  const pendingCount = messages.filter((m) => m.status === "Pending").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-3xl border border-amber-900/10 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-100 p-3.5 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Administration Inbox
              </span>
              <h1 className="font-serif text-2xl font-bold text-zinc-900 dark:text-white">
                Contact Messages &amp; Inquiries
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
              {isLoading ? "..." : `${newCount} Unread`}
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              {isLoading ? "..." : `${pendingCount} Pending`}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Subject Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-900/10 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {SUBJECT_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedSubjectFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedSubjectFilter === cat
                  ? "bg-emerald-700 text-white"
                  : "bg-amber-900/5 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-amber-900/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search sender, topic, text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-900/15 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Message List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
          <span className="text-xs font-bold">Loading contact messages...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => {
            const isDeletingThis = deletingId === message.id;
            const isReviewingThis = reviewingId === message.id;

            return (
              <div
                key={message.id}
                className={`rounded-2xl border border-amber-900/10 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 hover:border-emerald-500/50 transition-all ${
                  isDeletingThis ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-3.5">
                    <div className="rounded-xl bg-emerald-100/60 p-3 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
                      <MessageSquareText className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                          {message.sender}
                        </h2>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            message.status === "New"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                              : message.status === "Responded"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : message.status === "Reviewed"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                          }`}
                        >
                          {message.status}
                        </span>
                      </div>

                      <p className="mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {message.subject}
                      </p>

                      <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                        {message.message}
                      </p>

                      <div className="mt-2.5 flex items-center gap-3 text-[11px] text-zinc-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-emerald-700" /> {message.email}
                        </span>
                        {message.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-700" /> {message.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-2.5 md:items-end shrink-0">
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {formatDate(message.createdAt)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewModalMessage(message)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                        title="Read Full Message"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Read
                      </button>

                      {message.status === "New" && (
                        <button
                          disabled={isReviewingThis}
                          onClick={() => markReviewed(message.id)}
                          className="inline-flex items-center gap-1 rounded-xl bg-zinc-100 px-2.5 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 cursor-pointer disabled:opacity-50"
                        >
                          {isReviewingThis ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          )}
                          Review
                        </button>
                      )}

                      <button
                        onClick={() => openReply(message)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 cursor-pointer"
                      >
                        <Reply className="h-3.5 w-3.5" />
                        Respond
                      </button>

                      <button
                        disabled={isDeletingThis}
                        onClick={() => handleDelete(message.id)}
                        className="rounded-xl border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/30 cursor-pointer disabled:opacity-50"
                        title="Delete Message"
                      >
                        {isDeletingThis ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredMessages.length === 0 && (
            <div className="text-center py-12 rounded-2xl border border-dashed border-amber-900/10 dark:border-zinc-800">
              <p className="text-xs text-zinc-500">No contact messages match your search criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Back link */}
      <div className="flex justify-end pt-4">
        <Link
          href="/dashboard/administrator"
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 transition-all hover:text-emerald-800 dark:text-emerald-400"
        >
          Back to Admin Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* VIEW FULL MESSAGE MODAL */}
      {viewModalMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setViewModalMessage(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-amber-900/10 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-amber-900/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  {viewModalMessage.subject}
                </span>
                <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
                  Message from {viewModalMessage.sender}
                </h2>
              </div>
              <button
                onClick={() => setViewModalMessage(null)}
                className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300 bg-amber-900/5 dark:bg-zinc-800/50 p-4 rounded-2xl">
              <div className="flex items-center gap-2 font-medium">
                <User className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-zinc-900 dark:text-white">{viewModalMessage.sender}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Mail className="w-4 h-4 text-emerald-700" />
                <a href={`mailto:${viewModalMessage.email}`} className="underline text-emerald-700 dark:text-emerald-400">
                  {viewModalMessage.email}
                </a>
              </div>
              {viewModalMessage.phone && (
                <div className="flex items-center gap-2 font-medium">
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span>{viewModalMessage.phone}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl border border-amber-900/10 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium whitespace-pre-wrap">
                &quot;{viewModalMessage.message}&quot;
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => openReply(viewModalMessage)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 cursor-pointer"
              >
                <Reply className="h-4 w-4" />
                Write Response
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPLY MODAL */}
      {replyModalMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => !isReplying && setReplyModalMessage(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-amber-900/10 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-amber-900/10 pb-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
                  Respond to {replyModalMessage.sender}
                </h2>
                <p className="text-xs text-zinc-500">
                  Recipient Email: <span className="font-bold text-emerald-700">{replyModalMessage.email}</span>
                </p>
              </div>
              <button
                disabled={isReplying}
                onClick={() => setReplyModalMessage(null)}
                className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={sendReply} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300">
                  Email Response Message *
                </label>
                <textarea
                  required
                  disabled={isReplying}
                  rows={6}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full rounded-2xl border border-zinc-200 p-3.5 text-xs font-medium focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-white disabled:opacity-50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isReplying}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isReplying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Email Response</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={isReplying}
                  onClick={() => setReplyModalMessage(null)}
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