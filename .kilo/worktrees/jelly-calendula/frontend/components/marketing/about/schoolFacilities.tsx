import React from 'react'
import { FACILITIES_DATA } from '@/exports'

const SchoolFacilities: React.FC = () => {
  return (
    <section className="bg-[#fcf8f2] dark:bg-zinc-950 py-16 md:py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100/80 dark:bg-emerald-950/40 text-amber-900 dark:text-emerald-400 text-xs font-semibold tracking-wide mb-4">
            Our Campus
          </span>

          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
            School Facilities
          </h2>

          <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
            CFSG aims to provide learners with an environment that supports effective learning and practical education.
          </p>
        </div>

        {/*Facilities grid cards*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {FACILITIES_DATA.map((facility) => {
            const Icon = facility.icon

            return (
              <div
                key={facility.id}
                className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[#faf6f0] dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6" />
                </div>

                <span className="font-sans text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">
                  {facility.count}
                </span>

                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {facility.label}
                </span>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

export default SchoolFacilities