import { requireAdmin } from "@/lib/require-admin";
import { client } from "@/lib/prisma";
import Link from "next/link";
import AgencyBrandRequestsClient from "./_components/AgencyBrandRequestsClient";

export const metadata = { title: "Brand Requests | Agency" };

export default async function AgencyBrandRequestsPage() {
  await requireAdmin();

  const requests = await client.brandRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { campaigns: { select: { id: true, title: true, status: true } } },
  });

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brand Requests</h1>
        <span className="text-sm text-muted-foreground">{requests.length} total</span>
      </div>
      <AgencyBrandRequestsClient initialRequests={requests as any} />
    </div>
  );
}
