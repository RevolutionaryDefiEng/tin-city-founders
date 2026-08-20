import { z } from "zod";

export const organizationTypes = [
  "international_organization",
  "enterprise_platform",
  "impact_funder",
  "foundation",
  "other",
] as const;

export const supportOptions = [
  "programme_sponsorship",
  "strategic_collaboration",
  "tool_or_credit_access",
  "founder_visibility",
  "showcase_or_demo_day",
  "other",
] as const;

export const activationTimings = [
  "next_30_days",
  "one_to_three_months",
  "three_to_six_months",
  "exploring",
] as const;

export const partnerEnquirySchema = z.object({
  organizationName: z.string().trim().min(2).max(200),
  contactName: z.string().trim().min(2).max(160),
  contactEmail: z.string().trim().email().max(320),
  organizationType: z.enum(organizationTypes),
  intendedSupport: z.enum(supportOptions),
  activationTiming: z.enum(activationTimings),
  message: z.string().trim().max(2000).optional(),
});

export type PartnerEnquiryInput = z.infer<typeof partnerEnquirySchema>;
