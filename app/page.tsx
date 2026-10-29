import Navbar from "@/components/Navbar";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white selection:bg-[#E52B2B]">
      
      <Navbar />

      {/* Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-8 md:px-[10%] py-20 md:py-32">
        
        {/* Sisi Kiri: Teks */}
        <div className="flex flex-col gap-6 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-wider leading-tight">
            Wisdom in Character, <br />
            <span className="text-[#E52B2B]">Echo in the Future.</span>
          </h1>
          
          {/* Teks Deskripsi (English) */}
          <p className="text-lg text-[#888888] max-w-lg mx-auto md:mx-0 leading-relaxed">
            Shaping a generation of noble character, ethical critical thinking, and proficiency in technology and languages especially Japanese.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mx-auto md:mx-0">
            <button className="bg-[#E52B2B] hover:bg-[#c41e1e] text-white px-8 py-4 font-bold uppercase tracking-wider transition-colors w-fit">
              Discover Our Programs
            </button>
            {/* Tombol Kedua (English) */}
            <button className="border-2 border-[#888888] hover:border-white hover:text-white text-[#888888] px-8 py-4 font-bold uppercase tracking-wider transition-colors w-fit">
              Apply Now
            </button>
          </div>
        </div>

        {/* Sisi Kanan: Gambar di dalam Kotak */}
        <div className="flex justify-center items-center w-full">
          <div className="bg-[#242424] p-8 md:p-12 rounded-3xl border border-[#333333] w-full max-w-[450px] aspect-square flex justify-center items-center relative overflow-hidden group">
            {/* Efek Glow di belakang logo */}
            <div className="absolute inset-0 bg-[#E52B2B] opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl"></div>
            
            <img 
              src="/logo.jpeg" 
              alt="Wisdom Echo Academy Logo" 
              className="w-full h-full object-contain relative z-10"
            />
          </div>
        </div>

      </section>

      <Features />
      <Footer />
      
    </main>
  );
}