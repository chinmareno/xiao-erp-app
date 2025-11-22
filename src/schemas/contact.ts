import { z } from "zod";

export const createContactSchema = z.object({
  contactName: z.string().min(1),
  contactPhone: z.string().trim().nullable(),
  contactEmail: z.string().nullable(),
  contactNotes: z.string().nullable(),
});

export const addContactSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactPhone: z.string().nullable(),
  contactEmail: z.string().nullable(),
  contactNotes: z.string().nullable(),
});
