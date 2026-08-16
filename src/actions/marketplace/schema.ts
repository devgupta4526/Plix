import { z } from "zod";

const PlatformSchema = z.object({
  platform: z.string(),
  handle: z.string(),
  followers: z.number().int().nonnegative(),
});

export const InfluencerProfileSchema = z.object({
  niche: z.array(z.string()).min(1, "Select at least one niche"),
  platforms: z.array(PlatformSchema).min(1, "Add at least one platform"),
  avgEngagementRate: z.number().min(0).max(100).optional(),
  audienceSummary: z.string().optional(),
  rateCard: z
    .object({
      reel: z.number().optional(),
      post: z.number().optional(),
      story: z.number().optional(),
    })
    .optional(),
  bio: z.string().optional(),
});

export type InfluencerProfileInput = z.infer<typeof InfluencerProfileSchema>;
