"use client";

import React, { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire up to your API / database
    setSubmitted(true);
  }

  return (
    <section id="contact" className="py-20 px-8 md:px-[5%] bg-[#151515] scroll-mt-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <span className="text-[#E52B2B] text-sm tracking-widest uppercase font-semibold">
            Apply Now
          </span>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mt-2">
            Start Your <span className="text-[#E52B2B]">Journey</span>
          </h2>
          <p className="text-[#888888] mt-4 leading-relaxed max-w-md">
            Fill in the form or message me directly. I&apos;ll reply within 24
            hours to set up a short consultation.
          </p>

          <div className="mt-8 space-y-4 text-sm">
            <p className="text-[#888888]">
              <span className="text-white font-semibold uppercase tracking-wider block">
                WhatsApp
              </span>
              +62 812 3456 7890
            </p>
            <p className="text-[#888888]">
              <span className="text-white font-semibold uppercase tracking-wider block">
                Email
              </span>
              hello@wisdomEcho.edu
            </p>
            <p className="text-[#888888]">
              <span className="text-white font-semibold uppercase tracking-wider block">
                Location
              </span>
              Jakarta, Indonesia — online & offline
            </p>
          </div>

          <div className="mt-8 p-4 border border-[#333333] bg-[#242424] text-xs text-[#888888] leading-relaxed">
            <span className="text-[#E52B2B] font-bold uppercase tracking-wider">
              Note:
            </span>{" "}
            Quota per batch is limited because all classes are taught directly
            by me.
          </div>
        </div>

        {submitted ? (
          <div className="bg-[#242424] border border-[#E52B2B] p-8 flex flex-col justify-center">
            <h3 className="text-2xl font-bold uppercase tracking-wider text-white">
              Application <span className="text-[#E52B2B]">Received</span>
            </h3>
            <p className="text-[#888888] mt-3 leading-relaxed">
              Thank you. I&apos;ll review your application and get back to you
              within 24 hours with your account credentials.
            </p>
            <a
              href="/login"
              className="mt-6 inline-block bg-[#E52B2B] hover:bg-[#c41e1e] text-white px-6 py-3 font-bold uppercase tracking-wider text-sm transition-colors w-fit"
            >
              Go to Log In
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              required
              placeholder="Full Name"
              className="bg-[#242424] border border-[#333333] focus:border-[#E52B2B] outline-none px-4 py-3 text-white placeholder:text-[#666666] transition-colors"
            />
            <input
              type="tel"
              required
              placeholder="WhatsApp Number"
              className="bg-[#242424] border border-[#333333] focus:border-[#E52B2B] outline-none px-4 py-3 text-white placeholder:text-[#666666] transition-colors"
            />
            <input
              type="email"
              required
              placeholder="Email"
              className="bg-[#242424] border border-[#333333] focus:border-[#E52B2B] outline-none px-4 py-3 text-white placeholder:text-[#666666] transition-colors"
            />
            <select
              required
              className="bg-[#242424] border border-[#333333] focus:border-[#E52B2B] outline-none px-4 py-3 text-white transition-colors"
              defaultValue=""
            >
              <option value="" disabled>Select a program</option>
              <option>Private 1-on-1 Class</option>
              <option>Small Group Class</option>
              <option>JLPT Preparation</option>
              <option>Study in Japan Consulting</option>
            </select>
            <textarea
              rows={4}
              placeholder="Goals / learning needs (brief)"
              className="bg-[#242424] border border-[#333333] focus:border-[#E52B2B] outline-none px-4 py-3 text-white placeholder:text-[#666666] transition-colors resize-none"
            />
            <button
              type="submit"
              className="bg-[#E52B2B] hover:bg-[#c41e1e] text-white px-8 py-4 font-bold uppercase tracking-wider transition-colors w-full"
            >
              Submit Application
            </button>
            <p className="text-xs text-[#666666]">
              By submitting, you agree to be contacted via WhatsApp or email.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}