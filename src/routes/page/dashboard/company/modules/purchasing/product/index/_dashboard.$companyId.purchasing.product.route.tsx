import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { createCallerWithContext } from "~/server/api/trpc.caller";
import AddButton from "~/components/AddButton";
import TableTitle from "~/components/Table/TableTitle";
import { ProductTable } from "./_components/ProductTable";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const companyId = params.companyId as string;

  const caller = await createCallerWithContext(request, companyId);
  const products =
    await caller.purchasing.supplierProduct.getSupplierProductsByCompanyId();

  return products;
}

export default function Products() {
  const productsData = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto flex flex-col py-10">
      <TableTitle title="Products Table" />

      <Link className="ml-auto mb-1" to="create">
        <AddButton label="Add Product" />
      </Link>

      <ProductTable data={productsData} />
    </div>
  );
}
