import Image from "next/image";

export default function ProgramsHeroSection() {
  return (
    <section className="relative min-h-[70vh] w-full flex items-center justify-start overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/programsHero.jpg"
          alt="College Fondation Sina Gérard campus"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#002d18]/90 via-[#003b27]/80 to-[#006633]/35" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 pb-20 pt-32 text-white z-10">
        <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ffcc00]/40 bg-[#ffcc00]/15 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffe799] backdrop-blur-sm">
            <span>Academic Offerings</span>
          </div>

          <h1 className="font-sans text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
            Academic Programs
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-zinc-200 sm:text-lg">
            Comprehensive education from early childhood through technical and vocational training that prepares learners for a brighter future.
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#f6f7f3] to-transparent" />
    </section>
  );
}