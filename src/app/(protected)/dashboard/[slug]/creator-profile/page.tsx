import { Suspense } from "react";
import CreatorProfileClient from "@/components/landing/CreatorProfileClient";

export const metadata = {
  title: "Creator Profile | Plix",
};

export default function CreatorProfilePage() {
  return (
    <div className="py-6">
      <Suspense fallback={<div className="h-64 flex items-center justify-center"><span className="text-muted-foreground text-sm">Loading…</span></div>}>
        <CreatorProfileClient />
      </Suspense>
    </div>
  );
}
