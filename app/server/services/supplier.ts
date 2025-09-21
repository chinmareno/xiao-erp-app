import {
  createSupplier,
  getSupplierById,
  getSupplierIdById,
  getSuppliersByCompanyId,
} from "../repositories/supplier";
import { TRPCError } from "@trpc/server";
import { PrismaClient } from "@prisma/client";
import { createSupplierSchema } from "~/schemas/purchasing/supplier";
import { z } from "zod";
import { createContact } from "../repositories/contact";
import { DBClientType } from "~/types/DBClientType";
import { getPOsBySupplierId } from "../repositories/PO";
import { addContactSchema } from "../../schemas/contact";
import { serviceErrorLogger } from "~/lib/logger/serviceErrorLogger";

type AddNewSupplierType = z.infer<typeof createSupplierSchema> & {
  companyId: string;
};

type AddSupplierContactType = z.infer<typeof addContactSchema>;

export const findSupplierBySupplierId = async (
  db: PrismaClient,
  supplierId: string
) => {
  const supplier = await getSupplierById(db, supplierId);

  if (!supplier) throw new TRPCError({ code: "NOT_FOUND" });

  return supplier;
};

export const addNewSupplier = async (
  db: PrismaClient,
  { name, taxId, address, notes, companyId, contactData }: AddNewSupplierType
) => {
  await db.$transaction(async (tx) => {
    const supplier = await createSupplier(tx, {
      name,
      taxId,
      address,
      notes,
      companyId,
    });
    if (contactData) {
      const { contactName, contactEmail, contactNotes, contactPhone } =
        contactData;
      await createContact(tx, {
        contactName,
        contactEmail,
        contactNotes,
        contactPhone,
        supplierId: supplier.id,
      });
    }
  });
};

export const findSuppliersByCompanyId = async (
  db: PrismaClient,
  companyId: string
) => {
  const suppliers = await getSuppliersByCompanyId(db, companyId);

  return suppliers;
};

export const findSupplierPOsBySupplierId = async (
  db: DBClientType,
  supplierId: string
) => {
  const PO = await getPOsBySupplierId(db, supplierId);

  return PO;
};

export const addSupplierContact = async (
  db: DBClientType,
  {
    supplierId,
    contactEmail,
    contactName,
    contactNotes,
    contactPhone,
  }: AddSupplierContactType
) => {
  const supplier = await getSupplierIdById(db, supplierId);
  if (!supplier) {
    serviceErrorLogger({
      method: "addSupplierContact",
      error: `Supplier with id ${supplierId} not found during add new contact`,
    });
    throw new TRPCError({ code: "NOT_FOUND" });
  }
  await createContact(db, {
    supplierId,
    contactEmail,
    contactName,
    contactNotes,
    contactPhone,
  });
};
