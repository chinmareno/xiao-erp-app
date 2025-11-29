import { createTRPCRouter } from "../trpc";
import { companyRouter } from "./company";
import { companyMemberRouter } from "./companyMember";
import { cronRouter } from "./cron";
import { inventoryRouter } from "./inventory";
import { purchasingRouter } from "./purchasing";
import { testRouter } from "./test";

export const appRouter = createTRPCRouter({
  company: companyRouter,
  companyMember: companyMemberRouter,
  purchasing: purchasingRouter,
  inventory: inventoryRouter,
  cron: cronRouter,
  test: testRouter,
});

export type AppRouter = typeof appRouter;
