"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const services = [
  {
    number: "01",
    title: "Ad Creation",
    description: "Performance-first creative — video ads, static, UGC-style — built to stop the scroll and convert, not just look good in a deck.",
    tag: "Paid Social",
  },
  {
    number: "02",
    title: "Content & Post Production",
    description: "Reels, carousels, short-form video — end-to-end production from concept to final cut, designed for the feed.",
    tag: "Organic",
  },
  {
    number: "03",
    title: "Social Profile Management",
    description: "Consistent posting, community engagement and platform-native strategy, so your brand voice grows without you babysitting it.",
    tag: "Management",
  },
  {
    number: "04",
    title: "Influencer Matching",
    description: "We hand-pick and negotiate with creators in our vetted network based on your audience, goals and budget — no self-serve guesswork.",
    tag: "Network",
  },
];

export default function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section ref={ref} className="bg-[#0E0E10] py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-14 max-w-xl">
          <p className="text-[#FF6B35] uppercase text-xs tracking-[0.2em] font-semibold mb-3">What we do</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#F5F1E8] leading-tight">
            Full-stack creative, not a one-trick tool.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
              className="group bg-[#F5F1E8]/[0.03] border border-[#F5F1E8]/10 rounded-2xl p-7 hover:border-[#C4622D]/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-5">
                <span className="font-serif text-4xl font-bold text-[#C4622D]/30">{service.number}</span>
                <span className="text-xs font-semibold bg-[#8A9A5B]/20 text-[#8A9A5B] px-2.5 py-1 rounded-full">
                  {service.tag}
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#F5F1E8] mb-3">{service.title}</h3>
              <p className="text-[#F5F1E8]/50 text-sm leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
