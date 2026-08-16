"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function ContactCTA() {
  return (
    <section className="bg-[#0E0E10] py-24 px-6 border-t border-[#F5F1E8]/[0.06]">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <h2 className="font-serif text-4xl sm:text-6xl font-bold text-[#F5F1E8] leading-tight">
            Ready to start?
          </h2>
          <p className="text-[#F5F1E8]/60 text-lg max-w-xl mx-auto">
            Whether you&apos;re a brand looking for creator campaigns or a creator looking for better deals, there&apos;s a clear next step.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/for-brands"
              className="group inline-flex items-center justify-center bg-[#FF6B35] hover:bg-[#C4622D] text-white font-semibold px-8 py-4 rounded-full transition-colors text-base"
            >
              Submit a brief
              <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Link>
            <Link
              href="/for-influencers"
              className="group inline-flex items-center justify-center border border-[#F5F1E8]/30 text-[#F5F1E8] hover:border-[#FF6B35] font-medium px-8 py-4 rounded-full transition-colors text-base"
            >
              Apply as a creator
              <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
