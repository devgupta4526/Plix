"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBrandRequest, type BrandRequestInput } from "@/actions/marketplace/createBrandRequest";
import { BrandRequestSchema } from "@/actions/marketplace/brandRequestSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

const STEPS = ["Goals", "Budget & Timeline", "Audience", "Contact"] as const;

const DELIVERABLES = ["Reels", "Posts", "UGC", "Stories", "Carousels"];
const NICHES = ["Fashion", "Tech", "Fitness", "Beauty", "Food", "Travel", "Lifestyle", "Gaming", "Finance", "Parenting"];
const BUDGET_RANGES = ["Under $1k", "$1k–$5k", "$5k–$15k", "$15k–$50k", "$50k+"];
const TIMELINES = ["ASAP (1–2 weeks)", "1 month", "2–3 months", "3–6 months", "Flexible"];

type FormState = BrandRequestInput & { step: number; submitted: boolean };

export default function BrandRequestForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<BrandRequestInput>({
    resolver: zodResolver(BrandRequestSchema),
    defaultValues: {
      deliverables: [],
      nicheNeeded: [],
      campaignGoals: "",
      budgetRange: "",
      timeline: "",
      companyName: "",
      contactName: "",
      contactEmail: "",
    },
    mode: "onBlur",
  });

  const { register, watch, setValue, handleSubmit, trigger, formState: { errors } } = form;

  const deliverables = watch("deliverables");
  const nicheNeeded = watch("nicheNeeded");

  function toggleArray(field: "deliverables" | "nicheNeeded", value: string) {
    const current = form.getValues(field);
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue(field, updated, { shouldValidate: true });
  }

  async function nextStep() {
    const fieldsPerStep: (keyof BrandRequestInput)[][] = [
      ["campaignGoals", "deliverables"],
      ["budgetRange", "timeline"],
      ["nicheNeeded"],
      ["companyName", "contactName", "contactEmail"],
    ];
    const valid = await trigger(fieldsPerStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function onSubmit(data: BrandRequestInput) {
    setLoading(true);
    const result = await createBrandRequest(data);
    setLoading(false);
    if (result.status === 200) {
      setSubmitted(true);
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle className="h-16 w-16 text-[#C4622D]" />
        <h2 className="text-2xl font-bold text-[#F5F1E8]">Brief submitted!</h2>
        <p className="text-[#F5F1E8]/70 max-w-md">
          We&apos;ve received your campaign brief and will reach out within 1–2 business days to discuss next steps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step
                  ? "bg-[#C4622D] text-white"
                  : i === step
                  ? "bg-[#FF6B35] text-white"
                  : "bg-[#F5F1E8]/10 text-[#F5F1E8]/40"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? "text-[#F5F1E8]" : "text-[#F5F1E8]/40"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="h-px w-6 bg-[#F5F1E8]/20" />}
          </div>
        ))}
      </div>

      {/* Step 0: Goals + Deliverables */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <Label className="text-[#F5F1E8] mb-2 block">What are your campaign goals?</Label>
            <Textarea
              {...register("campaignGoals")}
              placeholder="e.g. Brand awareness for our new product launch, drive app installs, increase follower count…"
              className="bg-[#1a1a1c] border-[#F5F1E8]/20 text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 min-h-[100px]"
            />
            {errors.campaignGoals && <p className="text-red-400 text-xs mt-1">{errors.campaignGoals.message}</p>}
          </div>
          <div>
            <Label className="text-[#F5F1E8] mb-3 block">What content deliverables do you need?</Label>
            <div className="flex flex-wrap gap-2">
              {DELIVERABLES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleArray("deliverables", d)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    deliverables.includes(d)
                      ? "bg-[#C4622D] border-[#C4622D] text-white"
                      : "bg-transparent border-[#F5F1E8]/30 text-[#F5F1E8]/70 hover:border-[#C4622D]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            {errors.deliverables && <p className="text-red-400 text-xs mt-1">Select at least one deliverable</p>}
          </div>
        </div>
      )}

      {/* Step 1: Budget & Timeline */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <Label className="text-[#F5F1E8] mb-3 block">What is your budget range?</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BUDGET_RANGES.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setValue("budgetRange", b, { shouldValidate: true })}
                  className={`px-4 py-3 rounded-lg text-sm font-medium border transition-colors ${
                    watch("budgetRange") === b
                      ? "bg-[#C4622D] border-[#C4622D] text-white"
                      : "bg-transparent border-[#F5F1E8]/30 text-[#F5F1E8]/70 hover:border-[#C4622D]"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            {errors.budgetRange && <p className="text-red-400 text-xs mt-1">{errors.budgetRange.message}</p>}
          </div>
          <div>
            <Label className="text-[#F5F1E8] mb-3 block">What is your timeline?</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TIMELINES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue("timeline", t, { shouldValidate: true })}
                  className={`px-4 py-3 rounded-lg text-sm font-medium border transition-colors ${
                    watch("timeline") === t
                      ? "bg-[#C4622D] border-[#C4622D] text-white"
                      : "bg-transparent border-[#F5F1E8]/30 text-[#F5F1E8]/70 hover:border-[#C4622D]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {errors.timeline && <p className="text-red-400 text-xs mt-1">{errors.timeline.message}</p>}
          </div>
        </div>
      )}

      {/* Step 2: Audience & Niche */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <Label className="text-[#F5F1E8] mb-3 block">Which creator niches do you want to reach?</Label>
            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggleArray("nicheNeeded", n)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    nicheNeeded.includes(n)
                      ? "bg-[#8A9A5B] border-[#8A9A5B] text-white"
                      : "bg-transparent border-[#F5F1E8]/30 text-[#F5F1E8]/70 hover:border-[#8A9A5B]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            {errors.nicheNeeded && <p className="text-red-400 text-xs mt-1">Select at least one niche</p>}
          </div>
          <div>
            <Label className="text-[#F5F1E8] mb-2 block">Describe your target audience (optional)</Label>
            <Textarea
              {...register("targetAudience")}
              placeholder="e.g. Women 18–34, UK-based, interested in sustainable fashion…"
              className="bg-[#1a1a1c] border-[#F5F1E8]/20 text-[#F5F1E8] placeholder:text-[#F5F1E8]/30"
            />
          </div>
          <div>
            <Label className="text-[#F5F1E8] mb-2 block">Industry (optional)</Label>
            <Input
              {...register("industry")}
              placeholder="e.g. Beauty, Fintech, Apparel…"
              className="bg-[#1a1a1c] border-[#F5F1E8]/20 text-[#F5F1E8] placeholder:text-[#F5F1E8]/30"
            />
          </div>
        </div>
      )}

      {/* Step 3: Contact */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <Label className="text-[#F5F1E8] mb-1 block">Company name *</Label>
            <Input
              {...register("companyName")}
              className="bg-[#1a1a1c] border-[#F5F1E8]/20 text-[#F5F1E8] placeholder:text-[#F5F1E8]/30"
            />
            {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName.message}</p>}
          </div>
          <div>
            <Label className="text-[#F5F1E8] mb-1 block">Your name *</Label>
            <Input
              {...register("contactName")}
              className="bg-[#1a1a1c] border-[#F5F1E8]/20 text-[#F5F1E8] placeholder:text-[#F5F1E8]/30"
            />
            {errors.contactName && <p className="text-red-400 text-xs mt-1">{errors.contactName.message}</p>}
          </div>
          <div>
            <Label className="text-[#F5F1E8] mb-1 block">Email *</Label>
            <Input
              {...register("contactEmail")}
              type="email"
              className="bg-[#1a1a1c] border-[#F5F1E8]/20 text-[#F5F1E8] placeholder:text-[#F5F1E8]/30"
            />
            {errors.contactEmail && <p className="text-red-400 text-xs mt-1">{errors.contactEmail.message}</p>}
          </div>
          <div>
            <Label className="text-[#F5F1E8] mb-1 block">Phone (optional)</Label>
            <Input
              {...register("contactPhone")}
              type="tel"
              className="bg-[#1a1a1c] border-[#F5F1E8]/20 text-[#F5F1E8] placeholder:text-[#F5F1E8]/30"
            />
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            className="border-[#F5F1E8]/30 text-[#F5F1E8] hover:bg-[#F5F1E8]/10"
          >
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={nextStep}
            className="bg-[#FF6B35] hover:bg-[#C4622D] text-white font-semibold flex-1"
          >
            Next: {STEPS[step + 1]}
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#FF6B35] hover:bg-[#C4622D] text-white font-semibold flex-1"
          >
            {loading ? "Submitting…" : "Submit Campaign Brief"}
          </Button>
        )}
      </div>
    </form>
  );
}
