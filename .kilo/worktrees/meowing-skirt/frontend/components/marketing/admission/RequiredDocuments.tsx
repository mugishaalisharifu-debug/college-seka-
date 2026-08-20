import React from 'react'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { REQUIRED_DOCUMENTS } from '@/exports'

const RequiredDocuments: React.FC = () => {
  return (
    <section className="bg-[#fcf8f2] dark:bg-zinc-950 py-16 md:py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/*Left slide */}
        <div className="lg:col-span-7 flex flex-col items-start">
          
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-amber-100/80 dark:bg-emerald-950/60 text-amber-900 dark:text-emerald-400 text-xs font-semibold tracking-wide mb-4">
            Prepare Your Documents
          </span>

          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
            Required Admission Documents
          </h2>

          <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl">
            Depending on the education level, applicants may need to provide the following documents. Ensure all documents are clear and legible before uploading.
          </p>

          <div className="flex flex-col gap-3.5 w-full mb-6">
            {REQUIRED_DOCUMENTS.map((doc, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>

                <span className="text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-200">
                  {doc}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed italic">
            For some secondary or TVET applicants, additional academic results may also be required.
          </p>

        </div>

        {/*Right Column */}
        <div className="lg:col-span-5 relative">
          <div className="relative w-full h-[320px] sm:h-[400px] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/ready.jpg"
              alt="Application forms and passport photograph documents"
              fill
              className="object-cover object-center hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

      </div>
    </section>
  )
}

export default RequiredDocuments