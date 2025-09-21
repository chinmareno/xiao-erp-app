import { ActionFunctionArgs } from "@remix-run/node";
import { createCallerWithContext } from "~/server/api/root.server";
import { formDataParser } from "~/lib/formDataParser";

export type GetSupplierProductsBySupplierIdActionData = Awaited<
  ReturnType<typeof action>
>;

export async function action({ request }: ActionFunctionArgs) {
  const formData = (await formDataParser(request)) as {
    supplierId: string;
    companyId: string;
  };
  const caller = await createCallerWithContext(request, formData.companyId);
  const result =
    await caller.purchasing.supplierProduct.getSupplierProductsBySupplierId({
      supplierId: formData.supplierId,
    });
  return result;
}
