import { listPortfolioItems } from "@/actions/portfolio";
import Gallery from "@/components/landing/Gallery";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata = {
  title: "Work | Plix Agency",
  description: "Portfolio of campaigns, reels, and creative work by Plix Agency.",
};

export default async function WorkPage() {
  const { data: items = [] } = await listPortfolioItems();

  return (
    <main className="min-h-screen bg-[#0E0E10] text-[#F5F1E8]">
      <LandingNav />
      <div className="pt-20">
        <section className="max-w-5xl mx-auto px-6 pt-16 pb-8">
          <p className="text-[#FF6B35] uppercase text-xs tracking-[0.2em] font-semibold mb-3">Portfolio</p>
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-[#F5F1E8] leading-tight">
            Our work.
          </h1>
        </section>
        <Gallery items={items as any} />
      </div>
      <LandingFooter />
    </main>
  );
}
