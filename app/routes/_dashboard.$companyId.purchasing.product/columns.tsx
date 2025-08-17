import { ItemCategory } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

type Product = {
  id: string;
  name: string;
  supplierCount: number;
  priceRangeIDR: string | null;
  priceRangeYUAN: string | null;
  category: ItemCategory;
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
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category;
      return category.replaceAll("_", " ");
    },
  },
  {
    accessorKey: "supplierCount",
    header: "Supplier Count",
  },
  {
    id: "idr",
    header: "Price Range (IDR)",
    cell: ({ row }) => row.original.priceRangeIDR ?? "N/A",
  },
  {
    id: "yuan",
    header: "Price Range (YUAN)",
    cell: ({ row }) => row.original.priceRangeYUAN ?? "N/A",
  },
];
