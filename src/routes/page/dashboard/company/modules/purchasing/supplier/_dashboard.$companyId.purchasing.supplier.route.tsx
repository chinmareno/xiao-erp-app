import { LoaderFunctionArgs } from "@remix-run/node";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { Link, useLoaderData } from "@remix-run/react";
import { Plus } from "lucide-react";
import { createCallerWithContext } from "~/server/api/trpc.caller";
import TableTitle from "~/components/Table/TableTitle";

export type SupplierLoaderData = Awaited<ReturnType<typeof loader>>;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const companyId = params.companyId as string;
  const caller = await createCallerWithContext(request, companyId);
  const suppliers = await caller.purchasing.supplier.getSuppliersByCompanyId();

  return suppliers;
}

export default function PurchasingSupplier() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto flex  flex-col py-10">
      <TableTitle title="Supplier List" />

      <Link
        className="mb-1 ml-auto inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        to="create"
      >
        <Plus className="mr-2 h-4 w-4" />
        <span>Add Supplier</span>
      </Link>

      <DataTable columns={columns} data={data} />
    </div>
  );
}
