"use client"; // This tells Next.js to render this specific component on the client

export default function Footer() {
  return (
    <footer className="text-center py-8 border-t border-[#333333] text-[#888888] text-sm">
      <p>&copy; {new Date().getFullYear()} Wisdom Echo. All rights reserved.</p>
    </footer>
  );
}