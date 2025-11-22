import { createTRPCRouter } from "../trpc.server";
import { companyRouter } from "./company";
import { companyMemberRouter } from "./companyMember";
import { inventoryRouter } from "./inventory";
import { purchasingRouter } from "./purchasing";
import { testRouter } from "./test";

export const appRouter = createTRPCRouter({
  company: companyRouter,
  companyMember: companyMemberRouter,
  purchasing: purchasingRouter,
  inventory: inventoryRouter,
  test: testRouter,
});
