import React from 'react'
import { MapPin, Phone, Mail } from 'lucide-react'
import { ContactCardItem } from '@/exports'


const CONTACT_DATA: ContactCardItem[] = [
  {
    id: 'visit-us',
    title: 'Visit Us',
    icon: MapPin,
    iconBgColor: 'bg-emerald-100 dark:bg-emerald-950/60',
    iconTextColor: 'text-emerald-700 dark:text-emerald-400',
    content: (
      <div className="flex flex-col items-center gap-1">
        <p className="font-medium text-zinc-800 dark:text-zinc-200">
          College fondation Sina Gerard
        </p>
        <div className="w-16 h-[1px] bg-amber-900/20 dark:bg-zinc-700 my-1" />
        <p className="text-zinc-600 dark:text-zinc-400">
          Nyirangarama, Rulindo District, Northern Province, Rwanda
        </p>
      </div>
    ),
  },
  {
    id: 'call-us',
    title: 'Call Us',
    icon: Phone,
    iconBgColor: 'bg-amber-100/80 dark:bg-amber-950/60',
    iconTextColor: 'text-amber-800 dark:text-amber-400',
    content: (
      <div className="flex flex-col items-center gap-1">
        <a
          href="tel:+250788000000"
          className="font-medium text-zinc-800 dark:text-zinc-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
        >
          +250 788 000 000
        </a>
        <div className="w-16 h-[1px] bg-amber-900/20 dark:bg-zinc-700 my-1" />
        <p className="text-zinc-500 dark:text-zinc-400 text-xs">
          Mon - Fri: 8:00 AM - 5:00 PM
        </p>
      </div>
    ),
  },
  {
    id: 'email-us',
    title: 'Email Us',
    icon: Mail,
    iconBgColor: 'bg-orange-100/80 dark:bg-orange-950/60',
    iconTextColor: 'text-orange-800 dark:text-orange-400',
    content: (
      <div className="flex flex-col items-center gap-1">
        <a
          href="mailto:info@cfsg.ac.rw"
          className="font-medium text-zinc-800 dark:text-zinc-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
        >
          info@cfsg.ac.rw
        </a>
        <div className="w-16 h-[1px] bg-amber-900/20 dark:bg-zinc-700 my-1" />
        <p className="text-zinc-500 dark:text-zinc-400 text-xs">
          We reply within 24 hours
        </p>
      </div>
    ),
  },
]

const ContactCards: React.FC = () => {
  return (
    <section className="relative z-20 pb-15 md:pb-22 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* OVERLAPPING 3-COLUMN GRID (-mt-20 overlaps into the green section above) */}
        <div className="-mt-16 sm:-mt-24 md:-mt-28 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {CONTACT_DATA.map((card) => {
            const Icon = card.icon

            return (
              <div
                key={card.id}
                className="flex flex-col items-center text-center p-8 rounded-2xl bg-[#faf6f0] dark:bg-zinc-900/95 border border-zinc-200/80 dark:border-zinc-800 shadow-lg shadow-black/5 hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-full ${card.iconBgColor} ${card.iconTextColor} flex items-center justify-center mb-4 shrink-0 shadow-xs`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>

                {/* CARD TITLE */}
                <h3 className="font-sans font-bold text-xl sm:text-2xl text-zinc-900 dark:text-white mb-4">
                  {card.title}
                </h3>

                {/* DIVIDER & CONTENT */}
                <div className="w-full text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                  {card.content}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

export default ContactCards