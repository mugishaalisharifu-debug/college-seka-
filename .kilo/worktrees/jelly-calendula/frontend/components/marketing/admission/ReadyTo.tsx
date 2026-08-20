import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const ReadyToJoinSectionAdmission: React.FC = () => {
  return (
    <section className="bg-emerald-600 py-8 md:py-24 px-6 lg:px-12 text-white">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        

        <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-6 text-white leading-tight">
          Ready to Join Apply?
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
  
          <Link
            href="/apply"
            className=" sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white text-emerald-800 text-xs sm:text-base font-semibold hover:bg-emerald-50 transition-all shadow-lg shadow-black/10 hover:-translate-y-0.5"
          >
            <span>Start Application</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/admission"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 rounded-xl border border-white/40 text-white text-sm sm:text-base font-medium hover:bg-white/10 transition-all hover:-translate-y-0.5"
          >
            Check Application Status
          </Link>
        </div>

      </div>
    </section>
  )
}

export default ReadyToJoinSectionAdmission