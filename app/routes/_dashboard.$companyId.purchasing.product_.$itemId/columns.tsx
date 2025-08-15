import { ColumnDef } from "@tanstack/react-table";

type Product = {
  name: string;
  supplierName: string;
  id: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  supplierId: string;
  priceCurrency: string;
  itemId: string;
  price: string;
};

export const columns: ColumnDef<Product>[] = [
  {
    id: "no",
    header: "No.",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Product  ",
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
