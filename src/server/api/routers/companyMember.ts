import { z } from "zod";
import {
  companyMemberProcedure,
  createTRPCRouter,
  protectedProcedure,
  superAdminProcedure,
} from "../trpc";
import {
  findCompanyMemberByUserIdAndCompanyId,
  joinCompanyByCompanyId,
  joinCompanyByInviteLink,
} from "~/server/services/companyMember";

export const companyMemberRouter = createTRPCRouter({
  joinByCompanyId: superAdminProcedure
    .input(z.object({ companyId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const { companyId } = input;
      const userId = ctx.session.user.id;

      await joinCompanyByCompanyId(ctx.db, {
        userId,
        companyId,
        role: "ADMIN",
      });
    }),

  getByCompanyId: companyMemberProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const companyId = ctx.companyId;

    const userCompanyMemberInfo = await findCompanyMemberByUserIdAndCompanyId(
      ctx.db,
      { userId, companyId }
    );

    return userCompanyMemberInfo;
  }),

  joinByInviteLink: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const { token } = input;
      const userId = ctx.session.user.id;
      const isSuperAdmin = ctx.role === "SUPERADMIN";

      await joinCompanyByInviteLink(ctx.db, {
        token,
        userId,
        isSuperAdmin,
      });
    }),
});
