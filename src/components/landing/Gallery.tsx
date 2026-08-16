"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";

type PortfolioItem = {
  id: string;
  title: string;
  clientName: string;
  category: string;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  description?: string | null;
  externalLink?: string | null;
  metrics?: any;
  featured: boolean;
};

const CATEGORY_LABELS: Record<string, string> = {
  AD: "Ad",
  SOCIAL_POST: "Social",
  CAMPAIGN: "Campaign",
  REEL: "Reel",
  BRAND_PROFILE: "Brand",
};

export default function Gallery({ items }: { items: PortfolioItem[] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });
  const [filter, setFilter] = useState("ALL");
  const [lightbox, setLightbox] = useState<PortfolioItem | null>(null);

  const categories = ["ALL", ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = filter === "ALL" ? items : items.filter((i) => i.category === filter);

  if (items.length === 0) return null;

  return (
    <section ref={ref} className="bg-[#0E0E10] py-24 px-6 border-t border-[#F5F1E8]/[0.06]">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-[#FF6B35] uppercase text-xs tracking-[0.2em] font-semibold mb-3">Work</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#F5F1E8] leading-tight">
              The proof.
            </h2>
          </div>
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  filter === cat
                    ? "bg-[#8A9A5B] border-[#8A9A5B] text-white"
                    : "border-[#F5F1E8]/20 text-[#F5F1E8]/50 hover:border-[#8A9A5B]"
                }`}
              >
                {cat === "ALL" ? "All" : CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-0">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="mb-4 break-inside-avoid group cursor-pointer"
              onClick={() => setLightbox(item)}
            >
              <div className="relative overflow-hidden rounded-xl bg-[#F5F1E8]/[0.04] border border-[#F5F1E8]/10">
                <img
                  src={item.thumbnailUrl ?? item.mediaUrl}
                  alt={item.title}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-[#0E0E10]/0 group-hover:bg-[#0E0E10]/60 transition-colors duration-300 flex items-end p-4 opacity-0 group-hover:opacity-100">
                  <div>
                    <p className="font-serif font-bold text-[#F5F1E8] text-base">{item.title}</p>
                    <p className="text-[#F5F1E8]/60 text-xs">{item.clientName}</p>
                  </div>
                </div>
                {item.featured && (
                  <span className="absolute top-3 left-3 text-xs bg-[#C4622D] text-white px-2 py-0.5 rounded-full font-semibold">
                    Featured
                  </span>
                )}
                <span className="absolute top-3 right-3 text-xs bg-[#8A9A5B]/90 text-white px-2 py-0.5 rounded-full">
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/work"
            className="text-sm text-[#FF6B35] hover:text-[#C4622D] transition-colors font-medium"
          >
            View all work →
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0E0E10]/90 flex items-center justify-center p-6"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1a1c] border border-[#F5F1E8]/10 rounded-2xl max-w-2xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightbox.mediaUrl}
                alt={lightbox.title}
                className="w-full max-h-96 object-cover"
              />
              <div className="p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#F5F1E8]">{lightbox.title}</h3>
                    <p className="text-[#F5F1E8]/50 text-sm">{lightbox.clientName}</p>
                  </div>
                  <span className="text-xs bg-[#8A9A5B]/20 text-[#8A9A5B] px-2 py-1 rounded-full">
                    {CATEGORY_LABELS[lightbox.category] ?? lightbox.category}
                  </span>
                </div>
                {lightbox.description && (
                  <p className="text-[#F5F1E8]/60 text-sm leading-relaxed">{lightbox.description}</p>
                )}
                {lightbox.metrics && (
                  <div className="flex gap-4">
                    {Object.entries(lightbox.metrics).map(([k, v]) => (
                      v ? (
                        <div key={k}>
                          <p className="text-[#FF6B35] font-bold text-lg">{v as string}</p>
                          <p className="text-[#F5F1E8]/40 text-xs capitalize">{k}</p>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}
                {lightbox.externalLink && (
                  <a
                    href={lightbox.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#FF6B35] hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View live →
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
