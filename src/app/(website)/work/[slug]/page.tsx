import { client } from "@/lib/prisma";
import { notFound } from "next/navigation";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import Link from "next/link";

type Props = { params: { slug: string } };

export default async function CaseStudyPage({ params }: Props) {
  // slug is the item id for now
  const item = await client.portfolioItem.findUnique({ where: { id: params.slug } });
  if (!item) notFound();

  return (
    <main className="min-h-screen bg-[#0E0E10] text-[#F5F1E8]">
      <LandingNav />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        {/* Back */}
        <Link href="/work" className="text-[#F5F1E8]/40 hover:text-[#FF6B35] text-sm transition-colors mb-8 inline-block">
          ← Back to work
        </Link>

        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-semibold bg-[#8A9A5B]/20 text-[#8A9A5B] px-2.5 py-1 rounded-full">
            {item.category.replace("_", " ")}
          </span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight mb-2">{item.title}</h1>
        <p className="text-[#F5F1E8]/50 text-base mb-8">{item.clientName}</p>

        {/* Hero image */}
        <img
          src={item.mediaUrl}
          alt={item.title}
          className="w-full rounded-2xl object-cover mb-10 max-h-[480px]"
        />

        {/* Metrics */}
        {item.metrics && Object.keys(item.metrics as Record<string, unknown>).some((k) => (item.metrics as Record<string,unknown>)[k]) && (
          <div className="bg-[#F5F1E8]/[0.04] border border-[#F5F1E8]/10 rounded-2xl p-6 mb-10">
            <p className="text-xs text-[#F5F1E8]/40 uppercase tracking-wider font-semibold mb-4">Results</p>
            <div className="flex flex-wrap gap-8">
              {Object.entries(item.metrics as Record<string, unknown>).map(([k, v]) =>
                v ? (
                  <div key={k}>
                    <p className="font-serif font-bold text-2xl text-[#FF6B35]">{v as string}</p>
                    <p className="text-[#F5F1E8]/40 text-xs mt-0.5 capitalize">{k}</p>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {item.description && (
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-3">Overview</h2>
            <p className="text-[#F5F1E8]/60 leading-relaxed">{item.description}</p>
          </div>
        )}

        {/* Full write-up */}
        {item.fullWriteup && (
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-3">The campaign</h2>
            <div className="text-[#F5F1E8]/60 leading-relaxed whitespace-pre-wrap">{item.fullWriteup}</div>
          </div>
        )}

        {/* Results summary */}
        {item.resultsSummary && (
          <div className="bg-[#C4622D]/10 border border-[#C4622D]/20 rounded-2xl p-6">
            <h2 className="font-serif text-xl font-bold text-[#FF6B35] mb-3">Results</h2>
            <p className="text-[#F5F1E8]/70 leading-relaxed whitespace-pre-wrap">{item.resultsSummary}</p>
          </div>
        )}

        {item.externalLink && (
          <div className="mt-8">
            <a
              href={item.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm bg-[#FF6B35] hover:bg-[#C4622D] text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              View live →
            </a>
          </div>
        )}
      </div>
      <LandingFooter />
    </main>
  );
}
