import { requireAdmin } from "@/lib/require-admin";
import { client } from "@/lib/prisma";
import AgencyPortfolioClient from "./_components/AgencyPortfolioClient";

export const metadata = { title: "Portfolio | Agency" };

export default async function AgencyPortfolioPage() {
  await requireAdmin();

  const items = await client.portfolioItem.findMany({
    orderBy: { position: "asc" },
  });

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Portfolio / Gallery</h1>
        <span className="text-sm text-muted-foreground">{items.length} items</span>
      </div>
      <AgencyPortfolioClient initialItems={items as any} />
    </div>
  );
}
