import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-start overflow-hidden">
      
      <div className="absolute inset-0 -z-10">
        <Image
          src="/aboutHero.jpg"
          alt="College fondation Campus"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
      </div>

    
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-center w-full pt-32 pb-20 z-10 text-white">
        <div className="flex flex-col items-center gap-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold font-sans tracking-wider uppercase backdrop-blur-md">
            <span>About Our School</span>
          </div>

          {/* Heading*/}
          <div className="font-sans text-center text-2xl sm:text-4xl lg:text-6xl font-normal tracking-tight">
            <h1 className="mb-4">
              About College fondation Sina
            </h1>
            <h1>Gerard</h1>
          </div>

          <div className="text-zinc-300 text-base font-sans sm:text-lg leading-relaxed"> 
            <p className="text-center">A private educational institution in Rwanda dedicated to quality education and</p> 
            <p className="text-center">practical skills development since 2008.</p>

          </div>
          
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
    </section>
  );
}