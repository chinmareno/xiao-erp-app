import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";

export default function Stock() {
  return (
    <div>
      <DataTable columns={columns} data={[]} />
    </div>
  );
}
