"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "#programs", label: "Programs" },
  { href: "#about", label: "About" },
  { href: "#method", label: "Method" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 flex flex-col md:flex-row justify-between items-center p-6 md:px-[5%] z-50 bg-[#1A1A1A]/95 backdrop-blur border-b border-[#333333]">
      <div className="flex justify-between items-center w-full md:w-auto">
        <Link href="/" className="text-xl md:text-2xl font-bold tracking-[2px]">
          WISDOM <span className="text-[#E52B2B]">ECHO</span>
        </Link>

        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <div className={`
        ${isOpen ? "flex" : "hidden"}
        md:flex flex-col md:flex-row items-center gap-6 md:gap-8
        text-sm font-semibold uppercase tracking-wider
        mt-6 md:mt-0 w-full md:w-auto text-center pb-6 md:pb-0
      `}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-[#E52B2B] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className={`${isOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row items-center gap-3 w-full md:w-auto text-center pb-6 md:pb-0`}>
        <Link
          href="/login"
          className="text-sm font-semibold uppercase tracking-wider text-[#888888] hover:text-white transition-colors px-4 py-3"
        >
          Log In
        </Link>
        <Link
          href="#contact"
          className="inline-block bg-[#E52B2B] hover:bg-[#c41e1e] text-white px-8 py-3 font-bold uppercase tracking-wider text-sm transition-colors w-full md:w-auto"
        >
          Apply Now
        </Link>
      </div>
    </nav>
  );
}