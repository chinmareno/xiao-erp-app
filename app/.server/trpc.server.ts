import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "../lib/auth/auth.server";
import { db } from "~/lib/db.server";
import { ZodError } from "zod";

export async function createTRPCContext(req: Request, companyId?: string) {
  const session = await auth.api.getSession({ headers: req.headers });
  const role: "SUPERADMIN" | "USER" =
    session?.user.emailVerified &&
    session?.user.email === process.env.SUPER_ADMIN_EMAIL
      ? "SUPERADMIN"
      : "USER";

  return {
    db,
    session: session,
    role,
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
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

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
  const companyId = ctx.companyId;

  if (!ctx.session || !companyId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized",
    });
  }

  const isMember = await ctx.db.companyMember.findUnique({
    where: {
      userId_companyId: {
        userId: ctx.session.user.id,
        companyId,
      },
    },
    select: { id: true },
  });

  if (!isMember) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not a member of this company",
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

  if (ctx.role !== "SUPERADMIN") {
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
