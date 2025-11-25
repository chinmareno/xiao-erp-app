import { DataTable } from "~/components/Table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "@remix-run/react";
import { ItemCategoryType } from "~/types/ItemCategoryType";

export type Product = {
  itemId: string;
  itemName: string;
  itemCategory: ItemCategoryType;
  supplierCount: number;
  priceRangeIDR: string | null;
  priceRangeYUAN: string | null;
};

const columns: ColumnDef<Product>[] = [
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

type Props = {
  data: Product[];
};

export const ProductTable = ({ data }: Props) => {
  const navigate = useNavigate();

  const handleRowClick = (row: Product) => {
    navigate(row.itemId);
  };

  return (
    <DataTable<Product>
      data={data}
      columns={columns}
      onRowClick={handleRowClick}
    />
  );
};
