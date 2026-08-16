import Link from "next/link";

export const metadata = {
  title: "Join as a Creator | Plix Agency",
  description: "Apply to the Plix creator network and get matched with brand campaigns.",
};

export default function ForInfluencersPage() {
  return (
    <main className="min-h-screen bg-[#0E0E10] text-[#F5F1E8]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#F5F1E8]/10">
        <Link href="/" className="font-bold text-xl tracking-tight text-[#F5F1E8]">
          Plix
        </Link>
        <Link
          href="/for-brands"
          className="text-sm text-[#F5F1E8]/60 hover:text-[#FF6B35] transition-colors"
        >
          Looking to run a campaign? →
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pt-16 pb-8 text-center">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#8A9A5B]/20 text-[#8A9A5B] mb-4 uppercase tracking-wider">
          For Creators
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold leading-tight mb-4">
          Get deals you wouldn&apos;t{" "}
          <span className="text-[#FF6B35]">land alone</span>
        </h1>
        <p className="text-[#F5F1E8]/60 text-lg leading-relaxed">
          Join our curated network of creators. We pitch you to brands, handle negotiations, and manage campaign logistics — you just create.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="inline-block bg-[#FF6B35] hover:bg-[#C4622D] text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            Apply as a creator
          </Link>
          <Link
            href="/dashboard"
            className="inline-block border border-[#F5F1E8]/30 text-[#F5F1E8] font-medium px-8 py-3 rounded-full hover:border-[#FF6B35] transition-colors"
          >
            Already have an account
          </Link>
        </div>
      </section>

      {/* How it works for creators */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-serif font-bold text-center mb-10">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Build your profile",
              desc: "Add your platforms, follower counts, niches, rate card and bio after signing up.",
            },
            {
              step: "02",
              title: "We review & approve",
              desc: "Our team checks every profile before it enters the matching pool — keeping quality high for everyone.",
            },
            {
              step: "03",
              title: "Accept deals",
              desc: "When a brand campaign matches your profile, you get a proposal in your dashboard to accept or decline.",
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="text-[#FF6B35]/30 text-5xl font-bold font-serif mb-3">{item.step}</div>
              <h3 className="font-semibold text-[#F5F1E8] mb-2">{item.title}</h3>
              <p className="text-sm text-[#F5F1E8]/50 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-3xl mx-auto px-6 pb-16 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: "💰", title: "Negotiated rates", desc: "We advocate for fair rates and handle all price conversations." },
          { icon: "🛡️", title: "Vetted brands only", desc: "No time-wasters. Every brand brief is reviewed before proposals go out." },
          { icon: "📅", title: "Clear timelines", desc: "Deliverables, dates and payment terms are set before you say yes." },
          { icon: "🚀", title: "Campaign support", desc: "We stay involved throughout — you're never left alone mid-campaign." },
        ].map((b) => (
          <div key={b.title} className="bg-[#F5F1E8]/5 border border-[#F5F1E8]/10 rounded-xl p-5 flex gap-4">
            <div className="text-2xl">{b.icon}</div>
            <div>
              <h3 className="font-semibold text-[#F5F1E8] mb-1">{b.title}</h3>
              <p className="text-sm text-[#F5F1E8]/50">{b.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-[#F5F1E8]/5 border-t border-[#F5F1E8]/10 py-14 px-6 text-center">
        <h2 className="text-2xl font-serif font-bold mb-3">Ready to join?</h2>
        <p className="text-[#F5F1E8]/60 mb-6">Create your account and build your creator profile in under 5 minutes.</p>
        <Link
          href="/sign-up"
          className="inline-block bg-[#FF6B35] hover:bg-[#C4622D] text-white font-semibold px-10 py-3 rounded-full transition-colors"
        >
          Get started →
        </Link>
      </section>
    </main>
  );
}
