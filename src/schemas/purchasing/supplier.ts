import { z } from "zod";
import { createContactSchema } from "../contact";

const npwpRegex = /^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/;

export const createSupplierSchema = z
  .object({
    name: z.string().min(1, "Supplier name is required"),
    taxId: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val.trim()))
      .pipe(
        z.union([z.string().regex(npwpRegex, "Invalid NPWP format"), z.null()])
      )
      .nullable(),
    address: z.string(),
    notes: z.string().optional(),
    contactData: createContactSchema.nullable(),
  })
  .refine(
    (data) => {
      if (data.contactData?.contactName) {
        const hasContactWays =
          data.contactData.contactPhone || data.contactData.contactEmail;
        return hasContactWays;
      }
      return true;
    },
    {
      message:
        "At least one contact method (phone or email) is required when contact name is filled.",
      path: ["contactName"],
    }
  )
  .refine(
    (data) => {
      if (
        data.contactData?.contactPhone ||
        data.contactData?.contactEmail ||
        data.contactData?.contactNotes
      ) {
        return data.contactData?.contactName;
      }
      return true;
    },
    {
      message: "Did you forget to fill in the contact name?",
      path: ["contactName"],
    }
  );
