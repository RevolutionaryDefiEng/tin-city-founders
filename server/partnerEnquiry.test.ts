import { describe, expect, it } from "vitest";
import { partnerEnquirySchema } from "./partnerEnquiry";

const validEnquiry = {
  organizationName: "Example Impact Foundation",
  contactName: "Amina Yusuf",
  contactEmail: "amina@example.org",
  organizationType: "foundation",
  intendedSupport: "programme_sponsorship",
  activationTiming: "one_to_three_months",
  message: "We would like to explore a founder capability series.",
} as const;

describe("partnerEnquirySchema", () => {
  it("accepts a complete partner enquiry", () => {
    expect(partnerEnquirySchema.parse(validEnquiry)).toEqual(validEnquiry);
  });

  it("rejects invalid contact emails and unsupported option values", () => {
    expect(partnerEnquirySchema.safeParse({ ...validEnquiry, contactEmail: "not-an-email" }).success).toBe(false);
    expect(partnerEnquirySchema.safeParse({ ...validEnquiry, intendedSupport: "unknown" }).success).toBe(false);
  });
});
