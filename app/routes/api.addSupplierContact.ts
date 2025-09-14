import { ActionFunctionArgs } from "@remix-run/node";
import { ClientActionFunctionArgs } from "@remix-run/react";
import { z } from "zod";
import { createCallerWithContext } from "~/server/api/root.server";
import { formDataParser } from "~/lib/formDataParser";

const contactFormSchema = z
  .object({
    companyId: z.string().min(1, "Company ID is required"),
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
  const formData = await formDataParser(request);
  const result = await contactFormSchema.safeParseAsync(formData);
  if (result.error) return { errors: result.error.format() };

  const {
    supplierId,
    contactEmail,
    contactName,
    contactNotes,
    contactPhone,
    companyId,
  } = result.data;

  const caller = await createCallerWithContext(request, companyId);
  await caller.purchasing.supplier.addSupplierContact({
    supplierId,
    contactName,
    contactEmail,
    contactNotes,
    contactPhone,
  });

  return null;
}

export async function clientAction({
  request,
  serverAction,
}: ClientActionFunctionArgs) {
  const cloneRequest = request.clone();
  const formData = await formDataParser(cloneRequest);
  const result = await contactFormSchema.safeParseAsync(formData);
  if (result.error) {
    console.error({ errors: result.error.format() });
    return { errors: result.error.format() };
  }

  return await serverAction();
}
