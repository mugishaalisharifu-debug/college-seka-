import React from 'react'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { SUPPORT_SERVICES } from '@/exports'

const StudentSupportServices: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left side*/}
        <div className="lg:col-span-5 relative">
          <div className="relative w-full h-[350px] sm:h-[450px] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/w.jpg"
              alt="Student receiving academic guidance"
              fill
              className="object-cover object-center hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/*Right column */}
        <div className="lg:col-span-7 flex flex-col items-start">
          
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-xs font-semibold tracking-wide mb-4">
            Student Welfare
          </span>

          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
            Student Support Services
          </h2>

          <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl">
            The institution supports learners through various services designed to ensure academic success and personal growth.
          </p>

          <div className="flex flex-col gap-3.5 w-full">
            {SUPPORT_SERVICES.map((service, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>

                <span className="text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-200">
                  {service}
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  )
}

export default StudentSupportServices