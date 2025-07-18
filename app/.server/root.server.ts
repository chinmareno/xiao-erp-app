import { appRouter } from "./routers";
import { createCallerFactory, createTRPCContext } from "./trpc.server";

const createCaller = createCallerFactory(appRouter);

export const createCallerWithContext = async (req: Request) => {
  const createContext = await createTRPCContext({ req });
  return createCaller(createContext, {
    onError: (err) => {
      if (err.error.code === "INTERNAL_SERVER_ERROR")
        console.log(`Error in path ${err.path} : ${err.error.message}`);
    },
  });
};
