import Navbar from "@/components/Navbar";
import Method from "@/components/Features";
import Programs from "@/components/Programs";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Admission from "@/components/Admission";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white selection:bg-[#E52B2B]">
      <Navbar />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-8 md:px-[10%] py-20 md:py-32">
        <div className="flex flex-col gap-6 text-center md:text-left">
          <div className="flex flex-wrap justify-center md:justify-start gap-2 text-xs uppercase tracking-widest">
            <span className="border border-[#333333] text-[#888888] px-3 py-1">Limited Batches</span>
            <span className="border border-[#333333] text-[#888888] px-3 py-1">Taught Personally</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-wider leading-tight">
            Wisdom in Character, <br />
            <span className="text-[#E52B2B]">Echoing in the Future.</span>
          </h1>

          <p className="text-lg text-[#888888] max-w-lg mx-auto md:mx-0 leading-relaxed">
            Learn Japanese, digital literacy, and character with one
            instructor — personal, structured, and focused on results.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mx-auto md:mx-0">
            <a
              href="#contact"
              className="bg-[#E52B2B] hover:bg-[#c41e1e] text-white px-8 py-4 font-bold uppercase tracking-wider transition-colors w-fit"
            >
              Apply Now
            </a>
            <a
              href="#programs"
              className="border-2 border-[#888888] hover:border-white hover:text-white text-[#888888] px-8 py-4 font-bold uppercase tracking-wider transition-colors w-fit"
            >
              View Programs
            </a>
          </div>
        </div>

        <div className="flex justify-center items-center w-full">
          <div className="bg-[#242424] p-8 md:p-12 rounded-3xl border border-[#333333] w-full max-w-[450px] aspect-square flex justify-center items-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#E52B2B] opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl"></div>
            <img
              src="/logo.jpeg"
              alt="Wisdom Echo Academy Logo"
              className="w-full h-full object-contain relative z-10"
            />
          </div>
        </div>
      </section>

      <Programs />
      <About />
      <Experience/>
      <Method />
      <Testimonials />
      <FAQ />
      <Admission />
      <Contact />
      <Footer />
    </main>
  );
}