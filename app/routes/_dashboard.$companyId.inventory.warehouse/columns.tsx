import { ColumnDef } from "@tanstack/react-table";

type Warehouse = {
  id: string;
  name: string;
  location: string | null;
  pic: string | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};

export const columns: ColumnDef<Warehouse>[] = [
  {
    id: "no",
    header: "No.",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Warehouse Name",
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => row.original.location || "N/A",
  },
  {
    accessorKey: "pic",
    header: "Person In Charge",
    cell: ({ row }) => row.original.pic || "N/A",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
  },
];
