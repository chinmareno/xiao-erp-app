import {
  companyMemberProcedure,
  createTRPCRouter,
  ownerProcedure,
  protectedProcedure,
  superAdminProcedure,
} from "../trpc";
import {
  findAllCompanies,
  findCompaniesByUserId,
  findCompanyByCompanyId,
  generateInviteLink,
  makeCompany,
} from "~/server/services/company";
import { z } from "zod";
import { createCompanySchema } from "~/schemas/company";

export const companyRouter = createTRPCRouter({
  create: superAdminProcedure
    .input(createCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const { name, address, industry, desc } = input;
      const userId = ctx.session.user.id;

      const companyId = await makeCompany(ctx.db, {
        name,
        address,
        industry,
        desc,
        userId,
      });

      return companyId;
    }),

  getAll: superAdminProcedure.query(async ({ ctx }) => {
    const companies = await findAllCompanies(ctx.db);

    return companies;
  }),

  getByUserId: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const companies = await findCompaniesByUserId(ctx.db, userId);

    return companies;
  }),

  getByCompanyId: companyMemberProcedure.query(async ({ ctx }) => {
    const companyId = ctx.companyId;
    const company = await findCompanyByCompanyId(ctx.db, companyId);

    return company;
  }),

  createInviteLink: ownerProcedure
    .input(
      z.object({
        companyId: z.string().min(1, "Company ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { companyId } = input;

      const inviteLink = await generateInviteLink(ctx.db, { companyId });

      return inviteLink;
    }),
});
