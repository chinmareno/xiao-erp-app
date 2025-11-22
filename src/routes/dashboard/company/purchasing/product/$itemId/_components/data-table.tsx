import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { EditSupplierProductDialog } from "./EditSupplierProductDialog";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

type Row = {
  supplierId: string;
  priceCurrency: string;
  itemId: string;
  price: number;
  itemName: string;
  supplierName: string;
};

export function DataTable<TData extends Row, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [initialCurrency, setInitialCurrency] = useState("");
  const [initialPrice, setInitialPrice] = useState(0);
  const [itemName, setItemName] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [itemId, setItemId] = useState("");

  const handleRowClick = (row: Row) => {
    const { itemId, itemName, price, priceCurrency, supplierId, supplierName } =
      row;

    setSupplierName(supplierName);
    setSupplierId(supplierId);
    setItemName(itemName);
    setInitialPrice(price);
    setInitialCurrency(priceCurrency);
    setItemId(itemId);

    setOpenDialog(true);
  };

  return (
    <div className="rounded-md border">
      <EditSupplierProductDialog
        itemId={itemId}
        supplierName={supplierName}
        supplierId={supplierId}
        setOpenDialog={setOpenDialog}
        openDialog={openDialog}
        itemName={itemName}
        initialCurrency={initialCurrency}
        initialPrice={String(initialPrice)}
      />
      <Table>
        <TableHeader className="bg-slate-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                className="cursor-pointer hover:bg-gray-100"
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => handleRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
