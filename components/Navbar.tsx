import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-8 md:px-[5%]">
      <div className="text-xl md:text-2xl font-bold tracking-[2px]">
        WISDOM <span className="text-[#E52B2B]">ECHO</span>
      </div>
      
      <div className="hidden md:flex gap-8 text-sm uppercase tracking-wider">
        <Link href="#" className="hover:text-[#E52B2B] transition-colors">Home</Link>
        <Link href="#" className="hover:text-[#E52B2B] transition-colors">Features</Link>
        <Link href="#" className="hover:text-[#E52B2B] transition-colors">Process</Link>
        <Link href="#" className="hover:text-[#E52B2B] transition-colors">Contact</Link>
      </div>
      
      <button className="bg-[#E52B2B] hover:bg-[#c41e1e] text-white px-6 py-3 font-bold uppercase tracking-wider text-sm transition-colors">
        Get Started
      </button>
    </nav>
  );
}