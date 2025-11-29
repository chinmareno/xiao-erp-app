import { LoaderFunctionArgs } from "@remix-run/node";
import { createCallerWithContext } from "~/server/api/trpc.caller";
import { formDataParser } from "~/lib/formDataParser";
import { TRPCError } from "@trpc/server";

export type GetSupplierProductsBySupplierIdActionData = Awaited<
  ReturnType<typeof loader>
>;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const supplierId = url.searchParams.get("supplierId");
  const companyId = url.searchParams.get("companyId");
  if (!supplierId || !companyId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Missing supplierId or companyId",
    });
  }

  const caller = await createCallerWithContext(request, companyId);
  const result =
    await caller.purchasing.supplierProduct.getSupplierProductsBySupplierId({
      supplierId,
    });

  return result;
}
