import { DBClientType } from "~/types/DBClientType";
import { getContactById } from "../repositories/contact";

export const findContactByContactId = async (
  db: DBClientType,
  contactId: string
) => {
  const contact = await getContactById(db, contactId);

  return contact;
};
