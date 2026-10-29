"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="flex flex-col md:flex-row justify-between items-center p-6 md:px-[5%] relative z-50 bg-[#1A1A1A] md:bg-transparent border-b border-[#333333] md:border-none">
      {/* Logo */}
      <div className="flex justify-between items-center w-full md:w-auto">
        <Link href="/" className="text-xl md:text-2xl font-bold tracking-[2px]">
          WISDOM <span className="text-[#E52B2B]">ECHO</span>
        </Link>
        
        {/* Mobile Menu Button (Hamburger) */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
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
      
      {/* Navigation Links */}
      <div className={`
        ${isOpen ? "flex" : "hidden"} 
        md:flex flex-col md:flex-row items-center gap-6 md:gap-8 
        text-sm font-semibold uppercase tracking-wider 
        mt-6 md:mt-0 w-full md:w-auto text-center pb-6 md:pb-0
      `}>
        <Link href="#" className="hover:text-[#E52B2B] transition-colors">Home</Link>
        <Link href="#features" className="hover:text-[#E52B2B] transition-colors">Our Pillars</Link>
        <Link href="#programs" className="hover:text-[#E52B2B] transition-colors">Programs</Link>
        <Link href="#admissions" className="hover:text-[#E52B2B] transition-colors">Admissions</Link>
        <Link href="#contact" className="hover:text-[#E52B2B] transition-colors">Contact</Link>
      </div>
      
      {/* CTA Button */}
      <div className={`${isOpen ? "block" : "hidden"} md:block w-full md:w-auto text-center pb-6 md:pb-0`}>
        <button className="bg-[#E52B2B] hover:bg-[#c41e1e] text-white px-8 py-3 font-bold uppercase tracking-wider text-sm transition-colors w-full md:w-auto">
          Apply Now
        </button>
      </div>
    </nav>
  );
}