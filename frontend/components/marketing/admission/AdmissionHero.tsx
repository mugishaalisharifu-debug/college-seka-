import Image from "next/image";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AdmissionHeroSection() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-start overflow-hidden">
      
      <div className="absolute inset-0 -z-10">
        <Image
          src="/admissionHero.jpg"
          alt="College fondation Campus"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
      </div>

    
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-center w-full pt-32 pb-20 z-10 text-white">
        <div className="flex flex-col items-center gap-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold font-sans tracking-wider uppercase backdrop-blur-md">
            <GraduationCap className="w-4 h-4" />
            <span>Join CFSG</span>
          </div>

          {/* Headline*/}
          <div className="font-sans text-center text-2xl sm:text-5xl lg:text-7xl font-normal tracking-tight">
            <h1 className="mb-4">
              Admission Information
            </h1>
          </div>

          <div className="text-zinc-300 text-base font-sans sm:text-lg leading-relaxed"> 
            <p className="text-center">A transparent and organized admission process for all education levels. Apply</p> 
            <p className="text-center">online and track your application in real time.</p>

          </div>

          {/*Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
            <Link
              href="/apply"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-emerald-600 bg-white font-medium hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/25"
            >
              <span className="text-sm">Start Your Application</span>
            </Link>
          </div>

        </div>
      </div>

      {/*Display overlay for better overlay UX */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
    </section>
  );
}