import { ActionFunctionArgs } from "@remix-run/node";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createCallerWithContext } from "~/server/api/root.server";
import { formDataParser } from "~/lib/formDataParser";

const deleteSupplierProductSchema = z.object({
  supplierId: z.string().min(1),
  supplierProductId: z.string().min(1),
  companyId: z.string().min(1),
  itemName: z.string().min(1),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await formDataParser(request);
  const result = await deleteSupplierProductSchema.safeParseAsync(formData);

  if (!result.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid supplier product data",
    });
  }
  const { companyId, supplierId, supplierProductId, itemName } = result.data;

  const caller = await createCallerWithContext(request, companyId);

  await caller.purchasing.product.deleteSupplierProductById({
    supplierId,
    supplierProductId,
  });

  return { itemName };
}
