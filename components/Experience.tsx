"use client";

import React, { useRef, useState } from "react";
import { 
  motion, 
  useScroll, 
  useSpring, 
  useTransform, 
  useMotionValueEvent 
} from "framer-motion";

export default function Experience() {
  const sectionRef = useRef(null);
  const [isScrollingDown, setIsScrollingDown] = useState(true);
  const prevProgress = useRef(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"], 
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (latest > prevProgress.current) {
      setIsScrollingDown(true); 
    } else if (latest < prevProgress.current) {
      setIsScrollingDown(false); 
    }
    prevProgress.current = latest;
  });

  const lineHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const trainY = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  // Data Pengalaman Kerja yang Diperbarui
  const experiences = [
    {
      year: "2023 - Sekarang",
      title: "Founder & Lead Instructor",
      institution: "Wisdom Echo Academy",
      desc: "Mendirikan dan memimpin wadah pembelajaran terintegrasi yang mencakup berbagai disiplin ilmu: Bahasa, Ilmu Komputer, Matematika, Fisika, Kimia, dan Robotika. Merancang kurikulum holistik untuk mencetak generasi yang kompeten secara akademis, adaptif terhadap teknologi, dan siap bersaing di era global.",
    },
    {
      year: "2025 - 2027",
      title: "Computer Science & Japanese Teacher",
      institution: "Nakamura School, North Sumatera",
      desc: "Mengintegrasikan pengajaran Ilmu Komputer (logika pemrograman & literasi digital) dengan Bahasa Jepang. Membimbing siswa untuk berpikir komputasional sekaligus membangun pemahaman lintas budaya yang aplikatif.",
    },
    {
      year: "2022 - 2025",
      title: "Robotic Teacher",
      institution: "Mikroskil Robotic Center, North Sumatera",
      desc: "Mengajar perakitan dan pemrograman robotika untuk berbagai tingkatan usia. Membangun kemampuan problem-solving, kerja tim, dan kreativitas siswa melalui proyek-proyek robotika yang interaktif.",
    },
    {
      year: "2022 - 2023",
      title: "Math & Science Teacher",
      institution: "New Step Tuition, North Sumatera",
      desc: "Menyusun modul pembelajaran Matematika dan Sains yang interaktif untuk tingkat SD hingga SMA. Membantu siswa mengatasi kesulitan pada mata pelajaran eksakta dengan pendekatan yang mudah dipahami.",
    },
    {
      year: "2021 - 2022",
      title: "Math & Science Teacher",
      institution: "Harvard Tuition Centre, North Sumatera",
      desc: "Menyusun strategi pembelajaran intensif untuk persiapan ujian sekolah dan olimpiade. Memberikan pendekatan personal kepada siswa agar mampu menguasai konsep dasar Matematika dan Sains secara mendalam.",
    },
    {
      year: "2019 - 2021",
      title: "Private Teacher",
      institution: "Givi Education Center, North Sumatera",
      desc: "Membimbing siswa tingkat dasar dan menengah dalam berbagai mata pelajaran sekolah. Berfokus pada pembentukan fondasi belajar yang kuat serta menanamkan kebiasaan belajar yang disiplin dan terstruktur.",
    },
  ];

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="py-20 px-8 md:px-[5%] bg-[#111111] scroll-mt-24 relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#E52B2B] text-sm tracking-widest uppercase font-semibold">
            Journey
          </span>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mt-2 text-white">
            Teaching <span className="text-[#E52B2B]">Experience</span>
          </h2>
        </div>

        <div className="relative md:ml-8 pl-16 md:pl-24 space-y-12 pb-10">
          
          {/* REL KERETA API */}
          <div className="absolute left-0 top-0 bottom-0 w-8 md:w-10 z-0">
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id="rail-base" width="32" height="24" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="32" height="6" fill="#333333" />
                  <rect x="6" y="0" width="4" height="24" fill="#555555" />
                  <rect x="22" y="0" width="4" height="24" fill="#555555" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#rail-base)" />
            </svg>

            <motion.div 
              className="absolute top-0 left-0 w-full overflow-hidden"
              style={{ height: lineHeight }}
            >
              <svg width="100%" height="100%" className="absolute inset-0 min-h-[100vh]"> 
                <defs>
                  <pattern id="rail-progress" width="32" height="24" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="32" height="6" fill="#E52B2B" />
                    <rect x="6" y="0" width="4" height="24" fill="#E52B2B" />
                    <rect x="22" y="0" width="4" height="24" fill="#E52B2B" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#rail-progress)" />
              </svg>
            </motion.div>
          </div>

          {/* SHINKANSEN */}
          <motion.div
            className="absolute left-[2px] md:left-[6px] z-20 flex justify-center"
            style={{ 
              top: trainY,
              marginTop: "-20px"
            }}
          >
            <motion.div 
              className="text-3xl md:text-4xl drop-shadow-[0_0_8px_rgba(229,43,43,0.8)]"
              animate={{ 
                rotate: isScrollingDown ? 90 : -90 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
              }}
            >
              🚄
            </motion.div>
          </motion.div>

          {/* List Pengalaman */}
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: false, amount: 0.3 }} 
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              className="relative z-10"
            >
              <div className="bg-[#1a1a1a] border border-[#333333] p-6 rounded-2xl hover:border-[#E52B2B]/50 transition-colors duration-300 group">
                <span className="text-[#E52B2B] text-xs font-bold tracking-widest uppercase block mb-2">
                  {exp.year}
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-[#E52B2B] transition-colors">
                  {exp.title}
                </h3>
                <p className="text-[#888888] text-sm font-semibold mb-3">
                  {exp.institution}
                </p>
                <p className="text-[#888888] text-sm leading-relaxed">
                  {exp.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}