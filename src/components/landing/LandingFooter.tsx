import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="bg-[#0E0E10] border-t border-[#F5F1E8]/[0.06] py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start justify-between gap-8">
        <div>
          <p className="font-serif font-bold text-lg text-[#F5F1E8]">Plix</p>
          <p className="text-[#F5F1E8]/40 text-sm mt-1">Creative agency × Influencer network</p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#F5F1E8]/50">
          <Link href="/for-brands" className="hover:text-[#FF6B35] transition-colors">For Brands</Link>
          <Link href="/for-influencers" className="hover:text-[#FF6B35] transition-colors">For Creators</Link>
          <Link href="/work" className="hover:text-[#FF6B35] transition-colors">Work</Link>
          <Link href="/dashboard" className="hover:text-[#FF6B35] transition-colors">Dashboard</Link>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-[#F5F1E8]/[0.06] flex items-center justify-between">
        <p className="text-[#F5F1E8]/20 text-xs">© {new Date().getFullYear()} Plix Agency. All rights reserved.</p>
      </div>
    </footer>
  );
}
