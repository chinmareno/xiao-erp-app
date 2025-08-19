import { createTRPCRouter } from "../trpc.server";
import { companyRouter } from "./company";
import { companyMemberRouter } from "./companyMember";
import { inventoryRouter } from "./inventory";
import { inviteLinkRouter } from "./inviteLink";
import { purchasingRouter } from "./purchasing";

export const appRouter = createTRPCRouter({
  company: companyRouter,
  companyMember: companyMemberRouter,
  purchasing: purchasingRouter,
  inviteLink: inviteLinkRouter,
  inventory: inventoryRouter,
});
