import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  createPartnerEnquiry: vi.fn(),
  getPartnerEnquirySummary: vi.fn(),
  listPartnerEnquiries: vi.fn(),
  updatePartnerEnquiryStatus: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.org",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin partner enquiry procedures", () => {
  it("passes a filter query through to the protected enquiry list", async () => {
    const enquiries = [{ id: 7, organizationName: "Plateau Partners", status: "new" }];
    dbMocks.listPartnerEnquiries.mockResolvedValueOnce(enquiries);
    const caller = appRouter.createCaller(createAdminContext());

    await expect(caller.admin.partnerEnquiries.list({ search: "Plateau", status: "new" })).resolves.toEqual(enquiries);
    expect(dbMocks.listPartnerEnquiries).toHaveBeenCalledWith({ search: "Plateau", status: "new" });
  });

  it("returns summary counts and persists a selected follow-up status", async () => {
    const summary = [{ status: "new", count: 2 }];
    dbMocks.getPartnerEnquirySummary.mockResolvedValueOnce(summary);
    const caller = appRouter.createCaller(createAdminContext());

    await expect(caller.admin.partnerEnquiries.summary()).resolves.toEqual(summary);
    await expect(caller.admin.partnerEnquiries.updateStatus({ id: 7, status: "reviewing" })).resolves.toBeUndefined();
    expect(dbMocks.updatePartnerEnquiryStatus).toHaveBeenCalledWith(7, "reviewing");
  });
});
