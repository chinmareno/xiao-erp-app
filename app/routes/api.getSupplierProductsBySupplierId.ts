import { ActionFunctionArgs } from "@remix-run/node";
import { createCallerWithContext } from "~/api/root.server";
import { formDataParser } from "~/lib/formDataParser";

export type GetSupplierProductsBySupplierIdActionData = Awaited<
  ReturnType<typeof action>
>;

export async function action({ request }: ActionFunctionArgs) {
  const formData = (await formDataParser(request)) as {
    supplierId: string;
    companyId: string;
  };
  console.log(formData.companyId);
  const caller = await createCallerWithContext(request, formData.companyId);
  const result =
    await caller.purchasing.supplier.getSupplierProductsBySupplierId({
      supplierId: formData.supplierId,
    });
  return result;
}
