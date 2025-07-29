import { ColumnDef } from "@tanstack/react-table";

export type Product = {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export const columns: ColumnDef<Product>[] = [
  {
    id: "no",
    header: "No.",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Item Name",
  },
];
