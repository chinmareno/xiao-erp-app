import { LoaderFunctionArgs } from "@remix-run/node";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Link, useLoaderData } from "@remix-run/react";
import { Plus } from "lucide-react";
import { createCallerWithContext } from "~/api/root.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const companyId = params.companyId as string;

  const caller = await createCallerWithContext(request, companyId);
  const products = await caller.purchasing.product.getProductsByCompanyId();

  return products;
}

export default function PurchasingProduct() {
  const productsData = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto flex flex-col py-10">
      <h2 className="text-center font-semibold capitalize">Products Table</h2>
      <Link
        className="mb-1 ml-auto inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        to="create"
      >
        <Plus className="mr-2 h-4 w-4" />
        <span>Add Product</span>
      </Link>
      <DataTable columns={columns} data={productsData} />
    </div>
  );
}
