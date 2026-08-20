import React from 'react'
import Link from 'next/link'
import Image from 'next/image' 
import { FOOTER_LINKS, FOOTER_SUBLINKS } from '@/exports'
import { Phone, Mail, MapPin } from 'lucide-react'
import Logo from '@/components/marketing/comp/logo.png'

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#0a3d27] bg-[#0d2f20] text-[#f3f7f1]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-2 lg:grid-cols-4 lg:py-16">
        
        {/* logo */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            {/* logo*/}
            <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-[#0f6b44]/10 bg-white/80 shadow-sm">
              <Image
                src={Logo}
                alt="College fondation Logo"
                fill
                className="object-contain p-1.5 group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-white">
                College fondation
              </p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-[#ffcc00]">
                Sina Gerard
              </p>
            </div>
          </Link>

          <p className="text-sm leading-relaxed text-[#dfeee4]">
            We Strive for Excellence in Education.
          </p>

          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#ffcc00]">
            📍 Rwanda
          </span>
        </div>

        {/* COLUMN 2: QUICK LINKS */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-white">
            Quick Links
          </p>
          <ul className="flex flex-col gap-2.5 text-sm">
            {FOOTER_LINKS.map((link) => (
              <li key={link.link}>
                <Link
                  href={link.link}
                  className="text-[#e6efe8] transition-colors hover:text-[#ffcc00] hover:underline"
                >
                  {link.linkName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* COLUMN 3: RESOURCES */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-white">
            Resources
          </p>
          <ul className="flex flex-col gap-2.5 text-sm">
            {FOOTER_SUBLINKS.map((link) => (
              <li key={link.link}>
                <Link
                  href={link.link}
                  className="text-[#e6efe8] transition-colors hover:text-[#ffcc00] hover:underline"
                >
                  {link.linkName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* COLUMN 4: CONTACT US */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-white">
            Contact Us
          </p>

          <div className="flex flex-col gap-3 text-sm text-[#edf7ef]">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#ffcc00]" />
              <span>Rulindo District, Northern Province, Rwanda</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0 text-[#ffcc00]" />
              <span>+250 788 000 000</span>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 shrink-0 text-[#ffcc00]" />
              <span>info@collegefondation.rw</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#0a3d27] bg-[#092d1d]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-4 text-xs text-[#dfeee4] sm:flex-row">
          <p>© 2026 College fondation Sina Gerard. All rights reserved.</p>

          <Link
            href="/staff-portal-v1"
            className="transition-colors hover:text-[#ffcc00] hover:underline"
          >
            Admin / Staff Portal
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer