import { CompanyRole } from "@prisma/client";
import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { DBClientType } from "~/types/DBClientType";

type getCompanyMemberByUserIdAndCompanyIdType = {
  userId: string;
  companyId: string;
};

type CreateCompanyMemberType = {
  userId: string;
  companyId: string;
  role: CompanyRole;
};

export const getCompanyMemberByUserIdAndCompanyId = async (
  db: DBClientType,
  { userId, companyId }: getCompanyMemberByUserIdAndCompanyIdType
) => {
  try {
    const companyMember = await db.companyMember.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });

    return companyMember;
  } catch (error) {
    repositoryErrorLogger({
      method: "getCompanyMemberByUserIdAndCompanyId",
      error,
    });
    throw error;
  }
};

export const createCompanyMember = async (
  db: DBClientType,
  { userId, companyId, role }: CreateCompanyMemberType
) => {
  try {
    await db.companyMember.create({
      data: {
        userId,
        companyId,
        role,
      },
    });
  } catch (error) {
    repositoryErrorLogger({ method: "createCompanyMember", error });
    throw error;
  }
};
