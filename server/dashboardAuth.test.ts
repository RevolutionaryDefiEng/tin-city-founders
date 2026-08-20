import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { DASHBOARD_SESSION_COOKIE, hasDashboardSession } from "./dashboardAuth";
import type { TrpcContext } from "./_core/context";

type CookieSet = { name: string; value: string; options: Record<string, unknown> };

function createDashboardContext() {
  const cookies: CookieSet[] = [];
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => cookies.push({ name, value, options }),
      clearCookie: () => undefined,
    } as TrpcContext["res"],
  };
  return { ctx, cookies };
}

describe("local dashboard credentials", () => {
  it("creates a signed dashboard session for the configured local credentials", async () => {
    const username = process.env.TCF_PARTNER_DASHBOARD_USERNAME;
    const password = process.env.TCF_PARTNER_DASHBOARD_PASSWORD;
    expect(username).toBeTruthy();
    expect(password).toBeTruthy();

    const { ctx, cookies } = createDashboardContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.dashboard.login({ username: username!, password: password! })).resolves.toEqual({ success: true });
    expect(cookies[0]?.name).toBe(DASHBOARD_SESSION_COOKIE);
    await expect(hasDashboardSession(`${DASHBOARD_SESSION_COOKIE}=${cookies[0]?.value}`)).resolves.toBe(true);
  });

  it("rejects an incorrect local dashboard password", async () => {
    const { ctx } = createDashboardContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.dashboard.login({ username: process.env.TCF_PARTNER_DASHBOARD_USERNAME!, password: "not-the-configured-password" })).rejects.toThrow("Invalid dashboard credentials");
  });
});
