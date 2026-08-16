"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const testimonials = [
  {
    quote: "They matched us with three creators in our niche and managed the entire process. ROAS was 3.8x on the campaign.",
    author: "Brand Partner",
    role: "DTC E-commerce",
    initials: "BP",
  },
  {
    quote: "As a creator, I used to waste so much time chasing brands for fair rates. Plix handles all that — I just make content.",
    author: "Creator Partner",
    role: "Fitness niche, 85k IG",
    initials: "CP",
  },
];

export default function SocialProof() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section ref={ref} className="bg-[#0E0E10] py-24 px-6 border-t border-[#F5F1E8]/[0.06]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#FF6B35] uppercase text-xs tracking-[0.2em] font-semibold mb-3">Social proof</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#F5F1E8] leading-tight">
            What our partners say.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15, ease: "easeOut" }}
              className="bg-[#F5F1E8]/[0.04] border border-[#F5F1E8]/10 rounded-2xl p-7"
            >
              <p className="text-[#F5F1E8]/70 text-base leading-relaxed mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C4622D]/20 border border-[#C4622D]/30 flex items-center justify-center text-[#C4622D] font-bold text-sm">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-[#F5F1E8] text-sm">{t.author}</p>
                  <p className="text-[#F5F1E8]/40 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center text-[#F5F1E8]/25 text-xs mt-6"
        >
          Testimonials attributed to role/niche only — names withheld until explicit consent given.
        </motion.p>
      </div>
    </section>
  );
}
