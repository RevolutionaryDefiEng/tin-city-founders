import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const importMocks = vi.hoisted(() => ({
  latestDirectoryImportSummary: vi.fn(),
  refreshDirectoryFromCsv: vi.fn(),
}));

vi.mock("./directoryImport", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./directoryImport")>()),
  ...importMocks,
}));

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

function createVisitorContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const csvInput = {
  directory: { name: "directory.csv", content: "header\nvalue" },
  mixer: { name: "mixer.csv", content: "header\nvalue" },
  giveAndGrow: { name: "give-grow.csv", content: "header\nvalue" },
};

describe("admin directory import procedures", () => {
  it("returns the latest protected import summary", async () => {
    const latest = { publicFounderCount: 31, sourceRowCount: 99 };
    importMocks.latestDirectoryImportSummary.mockResolvedValueOnce(latest);
    const caller = appRouter.createCaller(createAdminContext());

    await expect(caller.admin.directoryImports.latest()).resolves.toEqual(latest);
  });

  it("only accepts the validated three-file payload and records the admin actor", async () => {
    const refreshed = { publicFounderCount: 31, uniqueCommunityRecords: 92 };
    importMocks.refreshDirectoryFromCsv.mockResolvedValueOnce(refreshed);
    const caller = appRouter.createCaller(createAdminContext());

    await expect(caller.admin.directoryImports.refresh(csvInput)).resolves.toEqual(refreshed);
    expect(importMocks.refreshDirectoryFromCsv).toHaveBeenCalledWith(csvInput, "Admin User");
  });

  it("rejects directory import access without an administrator or Partner Team session", async () => {
    const caller = appRouter.createCaller(createVisitorContext());

    await expect(caller.admin.directoryImports.latest()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
