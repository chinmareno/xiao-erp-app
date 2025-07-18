import { ActionFunctionArgs, redirect } from "@remix-run/node";
import {
  ClientActionFunctionArgs,
  Form,
  Link,
  useActionData,
} from "@remix-run/react";
import InputWithLabel from "~/components/InputWithLabel";
import { Button } from "~/components/ui/button";

import { z } from "zod";
import FormHeader from "~/components/ui/FormHeader";
import { createCallerWithContext } from "~/.server/root.server";

export const supplierFormSchema = z
  .object({
    name: z.string().min(1, "Supplier name is required"),
    taxId: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),

    contactName: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val)),
    contactPhone: z
      .string()
      .trim()
      .transform((val) => (val.trim() === "" ? null : val))

      .refine(
        (val) =>
          val === null || val === undefined || /^[0-9+\-\s()]+$/.test(val),
        {
          message: "Invalid phone number",
        }
      ),
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

type SupplierForm = z.infer<typeof supplierFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData) as SupplierForm;

  const result = await supplierFormSchema.safeParseAsync(data);
  if (result.error) return { errors: result.error.format() };

  const caller = await createCallerWithContext(request);
  await caller.purchasing.supplier.create(data);

  return redirect("/purchasing/supplier");
}

export async function clientAction({
  request,
  serverAction,
}: ClientActionFunctionArgs) {
  const requestClone = request.clone();
  const formData = await requestClone.formData();
  const data = Object.fromEntries(formData) as SupplierForm;
  const result = await supplierFormSchema.safeParseAsync(data);
  if (result.error) return { errors: result.error.format() };
  return serverAction<typeof action>();
}

const SECTION_FORM_CLASSNAME = "flex flex-col xl:mx-28";
const SUPPLIER_INPUT_CLASSNAME = " my-2";
const CONTACT_INPUT_CLASSNAME = " my-2";

export default function PurchasingSupplierCreate() {
  const actionData = useActionData<typeof action>();

  const errors = actionData?.errors;

  return (
    <Form method="post" className="grid grid-cols-2 gap-10">
      <div className={SECTION_FORM_CLASSNAME}>
        <FormHeader
          title="Supplier Information"
          helperText="Just enter the supplier name if you don't have full details yet."
        />

        <InputWithLabel
          id="name"
          label="Supplier name"
          required
          error={errors?.name?._errors[0]}
          className={SUPPLIER_INPUT_CLASSNAME}
        />
        <InputWithLabel
          id="taxId"
          label="Tax Id (NPWP)"
          error={errors?.taxId?._errors[0]}
          className={SUPPLIER_INPUT_CLASSNAME}
          helperText="Leave empty if the supplier is not VAT registered (Non-PKP)."
        />
        <InputWithLabel
          id="address"
          label="Address"
          error={errors?.address?._errors[0]}
          className={SUPPLIER_INPUT_CLASSNAME}
        />
        <InputWithLabel
          id="notes"
          label="Notes"
          error={errors?.notes?._errors[0]}
          className={SUPPLIER_INPUT_CLASSNAME}
          inputClassName=" pt-2 text-wrap pb-20"
          multiline
        />
      </div>

      <div className={SECTION_FORM_CLASSNAME}>
        <FormHeader
          title="Contact Information"
          helperText=" Fill this if the supplier has a contact person (PIC)."
        />

        <InputWithLabel
          id="contactName"
          label="Contact name"
          error={errors?.contactName?._errors[0]}
          className={CONTACT_INPUT_CLASSNAME}
        />
        <InputWithLabel
          id="contactPhone"
          label="Phone Number"
          error={errors?.contactPhone?._errors[0]}
          className={CONTACT_INPUT_CLASSNAME}
          helperText="Include country code for international numbers."
        />
        <InputWithLabel
          id="contactEmail"
          label="Email"
          error={errors?.contactEmail?._errors[0]}
          className={CONTACT_INPUT_CLASSNAME}
        />
        <InputWithLabel
          id="contactNotes"
          label="Notes"
          error={errors?.contactNotes?._errors[0]}
          className={CONTACT_INPUT_CLASSNAME}
          inputClassName=" pt-2 text-wrap pb-20"
          multiline
        />
      </div>

      <div className="mt-14 col-span-2 flex justify-end gap-4">
        <Link
          to="/your-supplier-list-path"
          className="inline-flex items-center justify-center rounded-md border border-input px-6 py-2 text-sm font-medium shadow-sm hover:bg-muted"
        >
          Cancel
        </Link>
        <Button type="submit" className="px-20">
          Save
        </Button>
      </div>
    </Form>
  );
}
