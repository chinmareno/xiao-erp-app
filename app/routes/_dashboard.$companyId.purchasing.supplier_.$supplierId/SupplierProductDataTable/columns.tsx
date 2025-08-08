import { Link } from "@remix-run/react";
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
  id: string;
  name: string;
  price: string;
  priceCurrency: string;
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
    id: "price",
    header: "Price",
    cell: ({ row }) => {
      const { price, priceCurrency } = row.original;

      const symbol = priceCurrency === "YUAN" ? "¥" : "Rp";
      const formattedPrice = parseFloat(price).toLocaleString(
        priceCurrency === "YUAN" ? "zh-CN" : "id-ID",
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }
      );

      return (
        <span>
          {symbol} {formattedPrice}
        </span>
      );
    },
  },

  {
    header: "First Added",
    cell: ({ row }) => row.original.createdAt.toLocaleDateString(),
  },
  {
    header: "Last Updated",
    cell: ({ row }) => row.original.updatedAt.toLocaleDateString(),
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
            <DropdownMenuItem asChild>
              <Link to={row.original.id}>Edit Supplier Product</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Delete Supplier Product</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
