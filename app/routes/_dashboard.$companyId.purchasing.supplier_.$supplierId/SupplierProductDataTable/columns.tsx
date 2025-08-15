import { Link, useFetcher, useParams } from "@remix-run/react";
import { ColumnDef, type Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
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
        priceCurrency === "YUAN" ? "zh-CN" : "en-US",
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
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];

type DeleteActionData = { itemName: string };

function ActionsCell({ row }: { row: Row<SupplierProduct> }) {
  const fetcher = useFetcher<DeleteActionData>();
  const params = useParams();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (fetcher.data?.itemName) {
      toast.success(`Deleted ${fetcher.data.itemName} Successfully`);
    }
  }, [fetcher.data]);

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
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

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="text-red-600 focus:text-red-600"
            >
              Delete Supplier Product
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete{" "}
                <strong>{row.original.name}</strong> from supplier products.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  setMenuOpen(false);
                  fetcher.submit(
                    {
                      supplierProductId: row.original.id,
                      supplierId: params.supplierId as string,
                      companyId: params.companyId as string,
                      itemName: row.original.name,
                    },
                    { action: "/api/deleteSupplierProduct", method: "POST" }
                  );
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
