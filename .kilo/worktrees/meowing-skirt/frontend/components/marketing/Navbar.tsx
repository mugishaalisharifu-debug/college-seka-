"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/exports";
import Image from "next/image";
import Logo from "@/components/marketing/comp/school-logo.png";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAlwaysSolid =
    pathname === "/apply" || 
    pathname === "/appResult" ||
    pathname === "/staff-portal-v1"
    || pathname.startsWith("/staff/");

  const showSolidStyle = isAlwaysSolid || isScrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${
          showSolidStyle
            ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-zinc-200/60 py-3.5"
            : "bg-transparent py-5 text-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-[#0f6b44]/10 bg-white/80 shadow-sm">
              <Image
                src={Logo}
                alt="College fondation Logo"
                fill
                className="object-contain p-1.5 transition-transform"
              />
            </div>
            <div className="leading-none">
              <p
                className={`font-semibold text-sm tracking-tight ${
                  showSolidStyle ? "text-zinc-900" : "text-white"
                }`}
              >
                College fondation
              </p>
              <p
                className={`text-[11px] font-medium ${
                  showSolidStyle ? "text-zinc-500" : "text-white"
                } mt-1 uppercase tracking-wider`}
              >
                Sina Gerard
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1.5 text-sm font-medium">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.link;

              return (
                <Link
                  key={link.link}
                  href={link.link}
                  className={`px-4 py-2 rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                      : showSolidStyle
                      ? "text-zinc-600 hover:text-emerald-600"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.linkName}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3 text-sm font-medium">
            <Link
              href="/staff-portal-v1"
              className={`py-2 px-4 rounded-lg border border-emerald-600/30 ${
                showSolidStyle
                  ? "text-emerald-700 hover:bg-emerald-50"
                  : "text-white border-white hover:text-emerald-300"
              } transition-all`}
            >
              Staff Portal
            </Link>
            <Link
              href="/apply"
              className="py-2 px-4 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20"
            >
              Apply Now
            </Link>
          </div>

          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              showSolidStyle
                ? "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                : "text-white hover:bg-white/10"
            }`}
            aria-label="Toggle navigation"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 right-0 bottom-0 w-80 bg-white dark:bg-zinc-900 z-50 p-6 flex flex-col justify-between shadow-2xl lg:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <div className="leading-tight">
              <span className="font-semibold text-sm tracking-tight">Navigation</span>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Main Menu</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1.5 mt-6">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.link;
              return (
                <Link
                  key={link.link}
                  href={link.link}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold"
                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  {link.linkName}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href="/staff-portal-v1"
            onClick={() => setIsOpen(false)}
            className="w-full text-center py-2.5 px-4 rounded-lg border border-emerald-600/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all"
          >
            Staff Portal
          </Link>
          <Link
            href="/apply"
            onClick={() => setIsOpen(false)}
            className="w-full text-center py-2.5 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm"
          >
            Apply Now
          </Link>
        </div>
      </aside>
    </>
  );
}