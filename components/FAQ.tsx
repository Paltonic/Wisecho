"use client";

import React, { useState } from "react";

const faqData = [
  {
    q: "Are classes online or offline?",
    a: "Both are available. Online via video call with materials and recordings; offline at an agreed location.",
  },
  {
    q: "How long is each session?",
    a: "Standard 60–90 minutes per session, depending on the program and initial agreement.",
  },
  {
    q: "How do I enroll?",
    a: "Fill in the application form or message me on WhatsApp, then we do a short consultation to pick a program and schedule.",
  },
  {
    q: "Is there a quota?",
    a: "Yes. Because I teach alone, student quotas are capped per batch to maintain quality.",
  },
  {
    q: "Do I get an account?",
    a: "Yes — after your application is confirmed, you'll receive login credentials to access the student dashboard.",
  },
  {
    q: "Can I reschedule?",
    a: "Yes, with at least 24 hours' notice. Full details are in the class policy.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 px-8 md:px-[5%] bg-[#151515] scroll-mt-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <span className="text-[#E52B2B] text-sm tracking-widest uppercase font-semibold">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mt-2">
            Common <span className="text-[#E52B2B]">Questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqData.map((item, index) => (
            <div key={index} className="bg-[#242424] border border-[#333333]">
              <button
                onClick={() => setOpen(open === index ? null : index)}
                className="w-full flex justify-between items-center gap-4 px-6 py-5 text-left"
              >
                <span className="text-white font-semibold">{item.q}</span>
                <span className="text-[#E52B2B] text-xl font-bold shrink-0">
                  {open === index ? "−" : "+"}
                </span>
              </button>
              {open === index && (
                <p className="px-6 pb-5 text-[#888888] leading-relaxed text-sm">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}