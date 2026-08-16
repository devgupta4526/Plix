import { z } from "zod";

export const BrandRequestSchema = z.object({
  // Step 1 – Goals
  campaignGoals: z.string().min(1, "Please describe your campaign goals"),
  deliverables: z.array(z.string()).min(1, "Select at least one deliverable"),
  // Step 2 – Budget & Timeline
  budgetRange: z.string().min(1, "Please select a budget range"),
  timeline: z.string().min(1, "Please provide a timeline"),
  // Step 3 – Audience & Niche
  targetAudience: z.string().optional(),
  nicheNeeded: z.array(z.string()).min(1, "Select at least one niche"),
  industry: z.string().optional(),
  // Step 4 – Contact
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Valid email required"),
  contactPhone: z.string().optional(),
});

export type BrandRequestInput = z.infer<typeof BrandRequestSchema>;
