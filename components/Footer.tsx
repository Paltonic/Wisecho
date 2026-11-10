import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-8 border-t border-[#333333] text-[#888888] text-sm">
      <div className="max-w-6xl mx-auto px-8 md:px-[5%] flex flex-col md:flex-row justify-between items-center gap-4">
        <p>&copy; 2026 Frederick Liko. All rights reserved. v1.1.0</p>
        <div className="flex gap-6 uppercase tracking-wider text-xs">
          <Link href="#programs" className="hover:text-[#E52B2B] transition-colors">Programs</Link>
          <Link href="#faq" className="hover:text-[#E52B2B] transition-colors">FAQ</Link>
          <Link href="/login" className="hover:text-[#E52B2B] transition-colors">Log In</Link>
          <Link href="#contact" className="hover:text-[#E52B2B] transition-colors">Apply</Link>
        </div>
      </div>
    </footer>
  );
}