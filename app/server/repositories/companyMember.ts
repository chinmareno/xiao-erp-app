import { CompanyRole, PrismaClient } from "@prisma/client";

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
  db: PrismaClient,
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
    console.error(
      "Repository Error getCompanyMemberByUserIdAndCompanyId: ",
      error
    );
    throw error;
  }
};

export const createCompanyMember = async (
  db: PrismaClient,
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
    console.error("Repository Error createCompanyMember: ", error);
    throw error;
  }
};
