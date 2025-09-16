import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { DBClientType } from "~/types/DBClientType";

export const getContactById = async (db: DBClientType, contactId: string) => {
  try {
    const contact = await db.contact.findUnique({
      where: { id: contactId },
    });
    return contact;
  } catch (error) {
    repositoryErrorLogger({ method: "getContactById", error });
    throw error;
  }
};
