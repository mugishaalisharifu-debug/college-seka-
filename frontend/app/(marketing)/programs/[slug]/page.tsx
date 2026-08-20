import Link from "next/link";
import { notFound } from "next/navigation";

const PROGRAM_DETAILS: Record<string, { title: string; description: string; highlights: string[] }> = {
  nursery: {
    title: "Nursery Education",
    description: "A warm, play-based learning environment where young children build early language, numeracy, social, and motor skills.",
    highlights: ["Early literacy and numeracy", "Creative play and discovery", "Social and emotional development"],
  },
  primary: {
    title: "Primary Education",
    description: "A strong academic foundation for children in literacy, numeracy, science, and citizenship.",
    highlights: ["Core subject mastery", "Critical thinking", "Leadership and teamwork"],
  },
  secondary: {
    title: "Lower Secondary Education",
    description: "A modern transition stage that prepares students for future studies and career pathways.",
    highlights: ["Academic growth", "Career guidance", "Practical learning experiences"],
  },
  tvet: {
    title: "TVET Programs",
    description: "Hands-on vocational and technical training that equips students with employable practical skills.",
    highlights: ["Agriculture", "Mechanics", "Accounting", "Food processing"],
  },
};

interface ProgramDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { slug } = await params;
  const program = PROGRAM_DETAILS[slug];

  if (!program) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f8f6eb] px-6 py-16 text-zinc-900 md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{program.title}</h1>
        <p className="mt-6 text-base leading-8 text-zinc-700">{program.description}</p>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <h2 className="text-lg font-semibold">Program highlights</h2>
          <ul className="mt-4 space-y-2 text-sm text-zinc-700">
            {program.highlights.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link href="/programs" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
          ← Back to programs
        </Link>
      </div>
    </main>
  );
}
