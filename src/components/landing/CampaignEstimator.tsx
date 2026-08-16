"use client";

import { useState } from "react";
import { createBrandRequest } from "@/actions/marketplace/createBrandRequest";
import { toast } from "sonner";
import Link from "next/link";

const GOALS = [
  { value: "brand_awareness", label: "Brand Awareness", icon: "📢" },
  { value: "sales_conversion", label: "Sales / Conversion", icon: "💰" },
  { value: "app_installs", label: "App Installs", icon: "📱" },
  { value: "product_launch", label: "Product Launch", icon: "🚀" },
  { value: "content_creation", label: "Content Creation (UGC)", icon: "🎬" },
];

const DELIVERABLES = ["Reels", "Posts", "Stories", "UGC", "Carousels"];
const NICHES = ["Fashion", "Tech", "Fitness", "Beauty", "Food", "Travel", "Lifestyle", "Gaming"];
const BUDGETS = ["Under $1k", "$1k–$5k", "$5k–$15k", "$15k–$50k", "$50k+"];

export default function CampaignEstimator() {
  const [goal, setGoal] = useState("");
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [niches, setNiches] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function toggleArr(arr: string[], setArr: (v: string[]) => void, val: string) {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  }

  // Rough scope estimation
  const scopeLines: string[] = [];
  if (deliverables.length > 0) scopeLines.push(`${deliverables.length} deliverable type${deliverables.length > 1 ? "s" : ""}: ${deliverables.join(", ")}`);
  if (niches.length > 0) scopeLines.push(`Creator niches: ${niches.join(", ")}`);
  if (budget) scopeLines.push(`Budget: ${budget}`);
  const canEstimate = goal && budget && deliverables.length > 0;

  async function handleGetQuote() {
    if (!canEstimate) { toast.error("Fill in goal, deliverables and budget first."); return; }
    setLoading(true);
    const selectedGoal = GOALS.find((g) => g.value === goal);
    const res = await createBrandRequest({
      campaignGoals: selectedGoal?.label ?? goal,
      deliverables,
      nicheNeeded: niches,
      budgetRange: budget,
      timeline: "Flexible",
      companyName: "Estimator Lead",
      contactName: "—",
      contactEmail: "pending@plix.agency",
    });
    setLoading(false);
    if (res.status === 200) {
      setSubmitted(true);
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8 space-y-3">
        <p className="text-2xl font-serif font-bold text-[#F5F1E8]">Brief sent!</p>
        <p className="text-[#F5F1E8]/60 text-sm">We&apos;ll reach out with a detailed scope and quote.</p>
        <Link href="/for-brands" className="text-[#FF6B35] hover:underline text-sm">
          Add more details to your brief →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Goal */}
      <div>
        <p className="text-[#F5F1E8] font-medium mb-3 text-sm">What&apos;s your primary goal?</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {GOALS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setGoal(g.value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm transition-colors ${
                goal === g.value
                  ? "bg-[#C4622D] border-[#C4622D] text-white"
                  : "bg-transparent border-[#F5F1E8]/20 text-[#F5F1E8]/60 hover:border-[#C4622D]"
              }`}
            >
              <span className="text-lg">{g.icon}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Deliverables */}
      <div>
        <p className="text-[#F5F1E8] font-medium mb-2 text-sm">What content do you need?</p>
        <div className="flex flex-wrap gap-2">
          {DELIVERABLES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleArr(deliverables, setDeliverables, d)}
              className={`px-3 py-1.5 rounded-full text-xs border font-medium transition-colors ${
                deliverables.includes(d)
                  ? "bg-[#C4622D] border-[#C4622D] text-white"
                  : "border-[#F5F1E8]/20 text-[#F5F1E8]/50 hover:border-[#C4622D]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Niches */}
      <div>
        <p className="text-[#F5F1E8] font-medium mb-2 text-sm">Creator niches (optional)</p>
        <div className="flex flex-wrap gap-2">
          {NICHES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => toggleArr(niches, setNiches, n)}
              className={`px-3 py-1.5 rounded-full text-xs border font-medium transition-colors ${
                niches.includes(n)
                  ? "bg-[#8A9A5B] border-[#8A9A5B] text-white"
                  : "border-[#F5F1E8]/20 text-[#F5F1E8]/50 hover:border-[#8A9A5B]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <p className="text-[#F5F1E8] font-medium mb-2 text-sm">Budget range</p>
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBudget(b)}
              className={`px-4 py-2 rounded-lg text-xs border font-medium transition-colors ${
                budget === b
                  ? "bg-[#C4622D] border-[#C4622D] text-white"
                  : "border-[#F5F1E8]/20 text-[#F5F1E8]/50 hover:border-[#C4622D]"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Estimate preview */}
      {canEstimate && (
        <div className="bg-[#F5F1E8]/[0.04] border border-[#F5F1E8]/10 rounded-xl p-4 text-sm space-y-1.5">
          <p className="text-[#F5F1E8]/40 text-xs uppercase tracking-wider font-semibold mb-2">Your scope so far</p>
          {scopeLines.map((line, i) => (
            <p key={i} className="text-[#F5F1E8]/70">• {line}</p>
          ))}
          <p className="text-[#F5F1E8]/40 text-xs pt-1">Request an exact quote to get creator recommendations and full pricing.</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleGetQuote}
        disabled={!canEstimate || loading}
        className="w-full bg-[#FF6B35] hover:bg-[#C4622D] disabled:opacity-40 text-white font-semibold py-3 rounded-full transition-colors text-sm"
      >
        {loading ? "Submitting…" : "Request exact quote →"}
      </button>
    </div>
  );
}
