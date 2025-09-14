import { createTRPCRouter } from "../trpc.server";
import { companyRouter } from "./company";
import { companyMemberRouter } from "./companyMember";
import { inventoryRouter } from "./inventory";
import { purchasingRouter } from "./purchasing";

export const appRouter = createTRPCRouter({
  company: companyRouter,
  companyMember: companyMemberRouter,
  purchasing: purchasingRouter,
  inventory: inventoryRouter,
});
