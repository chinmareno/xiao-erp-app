import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/.server/trpc.server";

export const companyMemberRouter = createTRPCRouter({
  create: protectedProcedure
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

  getByCompanyId: protectedProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      const userCompanyMember = await ctx.db.companyMember.findUnique({
        where: {
          userId_companyId: {
            userId: ctx.session.user.id,
            companyId: input,
          },
        },
      });
      return userCompanyMember;
    }),
});
