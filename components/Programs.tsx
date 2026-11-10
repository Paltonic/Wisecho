import React from "react";

const programsData = [
  {
    code: "01",
    title: "Private 1-on-1 Class",
    duration: "Per Session / Package",
    description:
      "Full focus on your needs. Materials, pace, and schedule are tailored — ideal for fast targets or students with special requirements.",
    tags: ["Personal", "Flexible", "Online/Offline"],
  },
  {
    code: "02",
    title: "Small Group Class",
    duration: "Max. 5 Students",
    description:
      "Learn together in a small group so you still get personal attention, at a more efficient cost.",
    tags: ["Small Group", "Discussion", "Collaborative"],
  },
  {
    code: "03",
    title: "JLPT Preparation",
    duration: "N5 – N2",
    description:
      "Intensive JLPT prep: kanji, grammar, reading, listening, and mock exams — with regular evaluations.",
    tags: ["JLPT", "Mock Exams", "Evaluation"],
  },
  {
    code: "04",
    title: "Study in Japan Consulting",
    duration: "Per Session",
    description:
      "Guidance on pathway selection, document preparation, interview practice, and application strategy to Japanese schools/universities.",
    tags: ["Study Abroad", "Interview", "Documents"],
  },
];

export default function Programs() {
  return (
    <section id="programs" className="py-20 px-8 md:px-[5%] bg-[#1A1A1A] scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <span className="text-[#E52B2B] text-sm tracking-widest uppercase font-semibold">
            Programs
          </span>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mt-2">
            Choose Your <span className="text-[#E52B2B]">Path</span>
          </h2>
          <p className="text-[#888888] mt-4 max-w-2xl leading-relaxed">
            Every class is taught directly by me — no middlemen, no substitute
            teachers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programsData.map((program) => (
            <div
              key={program.code}
              className="bg-[#242424] p-8 border border-[#333333] hover:border-[#E52B2B] transition-colors group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[#E52B2B] text-3xl font-bold">{program.code}</span>
                <span className="text-xs uppercase tracking-widest text-[#888888] border border-[#333333] px-3 py-1">
                  {program.duration}
                </span>
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-wider text-white">
                {program.title}
              </h3>
              <p className="text-[#888888] leading-relaxed mt-3 flex-1">
                {program.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                {program.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs uppercase tracking-widest text-[#E52B2B] bg-[#E52B2B]/10 px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#contact"
            className="inline-block bg-[#E52B2B] hover:bg-[#c41e1e] text-white px-8 py-4 font-bold uppercase tracking-wider transition-colors"
          >
            Free Consultation
          </a>
        </div>
      </div>
    </section>
  );
}