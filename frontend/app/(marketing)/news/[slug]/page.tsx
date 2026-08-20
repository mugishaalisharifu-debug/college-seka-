import Link from "next/link";

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
  let recentArticles: NewsArticle[] = [];

  try {
    const res = await fetch(`${API_URL}/api/admin/public/news/${slug}`, {
      cache: "no-store",
    });
    if (res.ok) {
      article = await res.json();
    } else {
      // Fallback: try fetching by raw slug endpoint
      const res2 = await fetch(`${API_URL}/admin/public/news/${slug}`, { cache: "no-store" });
      if (res2.ok) {
        article = await res2.json();
      }
    }
  } catch {
    article = null;
  }

  // Fetch recent news for fallback or related section
  try {
    const resList = await fetch(`${API_URL}/api/admin/public/news`, { cache: "no-store" });
    if (resList.ok) {
      recentArticles = await resList.json();
    }
  } catch {
    // Ignore list fetch failure
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-[#f8f6eb] px-6 py-16 text-zinc-900 md:px-10 lg:px-16 flex items-center justify-center">
        <div className="mx-auto max-w-xl text-center rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm space-y-4">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
            Article Not Found
          </span>
          <h1 className="text-2xl font-bold text-zinc-900">
            Requested News Article Unavailable
          </h1>
          <p className="text-sm text-zinc-600">
            The article you are looking for may have been updated, renamed, or is no longer published.
          </p>
          {recentArticles.length > 0 && (
            <div className="pt-4 border-t border-zinc-100 space-y-2 text-left">
              <p className="text-xs font-bold text-zinc-500 uppercase">Recent Published News:</p>
              {recentArticles.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug || item.id}`}
                  className="block p-3 rounded-xl bg-zinc-50 hover:bg-emerald-50 text-xs font-semibold text-zinc-900 hover:text-emerald-800 transition-colors"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          )}
          <div className="pt-2">
            <Link
              href="/news"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
            >
              ← Browse All News &amp; Announcements
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f6eb] px-6 py-16 text-zinc-900 md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
            {article.category}
          </span>
          <span className="text-sm text-zinc-500 font-mono">
            {new Date(article.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900">{article.title}</h1>
        <p className="text-base leading-8 text-zinc-700 font-medium">{article.summary}</p>

        {article.content ? (
          <div className="space-y-4 text-sm leading-7 text-zinc-700 pt-4 border-t border-zinc-100">
            {article.content.split(/\n\n+/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-600">
            This announcement is now live on the College Foundation portal.
          </div>
        )}

        <div className="pt-4 border-t border-zinc-100">
          <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
            ← Back to all news
          </Link>
        </div>
      </div>
    </main>
  );
}
