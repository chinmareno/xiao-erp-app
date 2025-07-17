import { appRouter } from "./routers";
import { createCallerFactory, createTRPCContext } from "./trpc.server";

const createCaller = createCallerFactory(appRouter);

export const createCallerWithContext = async (req: Request) => {
  const createContext = await createTRPCContext({ req });
  return createCaller(createContext);
};
