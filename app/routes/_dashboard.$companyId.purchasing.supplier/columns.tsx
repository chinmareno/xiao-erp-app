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

export type Supplier = {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  address: string | null;
  taxId: string | null;
  notes: string | null;
  contact: {
    name: string;
    phone: string | null;
    email: string | null;
    notes: string | null;
  }[];
};

export const columns: ColumnDef<Supplier>[] = [
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
    accessorKey: "taxId",
    header: "Tax ID (NPWP)",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    header: "Contact",
    cell: ({ row }) => {
      const contactName = row.original.contact[0].name;
      const contactPhone = row.original.contact[0].phone;
      const contactEmail = row.original.contact[0].email;
      const contact = `${contactName}/${contactPhone || contactEmail}`;

      return contact;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{row.getValue("contact")}</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
