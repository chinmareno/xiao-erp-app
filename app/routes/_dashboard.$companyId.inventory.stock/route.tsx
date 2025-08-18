import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function Stock() {
  return (
    <div>
      <DataTable columns={columns} data={[]} />
    </div>
  );
}
