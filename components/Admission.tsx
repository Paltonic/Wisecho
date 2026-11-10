import React from "react";

const steps = [
  { n: "01", title: "Apply", desc: "Submit your details via the form or WhatsApp." },
  { n: "02", title: "Consultation", desc: "We discuss your needs, goals, and schedule." },
  { n: "03", title: "Choose Program", desc: "Pick the class format and package that fit." },
  { n: "04", title: "Payment", desc: "Confirm your slot and complete payment." },
  { n: "05", title: "Get Account", desc: "Receive login credentials and access the dashboard." },
];

export default function Admission() {
  return (
    <section id="admission" className="py-20 px-8 md:px-[5%] bg-[#1A1A1A] scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <span className="text-[#E52B2B] text-sm tracking-widest uppercase font-semibold">
            Admission
          </span>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mt-2">
            How to <span className="text-[#E52B2B]">Enroll</span>
          </h2>
          <p className="text-[#888888] mt-4 max-w-2xl mx-auto leading-relaxed">
            The process is simple — usually completed within 1–2 business days.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step) => (
            <div key={step.n} className="bg-[#242424] p-6 border-t-4 border-[#E52B2B]">
              <span className="text-[#E52B2B] text-3xl font-bold">{step.n}</span>
              <h3 className="text-white font-bold uppercase tracking-wider mt-3 text-sm">
                {step.title}
              </h3>
              <p className="text-[#888888] text-xs leading-relaxed mt-2">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#contact"
            className="inline-block bg-[#E52B2B] hover:bg-[#c41e1e] text-white px-8 py-4 font-bold uppercase tracking-wider transition-colors"
          >
            Apply Now
          </a>
        </div>
      </div>
    </section>
  );
}