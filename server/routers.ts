import { COOKIE_NAME } from "@shared/const";
import { createPartnerEnquiry, getLiveDirectoryStats, getPartnerEnquirySummary, listPartnerEnquiries, updatePartnerEnquiryStatus } from "./db";
import { createDashboardSession, DASHBOARD_SESSION_COOKIE, dashboardLoginSchema, dashboardSessionMaxAgeMs, hasDashboardSession, isValidDashboardCredential } from "./dashboardAuth";
import { directoryCsvRefreshSchema, latestDirectoryImportSummary, refreshDirectoryFromCsv } from "./directoryImport";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { partnerEnquiryFiltersSchema, partnerEnquirySchema, partnerEnquiryStatusUpdateSchema } from "./partnerEnquiry";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  partnerships: router({
    submitEnquiry: publicProcedure.input(partnerEnquirySchema).mutation(async ({ input }) => {
      await createPartnerEnquiry({
        ...input,
        message: input.message ?? null,
      });
      return { success: true } as const;
    }),
  }),
  directory: router({
    stats: publicProcedure.query(() => getLiveDirectoryStats()),
  }),
  dashboard: router({
    session: publicProcedure.query(async ({ ctx }) => ({
      authenticated: await hasDashboardSession(ctx.req.headers.cookie),
    })),
    login: publicProcedure.input(dashboardLoginSchema).mutation(async ({ ctx, input }) => {
      if (!isValidDashboardCredential(input.username, input.password)) {
        return { success: false } as const;
      }
      const token = await createDashboardSession();
      ctx.res.cookie(DASHBOARD_SESSION_COOKIE, token, {
        ...getSessionCookieOptions(ctx.req),
        maxAge: dashboardSessionMaxAgeMs,
      });
      return { success: true } as const;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(DASHBOARD_SESSION_COOKIE, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  admin: router({
    directoryImports: router({
      latest: adminProcedure.query(() => latestDirectoryImportSummary()),
      refresh: adminProcedure.input(directoryCsvRefreshSchema).mutation(({ ctx, input }) =>
        refreshDirectoryFromCsv(input, ctx.user?.name ?? ctx.user?.email ?? "Partner Team"),
      ),
    }),
    partnerEnquiries: router({
      list: adminProcedure.input(partnerEnquiryFiltersSchema).query(({ input }) => listPartnerEnquiries(input)),
      summary: adminProcedure.query(() => getPartnerEnquirySummary()),
      updateStatus: adminProcedure.input(partnerEnquiryStatusUpdateSchema).mutation(({ input }) =>
        updatePartnerEnquiryStatus(input.id, input.status),
      ),
    }),
  }),
});

export type AppRouter = typeof appRouter;
