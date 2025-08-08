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
import { createCallerWithContext } from "~/api/root.server";
import { formDataParser } from "~/lib/formDataParser";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

const npwpRegex = /^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/;

export const supplierFormSchema = z
  .object({
    name: z.string().min(1, "Supplier name is required"),
    taxId: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val.trim()))
      .pipe(
        z.union([z.string().regex(npwpRegex, "Invalid NPWP format"), z.null()])
      ),
    address: z.string().min(1, "Address is required"),
    notes: z.string(),

    contactName: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val)),
    contactPhone: z
      .string()
      .trim()
      .transform((val) => (val.trim() === "" ? null : val))

      .refine(
        (val) =>
          val === null || val === undefined || /^[0-9+\-() ]+$/.test(val),
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

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await formDataParser(request);

  const result = await supplierFormSchema.safeParseAsync(formData);
  if (result.error) return { errors: result.error.format() };

  const companyId = params.companyId as string;

  const caller = await createCallerWithContext(request, companyId);
  await caller.purchasing.supplier.createSupplier(result.data);

  return redirect(`/${companyId}/purchasing/supplier`);
}

export async function clientAction({
  request,
  serverAction,
}: ClientActionFunctionArgs) {
  const requestClone = request.clone();
  const formData = await formDataParser(requestClone);
  const result = await supplierFormSchema.safeParseAsync(formData);
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
        <FormHeader title="Supplier Information" />

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
          maxLength={20}
          error={errors?.taxId?._errors[0]}
          className={SUPPLIER_INPUT_CLASSNAME}
          helperText="Leave empty if the supplier is not VAT registered (Non-PKP)."
        />
        <InputWithLabel
          id="address"
          label="Address"
          required
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
          helperText=" Leave this field empty if u don't know the contact yet"
        />

        <InputWithLabel
          id="contactName"
          label="Contact name"
          error={errors?.contactName?._errors[0]}
          className={CONTACT_INPUT_CLASSNAME}
        />
        <div className={CONTACT_INPUT_CLASSNAME}>
          <Label htmlFor="contactPhone" className="text-sm font-medium">
            Phone Number
          </Label>
          <Input
            name="contactPhone"
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(
                /[^0-9+\-() ]/g,
                ""
              );
            }}
          />
          <p className="text-xs text-muted-foreground italic">
            Include country code for international numbers.
          </p>
          <p className="text-sm text-red-600">
            {errors?.contactPhone?._errors[0]}
          </p>
        </div>
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
