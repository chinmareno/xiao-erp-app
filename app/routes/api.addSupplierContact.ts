import { ActionFunctionArgs } from "@remix-run/node";
import { ClientActionFunctionArgs } from "@remix-run/react";
import { z } from "zod";
import { createCallerWithContext } from "~/api/root.server";
import { formDataParser } from "~/lib/formDataParser";

export type AddSupplierContact = {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactNotes: string;
  supplierId: string;
  companyId: string;
};

const contactFormSchema = z
  .object({
    supplierId: z.string().min(1, "Supplier ID is required"),
    contactName: z.string().min(1, "Contact name is required"),
    contactPhone: z
      .string()
      .trim()
      .transform((val) => (val.trim() === "" ? null : val))

      .refine((val) => val === null || /^[0-9+\-() ]+$/.test(val), {
        message: "Invalid phone number",
      }),
    contactEmail: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val))
      .refine(
        (val) => val === null || z.string().email().safeParse(val).success,
        { message: "Invalid email format" }
      ),
    contactNotes: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val)),
  })
  .refine(
    (data) => {
      if (data.contactName) {
        const hasContactWays = data.contactPhone || data.contactEmail;
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
      if (data.contactPhone || data.contactEmail || data.contactNotes) {
        return data.contactName;
      }
      return true;
    },
    {
      message: "Did you forget to fill in the contact name?",
      path: ["contactName"],
    }
  );

export async function action({ request }: ActionFunctionArgs) {
  const formData = (await formDataParser(request)) as AddSupplierContact;
  const result = await contactFormSchema.safeParseAsync(formData);
  if (result.error) return { errors: result.error.format() };
  const caller = await createCallerWithContext(request, formData.companyId);
  await caller.purchasing.supplier.addSupplierContact({
    supplierId: formData.supplierId,
    contactName: formData.contactName,
    contactPhone: formData.contactPhone,
    contactEmail: formData.contactEmail,
    contactNotes: formData.contactNotes,
  });

  return null;
}

export async function clientAction({
  request,
  serverAction,
}: ClientActionFunctionArgs) {
  const cloneRequest = request.clone();
  const formData = (await formDataParser(cloneRequest)) as AddSupplierContact;
  const result = await contactFormSchema.safeParseAsync(formData);
  if (result.error) return { errors: result.error.format() };

  return await serverAction();
}
