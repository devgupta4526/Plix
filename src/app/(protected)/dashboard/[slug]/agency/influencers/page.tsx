import { requireAdmin } from "@/lib/require-admin";
import { client } from "@/lib/prisma";
import AgencyInfluencersClient from "./_components/AgencyInfluencersClient";

export const metadata = { title: "Influencers | Agency" };

export default async function AgencyInfluencersPage() {
  await requireAdmin();

  const profiles = await client.influencerProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: { User: { select: { email: true, firstname: true, lastname: true } } },
  });

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Creator Profiles</h1>
        <span className="text-sm text-muted-foreground">{profiles.length} total</span>
      </div>
      <AgencyInfluencersClient initialProfiles={profiles as any} />
    </div>
  );
}
