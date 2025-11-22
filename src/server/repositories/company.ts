import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { DBClientType } from "~/types/DBClientType";

type CreateCompanyType = {
  name: string;
  address: string;
  industry: string;
  desc?: string;
  userId: string;
};

export const createCompany = async (
  db: DBClientType,
  { name, address, industry, desc, userId }: CreateCompanyType
) => {
  try {
    const company = await db.company.create({
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
    });

    return company;
  } catch (error) {
    repositoryErrorLogger({ method: "createCompany", error });
    throw error;
  }
};

export const getAllCompanies = async (db: DBClientType) => {
  try {
    const companies = await db.company.findMany();

    return companies;
  } catch (error) {
    repositoryErrorLogger({ method: "getAllCompanies", error });
    throw error;
  }
};
export const getCompaniesByUserId = async (
  db: DBClientType,
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
    repositoryErrorLogger({ method: "getCompaniesByUserId", error });
    throw error;
  }
};

export const getCompanyById = async (db: DBClientType, companyId: string) => {
  try {
    const companies = await db.company.findUnique({
      where: {
        id: companyId,
      },
    });

    return companies;
  } catch (error) {
    repositoryErrorLogger({ method: "getCompanyById", error });
    throw error;
  }
};
