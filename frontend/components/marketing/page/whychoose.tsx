import React from "react";
import Image from "next/image";
import { Award, Wrench, ShieldCheck, HeartHandshake } from "lucide-react";

const FEATURES = [
  {
    icon: Award,
    title: "Quality Education",
    description: "Competency-Based Curriculum with qualified teaching staff",
  },
  {
    icon: Wrench,
    title: "Practical TVET Training",
    description: "Hands-on skills development for immediate employment",
  },
  {
    icon: ShieldCheck,
    title: "Safe Environment",
    description: "Supportive and student-centered learning atmosphere",
  },
  {
    icon: HeartHandshake,
    title: "Moral Education",
    description: "Strong ethical values and character development",
  },
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className="bg-[#fcf8f2] dark:bg-zinc-950 py-16 md:py-24 px-6 lg:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
      
        <div className="lg:col-span-7 flex flex-col items-start">
          
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-amber-200/50 dark:bg-emerald-950/40 text-amber-900 dark:text-emerald-400 text-xs font-semibold tracking-wide mb-4">
            Why CFSG?
          </span>

          <h2 className="font-sans text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.15] mb-6">
            Why Choose College fondation Sina Gerard?
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl">
            Students and parents choose CFSG because of our commitment to
            excellence, practical training, and holistic student development. We
            prepare learners not just for exams, but for life.
          </p>

          {/* 2 by 2 card grid logic on left slide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex flex-col">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white leading-snug">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column*/}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[520px] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="/why.png" 
              alt="CFSG Students Smiling"
              fill
              priority
              className="object-cover object-center hover:scale-105 transition-transform duration-700"
            />
          </div>
          
          <div className="absolute -bottom-6 -left-2 sm:left-4 bg-emerald-600 text-white p-6 rounded-2xl shadow-xl shadow-emerald-600/30 max-w-[200px] border border-emerald-500">
            <p className="font-sans font-bold text-3xl sm:text-4xl tracking-tight leading-none mb-1">
              15+
            </p>
            <p className="text-xs font-medium text-emerald-100 leading-tight">
              Years of Excellence
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;