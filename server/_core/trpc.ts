import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { hasDashboardSession } from "../dashboardAuth";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    const localDashboardAccess = await hasDashboardSession(ctx.req.headers.cookie);

    if ((!ctx.user || ctx.user.role !== 'admin') && !localDashboardAccess) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user ?? {
          id: 0,
          openId: "local-dashboard",
          name: "Partner Team",
          email: null,
          loginMethod: "local-dashboard",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
      },
    });
  }),
);
