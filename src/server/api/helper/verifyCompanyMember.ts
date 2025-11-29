import { DefaultArgs } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import type { db } from "../../db/index";

type Params = {
  db: typeof db;
  companyId: string;
  userId: string;
};
export const verifyCompanyMember = async ({
  db,
  companyId,
  userId,
}: Params) => {
  const companyMember = await db.companyMember.findUnique({
    where: {
      userId_companyId: {
        companyId: companyId,
        userId,
      },
    },
    select: { permissions: true, role: true },
  });
  if (!companyMember) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not a member of this company",
    });
  }

  return companyMember;
};
