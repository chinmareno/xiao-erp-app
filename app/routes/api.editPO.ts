import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { z } from "zod";
import { createCallerWithContext } from "~/server/api/root.server";

const editPOSchema = z.object({
  companyId: z.string().min(1),
  POId: z.string().min(1),
  supplierContactId: z.string().min(1, "Contact is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  customerContactName: z.string().min(1, "Customer contact name is required"),
  discount: z.string(),
  tax: z.string(),
  subTotal: z.string().min(1),
  discountTotal: z.string().min(1),
  taxTotal: z.string().min(1),
  grandTotal: z.string().min(1),
  customerContactEmail: z.union([
    z.string().email("Invalid email"),
    z.literal(""),
  ]),
  customerContactPhone: z.union([z.string(), z.literal("")]),
  priceCurrency: z.enum(["YUAN", "IDR"]),
  items: z
    .array(
      z.object({
        itemId: z.string().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        itemCost: z.number().min(1, "Item cost is required"),
        unit: z.string().min(1, "Unit is required"),
      })
    )
    .min(1, "At least one item is required"),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await JSON.parse(
    (await request.formData()).get("data") as string
  );
  const parsed = await editPOSchema.safeParseAsync(formData);

  if (!parsed.success) {
    console.log({
      error: parsed.error.format(),
    });
    return {
      error: parsed.error.format(),
    };
  }

  const {
    POId,
    supplierContactId,
    supplierId,
    customerContactName,
    discount,
    tax,
    subTotal,
    discountTotal,
    taxTotal,
    grandTotal,
    customerContactEmail,
    customerContactPhone,
    priceCurrency,
    items,
    companyId,
  } = parsed.data;

  const caller = await createCallerWithContext(request, companyId);

  await caller.purchasing.PO.editPOByPOId({
    POId,
    supplierContactId,
    supplierId,
    customerContactName,
    discount,
    tax,
    subTotal,
    discountTotal,
    taxTotal,
    grandTotal,
    customerContactEmail,
    customerContactPhone,
    priceCurrency,
    items,
  });

  return redirect(`/${companyId}/purchasing/PO`);
}
