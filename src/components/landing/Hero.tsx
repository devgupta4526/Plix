"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-64 h-64 rounded-full bg-[#C4622D]/10 blur-3xl" />
    </div>
  ),
});

import type { Variants } from "framer-motion";

const stagger: { container: Variants; item: Variants } = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.12 } } },
  item: {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#0E0E10]">
      {/* 3D backdrop — lazy, SSR off */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <HeroCanvas />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.p variants={stagger.item} className="text-[#FF6B35] uppercase text-xs font-semibold tracking-[0.2em]">
            Creative Agency × Influencer Network
          </motion.p>
          <motion.h1
            variants={stagger.item}
            className="font-serif text-5xl sm:text-7xl font-bold leading-[1.08] tracking-tight text-[#F5F1E8]"
          >
            We make brands{" "}
            <span className="italic text-[#FF6B35]">matter</span>{" "}
            online.
          </motion.h1>
          <motion.p
            variants={stagger.item}
            className="text-[#F5F1E8]/60 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Ad creation, content production, social management, and a curated network of creators who actually convert.
          </motion.p>
          <motion.div variants={stagger.item} className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/for-brands"
              className="inline-block bg-[#FF6B35] hover:bg-[#C4622D] text-white font-semibold px-8 py-3.5 rounded-full transition-colors text-sm"
            >
              Work with us →
            </Link>
            <Link
              href="/for-influencers"
              className="inline-block border border-[#F5F1E8]/30 text-[#F5F1E8] hover:border-[#FF6B35] font-medium px-8 py-3.5 rounded-full transition-colors text-sm"
            >
              Join as a creator
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#F5F1E8]/30">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-[#F5F1E8]/20" />
      </div>
    </section>
  );
}
