"use server";

import { client } from "@/lib/prisma";
import { onCurrentUser } from "../user";
import { requireAdmin } from "@/lib/require-admin";
import { InfluencerProfileSchema, type InfluencerProfileInput } from "./schema";
export type { InfluencerProfileInput } from "./schema";

// ─── Influencer Profile actions (for creators) ───────────────────────────────

export async function getOrCreateInfluencerProfile() {
  const clerkUser = await onCurrentUser();
  const dbUser = await client.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: { influencerProfile: { include: { campaignMatches: { include: { Campaign: true } } } } },
  });
  if (!dbUser) return { status: 404, error: "User not found" };

  if (dbUser.influencerProfile) {
    return { status: 200, data: dbUser.influencerProfile };
  }

  // Create blank profile
  const profile = await client.influencerProfile.create({
    data: {
      userId: dbUser.id,
      niche: [],
      platforms: [],
      status: "PENDING_REVIEW",
    },
    include: { campaignMatches: { include: { Campaign: true } } },
  });
  return { status: 201, data: profile };
}

export async function updateInfluencerProfile(data: InfluencerProfileInput) {
  const parsed = InfluencerProfileSchema.safeParse(data);
  if (!parsed.success) {
    return { status: 400, error: parsed.error.flatten().fieldErrors };
  }

  const clerkUser = await onCurrentUser();
  const dbUser = await client.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { id: true },
  });
  if (!dbUser) return { status: 404, error: "User not found" };

  const profile = await client.influencerProfile.upsert({
    where: { userId: dbUser.id },
    create: {
      userId: dbUser.id,
      ...parsed.data,
      platforms: parsed.data.platforms as any,
      rateCard: parsed.data.rateCard as any,
    },
    update: {
      ...parsed.data,
      platforms: parsed.data.platforms as any,
      rateCard: parsed.data.rateCard as any,
    },
  });

  return { status: 200, data: profile };
}

// ─── Campaign proposal responses (creator accept/decline) ────────────────────

export async function respondToCampaignProposal(
  campaignInfluencerId: string,
  response: "ACCEPTED" | "DECLINED"
) {
  const clerkUser = await onCurrentUser();
  const dbUser = await client.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { influencerProfile: { select: { id: true } } },
  });
  if (!dbUser?.influencerProfile) return { status: 403, error: "No influencer profile" };

  const match = await client.campaignInfluencer.findUnique({
    where: { id: campaignInfluencerId },
    select: { influencerProfileId: true },
  });
  if (match?.influencerProfileId !== dbUser.influencerProfile.id) {
    return { status: 403, error: "Not authorized" };
  }

  const updated = await client.campaignInfluencer.update({
    where: { id: campaignInfluencerId },
    data: { status: response },
  });
  return { status: 200, data: updated };
}

// ─── Agency admin actions ─────────────────────────────────────────────────────

export async function listBrandRequests(statusFilter?: string) {
  await requireAdmin();
  const where = statusFilter ? { status: statusFilter as any } : undefined;
  const requests = await client.brandRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { campaigns: true },
  });
  return { status: 200, data: requests };
}

export async function updateBrandRequestStatus(
  id: string,
  status: string,
  internalNotes?: string
) {
  await requireAdmin();
  const updated = await client.brandRequest.update({
    where: { id },
    data: { status: status as any, ...(internalNotes !== undefined && { internalNotes }) },
  });
  return { status: 200, data: updated };
}

export async function listInfluencerProfiles(filters?: { status?: string; niche?: string }) {
  await requireAdmin();
  const profiles = await client.influencerProfile.findMany({
    where: {
      ...(filters?.status && { status: filters.status as any }),
      ...(filters?.niche && { niche: { has: filters.niche } }),
    },
    include: { User: { select: { email: true, firstname: true, lastname: true } } },
    orderBy: { createdAt: "desc" },
  });
  return { status: 200, data: profiles };
}

export async function approveInfluencerProfile(id: string) {
  await requireAdmin();
  const profile = await client.influencerProfile.update({
    where: { id },
    data: { status: "APPROVED" },
  });
  return { status: 200, data: profile };
}

export async function createCampaign(brandRequestId: string, title: string, briefSummary?: string) {
  await requireAdmin();
  const campaign = await client.campaign.create({
    data: { brandRequestId, title, briefSummary },
  });
  return { status: 200, data: campaign };
}

export async function getCampaign(id: string) {
  await requireAdmin();
  const campaign = await client.campaign.findUnique({
    where: { id },
    include: {
      BrandRequest: true,
      matches: {
        include: {
          InfluencerProfile: {
            include: { User: { select: { email: true, firstname: true, lastname: true } } },
          },
        },
      },
    },
  });
  return { status: 200, data: campaign };
}

export async function proposeInfluencer(campaignId: string, influencerProfileId: string) {
  await requireAdmin();
  const match = await client.campaignInfluencer.create({
    data: { campaignId, influencerProfileId, status: "PROPOSED" },
  });
  return { status: 200, data: match };
}

export async function updateMatchStatus(
  id: string,
  status: "PROPOSED" | "ACCEPTED" | "DECLINED" | "DELIVERED" | "PAID"
) {
  await requireAdmin();
  const match = await client.campaignInfluencer.update({
    where: { id },
    data: { status, agreedRate: undefined },
  });
  return { status: 200, data: match };
}

export async function updateCampaignStatus(id: string, status: "OPEN" | "MATCHING" | "ACTIVE" | "COMPLETED") {
  await requireAdmin();
  const campaign = await client.campaign.update({ where: { id }, data: { status } });
  return { status: 200, data: campaign };
}
