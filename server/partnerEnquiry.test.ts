import { describe, expect, it } from "vitest";
import { partnerEnquiryFiltersSchema, partnerEnquirySchema, partnerEnquiryStatusUpdateSchema } from "./partnerEnquiry";

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

  it("accepts stable dashboard filters and valid status updates", () => {
    expect(partnerEnquiryFiltersSchema.parse({ search: "  Plateau  ", status: "reviewing" })).toEqual({
      search: "Plateau",
      status: "reviewing",
    });
    expect(partnerEnquiryStatusUpdateSchema.safeParse({ id: 4, status: "closed" }).success).toBe(true);
    expect(partnerEnquiryStatusUpdateSchema.safeParse({ id: 0, status: "archived" }).success).toBe(false);
  });
});
