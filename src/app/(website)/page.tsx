import { Suspense } from "react";
import Hero from "@/components/landing/Hero";
import Services from "@/components/landing/Services";
import NetworkPitch from "@/components/landing/NetworkPitch";
import HowItWorks from "@/components/landing/HowItWorks";
import SocialProof from "@/components/landing/SocialProof";
import Gallery from "@/components/landing/Gallery";
import ContactCTA from "@/components/landing/ContactCTA";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import CampaignEstimator from "@/components/landing/CampaignEstimator";
import { listPortfolioItems } from "@/actions/portfolio";

export const metadata = {
  title: "Plix Agency — Content, Campaigns & Creator Network",
  description: "Premium creative agency. Ad creation, content production, social management, and a vetted influencer network. Built for brands that want real results.",
};

export default async function Home() {
  const { data: portfolioItems = [] } = await listPortfolioItems();
  const featuredItems = (portfolioItems as any[]).filter((i) => i.featured).slice(0, 6);
  const galleryItems = featuredItems.length >= 3 ? featuredItems : (portfolioItems as any[]).slice(0, 6);

  return (
    <main className="bg-[#0E0E10] text-[#F5F1E8]">
      <LandingNav />

      {/* 1. Hero */}
      <Hero />

      {/* 2. What we do */}
      <Services />

      {/* 3. The Network */}
      <NetworkPitch />

      {/* 4. Work / Gallery (only if items exist) */}
      {galleryItems.length > 0 && <Gallery items={galleryItems} />}

      {/* 5. How it works */}
      <HowItWorks />

      {/* 6. Social proof */}
      <SocialProof />

      {/* 7. Campaign estimator */}
      <section className="bg-[#0E0E10] py-24 px-6 border-t border-[#F5F1E8]/[0.06]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[#FF6B35] uppercase text-xs tracking-[0.2em] font-semibold mb-3">Estimate your campaign</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#F5F1E8] leading-tight">
              What would it cost?
            </h2>
            <p className="text-[#F5F1E8]/50 text-base mt-4 max-w-xl mx-auto">
              Pick your goals, deliverables and budget range to get a rough scope — then request an exact quote.
            </p>
          </div>
          <Suspense>
            <CampaignEstimator />
          </Suspense>
        </div>
      </section>

      {/* 8. CTA / contact */}
      <ContactCTA />

      {/* 9. Footer */}
      <LandingFooter />
    </main>
  );
}
