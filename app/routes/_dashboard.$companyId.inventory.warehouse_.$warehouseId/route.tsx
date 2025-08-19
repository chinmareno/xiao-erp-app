import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function WarehouseStock() {
  return (
    <div className="container mx-auto flex flex-col py-10">
      <h2>The stock</h2>
      <DataTable columns={columns} data={[]} />
    </div>
  );
}
