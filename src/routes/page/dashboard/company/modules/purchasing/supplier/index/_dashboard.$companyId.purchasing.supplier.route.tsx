import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { Plus } from "lucide-react";
import { createCallerWithContext } from "~/server/api/trpc.caller";
import TableTitle from "~/components/Table/TableTitle";
import { DataTable } from "~/components/Table/DataTable";
import { ColumnDef } from "@tanstack/react-table";

export type SupplierLoaderData = Awaited<ReturnType<typeof loader>>;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const companyId = params.companyId as string;
  const caller = await createCallerWithContext(request, companyId);
  const suppliers = await caller.purchasing.supplier.getSuppliersByCompanyId();

  return suppliers;
}

export default function PurchasingSupplier() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();

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

      <DataTable
        columns={columns}
        data={data}
        onRowClick={(supplier) => navigate(supplier.id)}
      />
    </div>
  );
}

export type Supplier = {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  address: string | null;
  taxId: string | null;
  notes: string | null;
  contact: {
    name: string;
    phone: string | null;
    email: string | null;
    notes: string | null;
  }[];
};

const columns: ColumnDef<Supplier>[] = [
  {
    id: "no",
    header: "No.",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    header: "Tax ID (NPWP)",
    cell: ({ row }) => (
      <span className="whitespace-nowrap overflow-hidden text-ellipsis block max-w-[300px]">
        {row.original.taxId}
      </span>
    ),
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    header: "Contact",
    cell: ({ row }) => {
      const contact = row.original.contact?.[0];
      const name = contact?.name;
      const phone = contact?.phone || "";
      const email = contact?.email || "";
      const contactInfo = name ? `${name} / ${phone || email || "-"}` : "N/A";

      return (
        <span className="whitespace-nowrap overflow-hidden text-ellipsis block max-w-[300px]">
          {contactInfo}
        </span>
      );
    },
  },
];
