import { $Enums } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

export type SupplierPO = {
  id: string;
  status: $Enums.PurchaseOrderStatus;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  supplierId: string;
  PONumber: string;
  lastReceivedDate: Date | null;
  expectedFullReceivedDate: Date | null;
  supplierTaxId: string | null;
  totalItemTypes: number;
  priceCurrency: string;
  grandTotal: string;
};

export const columns: ColumnDef<SupplierPO>[] = [
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
    accessorKey: "supplierContactName",
    header: "Supplier Contact Person",
  },
  {
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "RECEIVED" && "bg-green-100 text-green-800"
          } ${status === "UNRECEIVED" && "bg-yellow-100 text-yellow-800"} ${
            status === "INACTIVE" && "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    header: "Tax Id (NPWP)",
    cell: ({ row }) =>
      row.original.supplierTaxId || "Not VAT-Registered (Non-PKP)",
  },
  {
    accessorKey: "totalItemTypes",
    header: "Total Item Types",
  },
  {
    header: "Created At",
    cell: ({ row }) => row.original.createdAt.toLocaleDateString(),
  },
  {
    header: "Expected Received Date",
    cell: ({ row }) => row.original.expectedFullReceivedDate || "N/A",
  },
  {
    header: "Total Amount",
    cell: ({ row }) => {
      const isIDR = row.original.priceCurrency === "IDR";
      const grandTotal = row.original.grandTotal;

      return isIDR ? `Rp ${grandTotal}` : `¥${grandTotal}`;
    },
  },
];
