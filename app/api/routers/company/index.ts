import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  superAdminProcedure,
} from "~/api/trpc.server";

export const companyRouter = createTRPCRouter({
  create: superAdminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Company name is required"),
        address: z.string().min(1, "Address is required"),
        industry: z.string().min(1, "Industry is required"),
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
          companyMember: {
            create: {
              userId: ctx.session.user.id,
              role: "OWNER",
            },
          },
          poNumberFormat: { create: { prefix: "PO" } },
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

  getByCompanyId: protectedProcedure.query(async ({ ctx }) => {
    const companyData = await ctx.db.company.findUnique({
      where: {
        id: ctx.companyId,
      },
    });

    return companyData;
  }),
});
