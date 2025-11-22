import { ItemCategory } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

type Product = {
  itemId: string;
  itemName: string;
  itemCategory: ItemCategory;
  supplierCount: number;
  priceRangeIDR: string | null;
  priceRangeYUAN: string | null;
};

export const columns: ColumnDef<Product>[] = [
  {
    id: "no",
    header: "No.",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "itemName",
    header: "Name",
  },
  {
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.itemCategory;
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
