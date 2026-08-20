import Link from "next/link";
import { notFound } from "next/navigation";

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content?: string | null;
  category: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;

  let article: NewsArticle | null = null;
  try {
    const res = await fetch(`${API_URL}/admin/public/news/${slug}`, {
      cache: "no-store",
    });
    if (res.ok) {
      article = await res.json();
    }
  } catch {
    article = null;
  }

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f8f6eb] px-6 py-16 text-zinc-900 md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-3">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
            {article.category}
          </span>
          <span className="text-sm text-zinc-500">
            {new Date(article.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{article.title}</h1>
        <p className="mt-6 text-base leading-8 text-zinc-700">{article.summary}</p>

        {article.content ? (
          <div className="mt-8 space-y-4 text-sm leading-7 text-zinc-700">
            {article.content.split(/\n\n+/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-600">
            This announcement is now available to visitors and parents through the public news section. It can be expanded with a full article body, images, and related links as the school content grows.
          </div>
        )}

        <Link href="/news" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
          ← Back to all news
        </Link>
      </div>
    </main>
  );
}
