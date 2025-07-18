import { TRPCError } from "@trpc/server";
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.company.create({
        data: {
          name: input.name,
          address: input.address,
          industry: input.industry,
        },
      });
    }),

  get: superAdminProcedure.query(async ({ ctx }) => {
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

  joinByCompanyId: protectedProcedure
    .input(z.object({ companyId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const { companyId } = input;

      const company = await ctx.db.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      const existing = await ctx.db.companyMember.findUnique({
        where: {
          userId_companyId: {
            userId: ctx.session.user.id,
            companyId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You are already a member of this company",
        });
      }
      await ctx.db.companyMember.create({
        data: {
          userId: ctx.session.user.id,
          companyId,
          role: "EMPLOYEE",
        },
      });
    }),
});
