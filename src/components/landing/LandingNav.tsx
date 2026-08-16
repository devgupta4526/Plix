import Link from "next/link";

export default function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 bg-[#0E0E10]/80 backdrop-blur-md border-b border-[#F5F1E8]/[0.06]">
      <Link href="/" className="font-serif font-bold text-xl text-[#F5F1E8]">
        Plix
      </Link>
      <div className="hidden sm:flex items-center gap-7 text-sm text-[#F5F1E8]/60">
        <Link href="/for-brands" className="hover:text-[#FF6B35] transition-colors">For Brands</Link>
        <Link href="/for-influencers" className="hover:text-[#FF6B35] transition-colors">For Creators</Link>
        <Link href="/work" className="hover:text-[#FF6B35] transition-colors">Work</Link>
      </div>
      <Link
        href="/for-brands"
        className="text-sm bg-[#FF6B35] hover:bg-[#C4622D] text-white font-semibold px-5 py-2 rounded-full transition-colors"
      >
        Work with us
      </Link>
    </nav>
  );
}
