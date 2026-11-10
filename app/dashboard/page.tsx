import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white">
      <header className="p-6 md:px-[5%] border-b border-[#333333] flex justify-between items-center">
        <Link href="/" className="text-xl md:text-2xl font-bold tracking-[2px]">
          WISDOM <span className="text-[#E52B2B]">ECHO</span>
        </Link>
        <Link
          href="/login"
          className="text-sm uppercase tracking-wider text-[#888888] hover:text-white transition-colors"
        >
          Log Out
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-6 md:px-[5%] py-12">
        <div className="mb-10">
          <span className="text-[#E52B2B] text-sm tracking-widest uppercase font-semibold">
            Dashboard
          </span>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mt-2">
            Welcome <span className="text-[#E52B2B]">Back</span>
          </h1>
          <p className="text-[#888888] mt-3 leading-relaxed">
            This is where you manage your classes, materials, and progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#242424] p-6 border-t-4 border-[#E52B2B]">
            <p className="text-[#E52B2B] text-xs uppercase tracking-widest font-semibold">
              Next Session
            </p>
            <p className="text-2xl font-bold mt-2">Sat, 10:00 AM</p>
            <p className="text-[#888888] text-sm mt-1">JLPT Prep · Online</p>
          </div>

          <div className="bg-[#242424] p-6 border-t-4 border-[#E52B2B]">
            <p className="text-[#E52B2B] text-xs uppercase tracking-widest font-semibold">
              Progress
            </p>
            <p className="text-2xl font-bold mt-2">Chapter 4 / 10</p>
            <p className="text-[#888888] text-sm mt-1">Kanji & Grammar</p>
          </div>

          <div className="bg-[#242424] p-6 border-t-4 border-[#E52B2B]">
            <p className="text-[#E52B2B] text-xs uppercase tracking-widest font-semibold">
              Materials
            </p>
            <p className="text-2xl font-bold mt-2">12 Files</p>
            <p className="text-[#888888] text-sm mt-1">Available to download</p>
          </div>
        </div>

        <div className="mt-10 bg-[#242424] border border-[#333333] p-8">
          <h2 className="text-xl font-bold uppercase tracking-wider">
            Recent <span className="text-[#E52B2B]">Activity</span>
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-[#888888]">
            <li>▹ Completed practice set — N4 Reading</li>
            <li>▹ Uploaded homework — Kanji Week 3</li>
            <li>▹ Paid invoice #INV-2026-001</li>
          </ul>
        </div>
      </div>
    </main>
  );
}