"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const brandSteps = [
  { step: 1, title: "Submit your brief", desc: "Fill out our segmented intake form — goals, budget, timeline, niches. Takes 3 minutes." },
  { step: 2, title: "We review & match", desc: "Our team reviews your brief and hand-picks creators from our vetted network that fit your goals." },
  { step: 3, title: "We make the introduction", desc: "We connect you with the selected creators, handle negotiations, and brief everyone properly." },
  { step: 4, title: "Campaign runs", desc: "We stay involved throughout, tracking deliverables and keeping the campaign on schedule." },
];

const creatorSteps = [
  { step: 1, title: "Build your profile", desc: "Sign up and add your platforms, niches, rate card and audience summary." },
  { step: 2, title: "Get approved", desc: "Our team reviews your profile before you enter the matching pool — usually within 48 hours." },
  { step: 3, title: "Receive proposals", desc: "When a brand campaign fits your profile, you get a proposal in your dashboard to accept or decline." },
  { step: 4, title: "Create & get paid", desc: "Deliver your content, we track everything, and payment follows according to the agreed terms." },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [tab, setTab] = useState<"brands" | "creators">("brands");

  const steps = tab === "brands" ? brandSteps : creatorSteps;

  return (
    <section ref={ref} className="bg-[#0E0E10] py-24 px-6 border-t border-[#F5F1E8]/[0.06]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#FF6B35] uppercase text-xs tracking-[0.2em] font-semibold mb-3">How it works</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#F5F1E8] mb-8 leading-tight">
            Simple process, serious results.
          </h2>
          {/* Tab toggle */}
          <div className="inline-flex bg-[#F5F1E8]/[0.06] rounded-full p-1">
            {(["brands", "creators"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  tab === t
                    ? "bg-[#C4622D] text-white"
                    : "text-[#F5F1E8]/50 hover:text-[#F5F1E8]"
                }`}
              >
                For {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={`${tab}-${step.step}`}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="bg-[#F5F1E8]/[0.03] border border-[#F5F1E8]/10 rounded-2xl p-6"
            >
              <span className="font-serif text-5xl font-bold text-[#C4622D]/25 block mb-3">
                {String(step.step).padStart(2, "0")}
              </span>
              <h3 className="font-serif text-lg font-bold text-[#F5F1E8] mb-2">{step.title}</h3>
              <p className="text-[#F5F1E8]/50 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
