import React from "react";

const pillarsData = [
  {
    title: "Character & Foundation",
    subtitle: "Hinkaku — 品格",
    description:
      "Every session builds discipline, integrity, and correct study habits — not just scores, but the way you think.",
  },
  {
    title: "Digital Wisdom",
    subtitle: "Chie — 知恵",
    description:
      "Students learn to use technology (AI, tools, resources) responsibly and efficiently to accelerate understanding.",
  },
  {
    title: "Future Pathways",
    subtitle: "Mirai — 未来",
    description:
      "JLPT preparation, Japanese communication, and study-in-Japan consulting — directed toward each student's goals.",
  },
];

export default function Method() {
  return (
    <section id="method" className="py-20 px-8 md:px-[5%] bg-[#151515] scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <span className="text-[#E52B2B] text-sm tracking-widest uppercase font-semibold">
            Method
          </span>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mt-2">
            Three <span className="text-[#E52B2B]">Pillars</span>
          </h2>
          <p className="text-[#888888] mt-4 max-w-2xl leading-relaxed">
            The approach I use in every class — structured, personal, and
            focused on real outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillarsData.map((item, index) => (
            <div
              key={index}
              className="bg-[#242424] p-10 border-t-4 border-[#E52B2B] hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="flex flex-col mb-4">
                <h3 className="text-2xl font-bold uppercase tracking-wider text-white">
                  {item.title}
                </h3>
                <span className="text-[#E52B2B] text-sm tracking-widest uppercase font-semibold mt-1">
                  {item.subtitle}
                </span>
              </div>
              <p className="text-[#888888] leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}