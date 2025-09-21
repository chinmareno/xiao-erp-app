import { ItemCategory } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

type Product = {
  itemName: string;
  supplierName: string;
  id: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  supplierId: string;
  priceCurrency: string;
  itemId: string;
  price: string;
  itemCategory: ItemCategory;
};

export const columns: ColumnDef<Product, unknown>[] = [
  {
    id: "no",
    header: "No.",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "itemName",
    header: "Product  ",
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.itemCategory;
      return category.replaceAll("_", " ");
    },
  },
  {
    accessorKey: "supplierName",
    header: "Supplier",
  },
  {
    header: "Price",
    cell: ({ row }) => {
      const isIDR = row.original.priceCurrency === "IDR";
      const price = row.original.price;

      return isIDR ? `Rp ${price}` : `¥${price}`;
    },
  },
  {
    header: "Added At",
    cell: ({ row }) => row.original.createdAt.toLocaleDateString(),
  },
];
