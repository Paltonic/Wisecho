import React from "react";
import profileImage from "../app/assets/ProfilePic.png";

export default function About() {
  return (
    <section id="about" className="py-20 px-8 md:px-[5%] bg-[#151515] scroll-mt-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-12 items-center">
        <div className="flex justify-center">
          <div className="w-64 h-64 rounded-3xl bg-[#242424] border border-[#333333] flex items-center justify-center relative overflow-hidden">
            {/* Optional: Kept the red tint overlay, but ensure it doesn't block the image */}
            <div className="absolute inset-0 bg-[#E52B2B] opacity-5 z-10 pointer-events-none"></div>
            
            {/* 2. Replaced the <span> with an <img> tag */}
            <img 
              src={profileImage.src} 
              alt="Frederick Liko" 
              className="w-full h-full object-cover relative z-0" 
            />
          </div>
        </div>

        <div>
          <span className="text-[#E52B2B] text-sm tracking-widest uppercase font-semibold">
            About
          </span>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mt-2">
            Frederick <span className="text-[#E52B2B]">Liko</span>
          </h2>
          <p className="text-[#E52B2B] text-sm uppercase tracking-widest font-semibold mt-2">
            Founder & Instructor
          </p>

          <p className="text-[#888888] mt-6 leading-relaxed">
            I teach Japanese language, digital literacy, and character building
            for students who want to learn seriously — not just join a class.
            Every student gets full attention because I teach alone, from start
            to finish.
          </p>

          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Teaching & JLPT mentoring experience (N5–N2)",
              "Focus on understanding, not just memorization",
              "Personal approach per student, with regular evaluations",
              "Online & offline classes with flexible schedules",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[#888888]">
                <span className="text-[#E52B2B] mt-1">▹</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3 text-xs uppercase tracking-widest">
            <span className="border border-[#333333] text-[#888888] px-3 py-1">Limited Batches</span>
            <span className="border border-[#333333] text-[#888888] px-3 py-1">Capped Quota</span>
            <span className="border border-[#333333] text-[#888888] px-3 py-1">Personal Mentoring</span>
          </div>
        </div>
      </div>
    </section>
  );
}