"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

const stats = [
  { label: "Creators in network", value: "—", note: "growing" },
  { label: "Avg. engagement rate", value: "—", note: "across campaigns" },
  { label: "Brands worked with", value: "—", note: "and counting" },
];

export default function NetworkPitch() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section ref={ref} className="bg-[#0E0E10] py-24 px-6 border-t border-[#F5F1E8]/[0.06]">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: pitch copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-[#FF6B35] uppercase text-xs tracking-[0.2em] font-semibold mb-3">The network</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#F5F1E8] leading-tight mb-6">
              Every creator is vetted before they work.
            </h2>
            <p className="text-[#F5F1E8]/60 text-base leading-relaxed mb-4">
              We don&apos;t run a self-serve matching platform where brands pick blindly from an unfiltered list. Every creator in our network has been reviewed by our team — their content quality, engagement authenticity and professionalism checked before they&apos;re ever proposed for a campaign.
            </p>
            <p className="text-[#F5F1E8]/60 text-base leading-relaxed mb-8">
              When we introduce you to a creator, or a creator to a brand, we&apos;ve already done the due diligence. You&apos;re not gambling with your budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/for-brands"
                className="inline-block bg-[#FF6B35] hover:bg-[#C4622D] text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
              >
                I want to run a campaign
              </Link>
              <Link
                href="/for-influencers"
                className="inline-block border border-[#F5F1E8]/30 text-[#F5F1E8] hover:border-[#FF6B35] font-medium px-6 py-3 rounded-full transition-colors text-sm"
              >
                I&apos;m a creator
              </Link>
            </div>
          </motion.div>

          {/* Right: stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="space-y-4"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#F5F1E8]/[0.03] border border-[#F5F1E8]/10 rounded-2xl px-6 py-5 flex items-center justify-between"
              >
                <div>
                  <p className="text-[#F5F1E8]/50 text-sm">{stat.label}</p>
                  <p className="text-xs text-[#F5F1E8]/30 mt-0.5">{stat.note}</p>
                </div>
                <span className="font-serif text-3xl font-bold text-[#C4622D]/60">{stat.value}</span>
              </div>
            ))}
            <p className="text-[#F5F1E8]/30 text-xs px-1">
              Stats will be populated with real data once campaigns are live. We don&apos;t fabricate metrics.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
