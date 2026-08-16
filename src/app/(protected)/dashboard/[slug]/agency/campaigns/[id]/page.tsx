import { requireAdmin } from "@/lib/require-admin";
import { client } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AgencyCampaignClient from "./_components/AgencyCampaignClient";

export const metadata = { title: "Campaign | Agency" };

type Props = { params: { id: string; slug: string } };

export default async function AgencyCampaignPage({ params }: Props) {
  await requireAdmin();

  const campaign = await client.campaign.findUnique({
    where: { id: params.id },
    include: {
      BrandRequest: true,
      matches: {
        include: {
          InfluencerProfile: {
            include: {
              User: { select: { email: true, firstname: true, lastname: true } },
            },
          },
        },
      },
    },
  });

  if (!campaign) notFound();

  // Approved influencers for proposing
  const approvedInfluencers = await client.influencerProfile.findMany({
    where: { status: "APPROVED" },
    include: { User: { select: { email: true, firstname: true, lastname: true } } },
  });

  return (
    <div className="py-6 space-y-6">
      <h1 className="text-2xl font-bold">{campaign.title}</h1>
      <AgencyCampaignClient
        campaign={campaign as any}
        approvedInfluencers={approvedInfluencers as any}
        slug={params.slug}
      />
    </div>
  );
}
