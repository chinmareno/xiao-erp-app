import { ColumnDef } from "@tanstack/react-table";

type Product = {
  name: string;
  supplierCount: number;
  priceRange: string;
};

export const columns: ColumnDef<Product>[] = [
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
    accessorKey: "supplierCount",
    header: "Supplier Count",
  },
  {
    accessorKey: "priceRange",
    header: "Price Range",
  },
];
