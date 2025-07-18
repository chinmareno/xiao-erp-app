import { z } from "zod";
import { createTRPCRouter, superAdminProcedure } from "~/.server/trpc.server";

export const companyRouter = createTRPCRouter({
  create: superAdminProcedure.input(z.object({})).mutation(() => {}),
});
