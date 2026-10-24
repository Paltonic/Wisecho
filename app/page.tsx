import Navbar from "@/components/Navbar";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white selection:bg-[#E52B2B]">
      
      <Navbar />

      {/* Hero Section menggunakan Grid agar lebih rapi dan tidak tumpang tindih */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-8 md:px-[10%] py-20 md:py-32">
        
        {/* Sisi Kiri: Teks */}
        <div className="flex flex-col gap-6 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-wider leading-tight">
            Amplify Your <span className="text-[#E52B2B]">Wisdom.</span>
          </h1>
          <p className="text-lg text-[#888888] max-w-lg mx-auto md:mx-0">
            We build geometric precision into every strategy. Let your ideas resonate with clarity, impact, and modern design.
          </p>
          <button className="bg-[#E52B2B] hover:bg-[#c41e1e] text-white px-8 py-4 font-bold uppercase tracking-wider transition-colors w-fit mx-auto md:mx-0">
            Explore Solutions
          </button>
        </div>

        {/* Sisi Kanan: Gambar di dalam Kotak */}
        <div className="flex justify-center items-center w-full">
          <div className="bg-[#242424] p-8 md:p-12 rounded-3xl border border-[#333333] w-full max-w-[450px] aspect-square flex justify-center items-center">
            {/* 
              PENTING: Pastikan nama file tidak ada spasi. 
              Jika nama file Anda "Wisecho logo.JPG", ubah menjadi "wisecho-logo.jpg" di folder public.
            */}
            <img 
              src="/logo.jpeg" 
              alt="Wisdom Echo Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

      </section>

      <Features />
      <Footer />
      
    </main>
  );
}