import { z } from "zod";
import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { createContactSchema } from "~/schemas/contact";
import { DBClientType } from "~/types/DBClientType";

type CreateContactType = z.infer<typeof createContactSchema> & {
  supplierId: string;
};

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

export const createContact = async (
  db: DBClientType,
  {
    contactName,
    contactEmail,
    contactPhone,
    contactNotes,
    supplierId,
  }: CreateContactType
) => {
  try {
    const contact = await db.contact.create({
      data: {
        name: contactName,
        phone: contactPhone,
        email: contactEmail,
        notes: contactNotes,
        supplierId,
      },
    });

    return contact;
  } catch (error) {
    repositoryErrorLogger({ method: "createContact", error });
    throw error;
  }
};
