import React, { type ElementType } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Blocks, School, GraduationCap, Wrench } from 'lucide-react'

// DYNAMIC PROGRAMS DATA
export interface ProgramItem {
  id: string
  link: string
  cardImage: string
  icon: ElementType
  header: string
  subheader: string
  description: string
}

export const PROGRAMS_DATA: ProgramItem[] = [
  {
    id: '1',
    link: '/nursery',
    cardImage: '/nursery.jpg',
    icon: Blocks,
    header: 'Nursery Education',
    subheader: 'Early Childhood fondation',
    description:
      'The nursery section provides a strong educational fondation for young learners through play-based and competency-base...',
  },
  {
    id: '2',
    link: '/primary',
    cardImage: '/primary.jpg',
    icon: School,
    header: 'Primary Education',
    subheader: 'Building Strong fondations',
    description:
      'Primary education develops literacy, numeracy, communication, creativity, leadership, and problem-solving skills. Our...',
  },
  {
    id: '3',
    link: '/secondary',
    cardImage: '/secondary.jpg',
    icon: GraduationCap,
    header: 'Lower Secondary Education',
    subheader: 'Preparing for the Future',
    description:
      'The lower secondary section prepares learners for technical education and future career pathways. Students develop critical...',
  },
  {
    id: '4',
    link: '/tvet',
    cardImage: '/tvet.jpg',
    icon: Wrench,
    header: 'TVET Programs',
    subheader: 'Technical & Vocational Training',
    description:
      'The TVET department equips students with practical and employable skills through competency-based training. Our hands-on...',
  },
]

const ProgramsSection: React.FC = () => {
  return (
    <section className="px-6 py-16 md:py-24 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <span className="mb-3 inline-block rounded-full bg-[#006633]/10 px-3.5 py-1.5 text-xs font-semibold tracking-[0.18em] text-[#006633] uppercase">
            Academic Programs
          </span>

          <h2 className="mb-4 font-sans text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
            Education For Every Stage
          </h2>

          <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
            From early education to technical and vocational training, we offer comprehensive programs that build a strong foundation for lifelong success.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
          {PROGRAMS_DATA.map((program) => {
            const Icon = program.icon

            return (
              <Link
                key={program.id}
                href={program.link}
                className="group flex flex-col gap-5 overflow-hidden rounded-2xl border border-[#dfe4dd] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#006633]/40 hover:shadow-lg sm:flex-row sm:p-5"
              >
                <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl sm:h-auto sm:w-44">
                  <Image
                    src={program.cardImage}
                    alt={program.header}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex grow flex-col justify-between py-1">
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#006633]">
                        {program.subheader}
                      </span>

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#006633]/10 text-[#006633]">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>

                    <h3 className="mb-2 font-sans text-xl font-bold text-zinc-900 transition-colors group-hover:text-[#006633]">
                      {program.header}
                    </h3>

                    <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-zinc-600 sm:text-sm">
                      {program.description}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006633] transition-transform group-hover:translate-x-1">
                    <span>Learn More</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ProgramsSection