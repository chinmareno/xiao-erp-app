import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  superAdminProcedure,
} from "~/.server/trpc.server";

export const companyRouter = createTRPCRouter({
  create: superAdminProcedure
    .input(
      z.object({
        name: z.string(),
        address: z.string().optional(),
        industry: z.string().optional(),
        desc: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.company.create({
        data: {
          name: input.name,
          address: input.address,
          industry: input.industry,
          desc: input.desc,
        },
      });
    }),

  getAll: superAdminProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.company.findMany();
    return data;
  }),

  getByUserId: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.company.findMany({
      where: {
        companyMember: {
          some: {
            userId: ctx.session.user.id,
          },
        },
      },
    });

    return data;
  }),
});
