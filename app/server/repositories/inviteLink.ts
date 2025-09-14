import { PrismaClient } from "@prisma/client";

type createInviteLinkType = {
  token: string;
  companyId: string;
  expiresAt: Date;
};

export const getInviteLinkByToken = async (db: PrismaClient, token: string) => {
  try {
    const inviteLink = await db.inviteLink.findUnique({
      where: { token },
    });

    return inviteLink;
  } catch (error) {
    console.error("Repository Error getInviteLinkByToken: ", error);
    throw error;
  }
};

export const deleteInviteLinkByToken = async (
  db: PrismaClient,
  token: string
) => {
  try {
    await db.inviteLink.delete({
      where: { token },
    });
  } catch (error) {
    console.error("Repository Error deleteInviteLinkByToken: ", error);
    throw error;
  }
};

export const createInviteLink = async (
  db: PrismaClient,
  { token, companyId, expiresAt }: createInviteLinkType
) => {
  try {
    const inviteLink = await db.inviteLink.create({
      data: {
        token,
        companyId,
        expiresAt,
      },
    });

    return inviteLink;
  } catch (error) {
    console.error("Repository Error createInviteLink: ", error);
    throw error;
  }
};
