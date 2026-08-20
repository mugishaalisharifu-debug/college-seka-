import Link from "next/link";
import { ArrowLeft, BookOpen, Download, FileText, GraduationCap, Wallet } from "lucide-react";

const parentDocuments = [
  {
    title: "School fee structure for next year",
    description: "A document showing the school fees, payment expectations, and financial guidance for the upcoming academic year.",
    href: "/documents/school-fee-structure-2026.pdf",
    icon: Wallet,
  },
  {
    title: "Uniform and school requirements",
    description: "A document that lists the required uniforms, school materials, and other items parents should prepare for the new year.",
    href: "/documents/uniform-requirements-guide.pdf",
    icon: BookOpen,
  },
  {
    title: "School rules and regulations",
    description: "A document outlining school expectations, discipline, and parent responsibilities for the coming year.",
    href: "/documents/school-rules-and-regulations.pdf",
    icon: FileText,
  },
  {
    title: "Academic calendar",
    description: "A document with the school calendar, term dates, and important events for the next year.",
    href: "/documents/2026-academic-calendar.pdf",
    icon: GraduationCap,
  },
];

export default function BabyeyiPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_35%)] px-4 pb-20 pt-28 text-zinc-900 transition-colors dark:text-white sm:px-6 lg:px-8 md:pt-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <Link
          href="/programs"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-zinc-700 transition-colors hover:text-emerald-700 dark:text-zinc-300 dark:hover:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Programs</span>
        </Link>

        <section className="overflow-hidden rounded-[2rem] border border-amber-900/10 bg-white/90 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="grid gap-8 p-8 md:grid-cols-[1.2fr_0.8fr] md:p-10">
            <div className="space-y-5">
              <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                Parent documents
              </div>
              <div className="space-y-3">
                <h1 className="font-sans text-3xl font-bold text-zinc-900 dark:text-white md:text-4xl">
                  Babyeyi documents for the next school year
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                  These uploaded documents help parents review the school requirements, expected materials, fees, and academic calendar for the coming year.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/apply"
                  className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-800"
                >
                  Apply to the School
                </Link>
                <Link
                  href="/contact"
                  className="rounded-xl border border-amber-900/20 px-5 py-3 text-sm font-semibold text-zinc-800 transition-all hover:bg-[#f3edd1] dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Contact the School
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-900/10 bg-[#fcf8f2] p-6 dark:border-zinc-800 dark:bg-zinc-800/60">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Uploaded parent documents</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                <li>• School fees and payment expectations for the new year.</li>
                <li>• Uniforms and required school materials.</li>
                <li>• School rules and academic calendar details.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {parentDocuments.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-2xl border border-amber-900/10 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{item.description}</p>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800 dark:text-emerald-400"
                >
                  <Download className="h-4 w-4" />
                  Open document
                </a>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
