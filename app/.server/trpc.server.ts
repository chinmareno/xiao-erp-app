import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "../lib/auth.server";
import { db } from "~/lib/db.server";
import { ZodError } from "zod";

export async function createTRPCContext(opts: { req: Request }) {
  const session = await auth.api.getSession({ headers: opts.req.headers });

  return {
    db,
    session: session,
    ...opts,
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

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});
