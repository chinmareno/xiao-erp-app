import { ColumnDef } from "@tanstack/react-table";

type WarehouseStock = {};

export const columns: ColumnDef<WarehouseStock>[] = [
  {
    id: "no",
    header: "No.",
    cell: ({ row }) => row.index + 1,
  },
];
