import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export type SupplierProduct = {
  name: string;
  costIdr: number;
  costYuan: number;
  createdAt: Date;
  updatedAt: Date;
};

export const columns: ColumnDef<SupplierProduct>[] = [
  {
    id: "no",
    header: "No.",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Item Name",
  },
  {
    id: "costIdr",
    header: "Cost IDR",
    cell: ({ row }) => {
      const { costIdr } = row.original;
      return <span>Rp {costIdr.toLocaleString()}</span>;
    },
  },
  {
    id: "costYuan",
    header: "Cost Yuan)",
    cell: ({ row }) => {
      const { costYuan } = row.original;
      return <span>¥{costYuan.toLocaleString()}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "First Added",
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{row.getValue("name")}</DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit Supplier Product</DropdownMenuItem>
            <DropdownMenuItem>Delete Supplier Product</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
