import { z } from "zod";

export const PortfolioItemSchema = z.object({
  title: z.string().min(1),
  clientName: z.string().min(1),
  category: z.enum(["AD", "SOCIAL_POST", "CAMPAIGN", "REEL", "BRAND_PROFILE"]),
  mediaUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  description: z.string().optional(),
  externalLink: z.string().url().optional(),
  metrics: z
    .object({ reach: z.string().optional(), engagement: z.string().optional() })
    .optional(),
  featured: z.boolean().optional(),
  fullWriteup: z.string().optional(),
  resultsSummary: z.string().optional(),
});

export type PortfolioItemInput = z.infer<typeof PortfolioItemSchema>;
