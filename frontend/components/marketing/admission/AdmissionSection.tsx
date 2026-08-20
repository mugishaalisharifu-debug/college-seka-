import React from 'react'
import { Calendar } from 'lucide-react'
import Link from 'next/link'
import { ADMISSION_STEPS } from '@/exports'


const AdmissionProcess: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-xs font-semibold tracking-wide mb-3">
            How to Apply
          </span>

          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
            Admission Process
          </h2>

          <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
            Follow these simple steps to apply for admission at CFSG.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {ADMISSION_STEPS.map((step) => {
            {/*Deadline Card */}
            if (step.isDeadlineCard) {
              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center justify-center p-8 rounded-2xl bg-emerald-700 text-white text-center shadow-md  transition-all duration-300 min-h-[220px]"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white mb-4">
                    <Calendar className="w-6 h-6" />
                  </div>

                  <h3 className="font-sans font-bold text-xl mb-2 text-white">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                   <Link
                      href="/apply"
                      className="mt-4 sm:w-auto inline-flex items-center justify-center px-4 py-3 rounded-lg text-emerald-600 bg-white font-medium hover:opacity-45 transition-all shadow-lg shadow-emerald-600/25"
                    >
                      <span className="text-sm">Start Your Application</span>
                    </Link>
                </div>
              )
            }

            //Those normal cards
            return (
              <div
                key={step.id}
                className="flex flex-col items-start p-6 sm:p-8 rounded-2xl  dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-emerald-500/40 transition-all duration-300 min-h-[220px]"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-bold mb-5 shadow-xs">
                  {step.stepNumber}
                </div>

              
                <h3 className="font-sans font-bold text-lg sm:text-xl text-zinc-900 dark:text-white mb-2 leading-snug">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

export default AdmissionProcess