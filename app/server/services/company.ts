import { CompanyRole, PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import {
  createCompany,
  getAllCompanies,
  getCompaniesByUserId,
  getCompanyById,
} from "~/server/repositories/company";
import { createInviteLink } from "../repositories/inviteLink";

export type makeCompanyType = {
  name: string;
  address: string;
  industry: string;
  desc?: string;
  userId: string;
  role?: CompanyRole;
};

export const makeCompany = async (
  db: PrismaClient,
  { name, address, industry, desc, userId }: makeCompanyType
) => {
  try {
    const companyId = await createCompany(db, {
      name,
      address,
      industry,
      desc,
      userId,
    });

    return companyId;
  } catch (error) {
    console.error("Error creating company:", error);
    throw error;
  }
};

export const findCompaniesByUserId = async (
  db: PrismaClient,
  userId: string
) => {
  const companies = await getCompaniesByUserId(db, userId);

  return companies;
};

export const findCompanyByCompanyId = async (
  db: PrismaClient,
  companyId: string
) => {
  const company = await getCompanyById(db, companyId);

  return company;
};

export const findAllCompanies = async (db: PrismaClient) => {
  const companies = await getAllCompanies(db);

  return companies;
};

export const generateInviteLink = async (
  db: PrismaClient,
  { companyId }: { companyId: string }
) => {
  const token = nanoid(24);
  const EXPIRED_MINUTE = 15;
  const expiresAt = new Date(Date.now() + EXPIRED_MINUTE * 60 * 1000);

  const inviteLink = await createInviteLink(db, {
    token,
    companyId,
    expiresAt,
  });
  const clickableLink = `${process.env.APP_URL}/invite/${inviteLink.token}`;

  return clickableLink;
};
