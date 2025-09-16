import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { DBClientType } from "~/types/DBClientType";

type createInviteLinkType = {
  token: string;
  companyId: string;
  expiresAt: Date;
};

export const getInviteLinkByToken = async (db: DBClientType, token: string) => {
  try {
    const inviteLink = await db.inviteLink.findUnique({
      where: { token },
    });

    return inviteLink;
  } catch (error) {
    repositoryErrorLogger({ method: "getInviteLinkByToken", error });
    throw error;
  }
};

export const deleteInviteLinkByToken = async (
  db: DBClientType,
  token: string
) => {
  try {
    await db.inviteLink.delete({
      where: { token },
    });
  } catch (error) {
    repositoryErrorLogger({ method: "deleteInviteLinkByToken", error });
    throw error;
  }
};

export const createInviteLink = async (
  db: DBClientType,
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
    repositoryErrorLogger({ method: "createInviteLink", error });
    throw error;
  }
};
