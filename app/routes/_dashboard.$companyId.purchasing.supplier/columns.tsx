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
    accessorKey: "taxId",
    header: "Tax ID (NPWP)",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    header: "Contact",
    cell: ({ row }) => {
      const contactName = row.original.contact[0].name;
      const contactPhone = row.original.contact[0].phone;
      const contactEmail = row.original.contact[0].email;
      const contact = `${contactName}/${contactPhone || contactEmail}`;

      return contact;
    },
  },
];
