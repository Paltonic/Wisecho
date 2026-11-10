import React from "react";

const testimonialsData = [
  {
    name: "Alya R.",
    role: "JLPT N4 Student",
    quote:
      "The lessons are clear and structured. Because there's only one teacher, I never feel lost about what to do next. Passed N4 on my first try.",
  },
  {
    name: "Mr. Hendra",
    role: "Parent",
    quote:
      "Communication is well organized. There are progress reports, so I know my child is actually learning — not just attending class.",
  },
  {
    name: "Yuki S.",
    role: "Private Student",
    quote:
      "Materials were tailored to my tight timeline. Very personal — nothing like a big group class.",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 px-8 md:px-[5%] bg-[#1A1A1A] scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <span className="text-[#E52B2B] text-sm tracking-widest uppercase font-semibold">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mt-2">
            What They <span className="text-[#E52B2B]">Say</span>
          </h2>
          <p className="text-[#888888] mt-4 max-w-2xl leading-relaxed">
            Stories from students and parents who have learned together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonialsData.map((item) => (
            <div
              key={item.name}
              className="bg-[#242424] p-8 border-t-4 border-[#E52B2B] flex flex-col"
            >
              <p className="text-[#888888] leading-relaxed italic flex-1">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="mt-6">
                <p className="text-white font-bold uppercase tracking-wider text-sm">
                  {item.name}
                </p>
                <p className="text-[#E52B2B] text-xs uppercase tracking-widest mt-1">
                  {item.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}