import { createTRPCRouter } from "../trpc.server";
import { purchasingRouter } from "./purchasing";

export const appRouter = createTRPCRouter({
  purchasing: purchasingRouter,
});
