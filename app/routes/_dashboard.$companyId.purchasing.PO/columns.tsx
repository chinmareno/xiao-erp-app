import { ColumnDef } from "@tanstack/react-table";
import { type PurchaseOrderStatus } from "@prisma/client";

type PO = {
  supplierTaxId: string | null;
  companyId: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  supplierId: string;
  supplierContactId: string;
  supplierName: string;
  supplierContactName: string;
  supplierContactEmail: string | null;
  supplierContactPhone: string | null;
  supplierAdress: string;
  customerName: string;
  customerContactName: string;
  customerContactEmail: string | null;
  customerContactPhone: string | null;
  customerAddress: string;
  PONumber: string;
  status: PurchaseOrderStatus;
  isActive: boolean;
  lastReceivedDate: Date | null;
  expectedFullReceivedDate: Date | null;
};

export const columns: ColumnDef<PO>[] = [
  {
    id: "no",
    header: "No.",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "PONumber",
    header: "PO Number",
  },
  {
    accessorKey: "supplierName",
    header: "Supplier",
  },
  {
    accessorKey: "supplierName",
    header: "Supplier Contact Person",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    header: "Tax Id (NPWP)",
    cell: ({ row }) =>
      row.original.supplierTaxId || "Not VAT-Registered (Non-PKP)",
  },
  {
    header: "Created At",
    cell: ({ row }) => row.original.createdAt.toLocaleDateString(),
  },
  {
    header: "Expected Received Date",
    cell: ({ row }) => row.original.expectedFullReceivedDate || "N/A",
  },
];
