import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  superAdminProcedure,
} from "~/api/trpc.server";

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
          role: "ADMIN",
        },
      });
    }),

  getByCompanyId: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.companyId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Company not found",
      });
    }

    const userCompanyMember = await ctx.db.companyMember.findUnique({
      where: {
        userId_companyId: {
          userId: ctx.session.user.id,
          companyId: ctx.companyId,
        },
      },
      include: { company: { select: { modules: true } } },
    });
    if (userCompanyMember) {
      const companyModules = userCompanyMember?.company?.modules;
      if (
        userCompanyMember?.role === "OWNER" ||
        userCompanyMember?.role === "ADMIN"
      ) {
        return { ...userCompanyMember, permissions: companyModules };
      } else return { ...userCompanyMember };
    }
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

      const isAdmin = ctx.role === "SUPERADMIN";

      await ctx.db.company.update({
        where: { id: inviteLink.companyId },
        data: {
          companyMember: {
            create: {
              userId: ctx.session.user.id,
              role: isAdmin ? "ADMIN" : "EMPLOYEE",
            },
          },
        },
      });
    }),
});
