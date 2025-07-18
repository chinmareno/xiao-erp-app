import { createTRPCRouter } from "../trpc.server";
import { companyRouter } from "./company";
import { purchasingRouter } from "./purchasing";

export const appRouter = createTRPCRouter({
  company: companyRouter,
  purchasing: purchasingRouter,
});
