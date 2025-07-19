import { columns, Supplier } from "./columns";
import { DataTable } from "./data-table";
import { Link, useLoaderData } from "@remix-run/react";
import { Plus } from "lucide-react";

export async function loader(): Promise<Supplier[]> {
  const result = [
    {
      id: "728ed52f",
      name: "pt haha",
      address: "jl hahay",
      contact: "budi - 08888666",
      taxId: "3322244",
    },
    {
      id: "728ed52f",
      name: "pt haha",
      address: "jl hahay",
      contact: "budi - 08888666",
      taxId: "3322244",
    },
  ];

  return result;
}

export default function PurchasingSupplier() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto flex  flex-col py-10">
      <h2 className="text-center">supplier table</h2>
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
