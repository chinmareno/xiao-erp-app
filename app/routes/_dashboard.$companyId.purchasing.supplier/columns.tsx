import { ColumnDef } from "@tanstack/react-table";

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

export const columns: ColumnDef<Supplier>[] = [
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
