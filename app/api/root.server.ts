import { appRouter } from "./routers/index.server";
import { createCallerFactory, createTRPCContext } from "./trpc.server";

const createCaller = createCallerFactory(appRouter);

export const createCallerWithContext = async (
  req: Request,
  companyId?: string
) => {
  const createContext = await createTRPCContext(req, companyId);

  return createCaller(createContext, {
    onError: (err) => {
      if (err.error.code === "INTERNAL_SERVER_ERROR")
        console.log(`Error in path ${err.path} : ${err.error.message}`);
    },
  });
};
