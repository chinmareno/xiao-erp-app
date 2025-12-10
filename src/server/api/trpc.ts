import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { auth } from "~/lib/auth/auth.server";
import { db } from "../db";
import { verifyCompanyMember } from "./helper/verifyCompanyMember";
import superjson from "superjson";

export async function createTRPCContext(req: Request, companyId?: string) {
  const session = await auth.api.getSession({ headers: req.headers });
  const user = await db.user.findUnique({
    where: { id: session?.user.id },
    select: { role: true },
  });

  return {
    db,
    session,
    role: user?.role ?? "USER",
    req,
    companyId,
  };
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
  transformer: superjson,
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure.use(({ ctx, next }) => {
  return next({
    ctx,
  });
});

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
      role: ctx.role,
    },
  });
});

export const companyMemberProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.companyId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized",
    });
  }

  await verifyCompanyMember({
    db: ctx.db,
    companyId: ctx.companyId,
    userId: ctx.session.user.id,
  });

  return next({
    ctx: {
      session: ctx.session,
      role: ctx.role,
      companyId: ctx.companyId,
    },
  });
});

export const purchasingProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.companyId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized",
    });
  }

  const companyMember = await verifyCompanyMember({
    db: ctx.db,
    companyId: ctx.companyId,
    userId: ctx.session.user.id,
  });

  const isSuperAdmin = ctx.role === "SUPERADMIN";
  const isOwner = companyMember.role === "OWNER";

  if (
    !isSuperAdmin &&
    !isOwner &&
    !companyMember.permissions.includes("PURCHASING")
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You don't have permission to access purchasing",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
      role: ctx.role,
      companyId: ctx.companyId,
    },
  });
});

export const inventoryProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.companyId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized",
    });
  }
  const companyMember = await verifyCompanyMember({
    db: ctx.db,
    companyId: ctx.companyId,
    userId: ctx.session.user.id,
  });

  const isSuperAdmin = ctx.role === "SUPERADMIN";
  const isOwner = companyMember.role === "OWNER";

  if (
    !isSuperAdmin &&
    !isOwner &&
    !companyMember.permissions.includes("INVENTORY")
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You don't have permission to access inventory",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
      role: ctx.role,
      companyId: ctx.companyId,
    },
  });
});

export const ownerProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.companyId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }

  const companyMember = await verifyCompanyMember({
    db: ctx.db,
    companyId: ctx.companyId,
    userId: ctx.session.user.id,
  });

  if (companyMember.role !== "OWNER") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must be the owner of this company",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
      role: ctx.role,
      companyId: ctx.companyId,
    },
  });
});

export const superAdminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized",
    });
  }

  // Allow access in demo mode to automatically create and join as owner in a company
  if (!process.env.DEMO_MODE && ctx.role !== "SUPERADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not SUPERADMIN",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
      role: ctx.role,
    },
  });
});

export const cronProcedure = t.procedure.use(({ next, ctx }) => {
  console.log("Cron executed with headers:", ctx.req.headers);
  if (
    ctx.req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Only cron can access this endpoint",
    });
  }

  return next();
});
