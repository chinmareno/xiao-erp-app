import { CompanyRole, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { getCompanyById } from "~/server/repositories/company";
import {
  createCompanyMember,
  getCompanyMemberByUserIdAndCompanyId,
} from "~/server/repositories/companyMember";
import {
  deleteInviteLinkByToken,
  getInviteLinkByToken,
} from "../repositories/inviteLink";
import { serviceErrorLogger } from "~/lib/logger/serviceErrorLogger";

type joinCompanyByCompanyIdType = {
  userId: string;
  companyId: string;
  role: CompanyRole;
};

type joinCompanyByInviteLinkType = {
  token: string;
  userId: string;
  isSuperAdmin: boolean;
};

type findCompanyMemberByUserIdAndCompanyIdType = {
  userId: string;
  companyId: string;
};

export const joinCompanyByCompanyId = async (
  db: PrismaClient,
  { userId, companyId, role }: joinCompanyByCompanyIdType
) => {
  const company = await getCompanyById(db, companyId);
  if (!company) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Company not found",
    });
  }

  const isAlreadyJoined = await getCompanyMemberByUserIdAndCompanyId(db, {
    userId,
    companyId,
  });
  if (isAlreadyJoined) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "You are already a member of this company",
    });
  }

  await createCompanyMember(db, { companyId, userId, role });
};

export const joinCompanyByInviteLink = async (
  db: PrismaClient,
  { token, userId, isSuperAdmin }: joinCompanyByInviteLinkType
) => {
  const inviteLink = await getInviteLinkByToken(db, token);
  if (inviteLink === null) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Invite link expired",
    });
  }
  if (inviteLink.expiresAt < new Date()) {
    await deleteInviteLinkByToken(db, token);
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Invite link expired",
    });
  }

  const isAlreadyJoined = await getCompanyMemberByUserIdAndCompanyId(db, {
    userId,
    companyId: inviteLink.companyId,
  });
  if (isAlreadyJoined) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "You are already a member of this company",
    });
  }

  await createCompanyMember(db, {
    userId,
    companyId: inviteLink.companyId,
    role: isSuperAdmin ? "ADMIN" : "EMPLOYEE",
    permissions: inviteLink.permissions,
  });
};

export const findCompanyMemberByUserIdAndCompanyId = async (
  db: PrismaClient,
  { userId, companyId }: findCompanyMemberByUserIdAndCompanyIdType
) => {
  const memberInfo = await getCompanyMemberByUserIdAndCompanyId(db, {
    userId,
    companyId,
  });
  if (!memberInfo) {
    serviceErrorLogger({
      method: "findCompanyMemberByUserIdAndCompanyId",
      error: "memberInfo not found but user can pass the tRPC middleware",
      logType: "warn",
    });
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Member with userId: ${userId} not found in company with id ${companyId} `,
    });
  }

  if (memberInfo.role === "OWNER" || memberInfo.role === "ADMIN") {
    const company = await getCompanyById(db, companyId);
    if (!company) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
      });
    }
    const memberInfoWithFullPermissions = {
      ...memberInfo,
      permissions: company.modules,
    };

    return memberInfoWithFullPermissions;
  }

  return memberInfo;
};
