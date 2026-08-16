import Link from "next/link";
import BrandRequestForm from "@/components/landing/BrandRequestForm";

export const metadata = {
  title: "Work With Us | Plix Agency",
  description: "Submit your campaign brief and our team will match you with the right creators.",
};

export default function ForBrandsPage() {
  return (
    <main className="min-h-screen bg-[#0E0E10] text-[#F5F1E8]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#F5F1E8]/10">
        <Link href="/" className="font-bold text-xl tracking-tight text-[#F5F1E8]">
          Plix
        </Link>
        <Link
          href="/for-influencers"
          className="text-sm text-[#F5F1E8]/60 hover:text-[#FF6B35] transition-colors"
        >
          Are you a creator? →
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pt-16 pb-8 text-center">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#C4622D]/20 text-[#FF6B35] mb-4 uppercase tracking-wider">
          For Brands
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold leading-tight mb-4">
          Let&apos;s build your next{" "}
          <span className="text-[#FF6B35]">campaign</span>
        </h1>
        <p className="text-[#F5F1E8]/60 text-lg leading-relaxed">
          Tell us about your goals and we&apos;ll hand-pick the right creators from our vetted network — no guesswork, no mass-blasting.
        </p>
      </section>

      {/* Three value props */}
      <section className="max-w-3xl mx-auto px-6 pb-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { icon: "🎯", title: "Vetted creators", desc: "Every creator in our network is reviewed before they can accept campaigns." },
          { icon: "🤝", title: "Agency-managed", desc: "We handle introductions, briefing and follow-up — you stay focused on your product." },
          { icon: "📊", title: "Real results", desc: "We only report metrics that exist. No inflated vanity numbers." },
        ].map((v) => (
          <div key={v.title} className="bg-[#F5F1E8]/5 border border-[#F5F1E8]/10 rounded-xl p-5">
            <div className="text-2xl mb-2">{v.icon}</div>
            <h3 className="font-semibold text-[#F5F1E8] mb-1">{v.title}</h3>
            <p className="text-sm text-[#F5F1E8]/50">{v.desc}</p>
          </div>
        ))}
      </section>

      {/* The form */}
      <section className="max-w-xl mx-auto px-6 pb-20">
        <div className="bg-[#F5F1E8]/5 border border-[#F5F1E8]/10 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-[#F5F1E8] mb-6">Submit your campaign brief</h2>
          <BrandRequestForm />
        </div>
      </section>
    </main>
  );
}
