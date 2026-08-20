import { COOKIE_NAME } from "@shared/const";
import { createPartnerEnquiry, getPartnerEnquirySummary, listPartnerEnquiries, updatePartnerEnquiryStatus } from "./db";
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
  admin: router({
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
