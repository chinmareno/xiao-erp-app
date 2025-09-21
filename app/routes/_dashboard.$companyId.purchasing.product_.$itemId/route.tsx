import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { createCallerWithContext } from "~/server/api/root.server";
import { z } from "zod";
import { formDataParser } from "~/lib/formDataParser";
import { PriceCurrency } from "@prisma/client";

const editPriceSchema = z.object({
  supplierId: z.string().min(1),
  price: z.string().min(1),
  priceCurrency: z.nativeEnum(PriceCurrency),
});

export async function loader({ params, request }: LoaderFunctionArgs) {
  const companyId = params.companyId as string;
  const itemId = params.itemId as string;

  const caller = await createCallerWithContext(request, companyId);

  const supplierProducts =
    await caller.purchasing.supplierProduct.getSupplierProductByItemId({
      itemId,
    });

  return supplierProducts;
}

export async function action({ params, request }: ActionFunctionArgs) {
  const companyId = params.companyId as string;
  const itemId = params.itemId as string;
  const formData = await formDataParser(request);
  const result = await editPriceSchema.safeParseAsync(formData);

  if (!result.success) {
    console.log({ errors: result.error.format() });
    return null;
  }

  const { price, priceCurrency, supplierId } = result.data;
  const caller = await createCallerWithContext(request, companyId);

  await caller.purchasing.supplierProduct.editPriceSupplierProductBySupplierIdAndItemId(
    { itemId, supplierId, price, priceCurrency }
  );

  return null;
}

export default function ProductItemPage() {
  const supplierProducts = useLoaderData<typeof loader>();
  const productName =
    supplierProducts.length > 0 ? supplierProducts[0].supplierName : "Product";

  return (
    <div className="container mx-auto flex flex-col py-10">
      <h1 className="text-2xl font-bold mb-6">{productName} Supplier List</h1>
      <p className="self-end text-sm text-gray-500 mb-2">
        Click the row to edit the product price
      </p>

      <DataTable columns={columns} data={supplierProducts ?? []} />
    </div>
  );
}
