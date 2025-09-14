import { PrismaClient } from "@prisma/client";

type createCompanyType = {
  name: string;
  address: string;
  industry: string;
  desc?: string;
  userId: string;
};

export const createCompany = async (
  db: PrismaClient,
  { name, address, industry, desc, userId }: createCompanyType
) => {
  try {
    const { id: companyId } = await db.company.create({
      data: {
        name,
        address,
        industry,
        desc,
        companyMember: {
          create: {
            userId,
            role: "OWNER",
          },
        },
        poNumberFormat: { create: { prefix: "PO" } },
      },
      select: { id: true },
    });

    return companyId;
  } catch (error) {
    throw new Error("Repository Error createCompany: ", { cause: error });
  }
};

export const getAllCompanies = async (db: PrismaClient) => {
  try {
    const companies = await db.company.findMany();

    return companies;
  } catch (error) {
    console.error("Repository Error getAllCompanies: ", error);
    throw error;
  }
};
export const getCompaniesByUserId = async (
  db: PrismaClient,
  userId: string
) => {
  try {
    const companies = await db.company.findMany({
      where: {
        companyMember: {
          some: {
            userId,
          },
        },
      },
    });

    return companies;
  } catch (error) {
    console.error("Repository Error getCompaniesByUserId: ", error);
    throw error;
  }
};

export const getCompanyById = async (db: PrismaClient, companyId: string) => {
  try {
    const companies = await db.company.findUnique({
      where: {
        id: companyId,
      },
    });

    return companies;
  } catch (error) {
    console.error("Repository Error getCompanyById: ", error);
    throw error;
  }
};
