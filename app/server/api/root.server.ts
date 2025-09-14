import { appRouter } from "./routers/index.server";
import { createCallerFactory, createTRPCContext } from "./trpc.server";
import { ZodError } from "zod";

export const createCaller = createCallerFactory(appRouter);

export const createCallerWithContext = async (
  req: Request,
  companyId?: string
) => {
  const createContext = await createTRPCContext(req, companyId);

  return createCaller(createContext, {
    onError: ({ ctx, error }) => {
      if (error.code === "BAD_REQUEST" && error.cause instanceof ZodError) {
        console.warn(
          `Client Zod Validation bypass detected (userName:${
            ctx?.session?.user.name
          } | userId:${ctx?.session?.user.id} | userEmail${
            ctx?.session?.user.email
          } | userCompany:${ctx?.companyId ?? "N/A"})`
        );
      }
    },
  });
};
