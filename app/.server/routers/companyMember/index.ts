import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  superAdminProcedure,
} from "~/.server/trpc.server";

export const companyMemberRouter = createTRPCRouter({
  joinByCompanyId: superAdminProcedure
    .input(z.object({ companyId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const { companyId } = input;

      const company = await ctx.db.company.findUnique({
        where: { id: companyId },
        select: { modules: true },
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
        select: { id: true },
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
          permissions: company.modules,
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

  joinByInviteLink: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const { token } = input;

      const inviteLink = await ctx.db.inviteLink.findUnique({
        where: { token },
        select: { companyId: true, expiresAt: true },
      });

      if (inviteLink === null)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite link expired",
        });

      if (inviteLink.expiresAt < new Date()) {
        await ctx.db.inviteLink.delete({
          where: { token },
        });
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite link expired",
        });
      }

      const isAlrJoinedCompany = await ctx.db.company.findFirst({
        where: {
          id: inviteLink.companyId,
          companyMember: {
            some: { userId: ctx.session.user.id },
          },
        },
        select: { id: true },
      });

      if (isAlrJoinedCompany) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You are already a member of this company",
        });
      }

      await ctx.db.company.update({
        where: { id: inviteLink.companyId },
        data: {
          companyMember: {
            create: {
              userId: ctx.session.user.id,
            },
          },
        },
      });
    }),
});
