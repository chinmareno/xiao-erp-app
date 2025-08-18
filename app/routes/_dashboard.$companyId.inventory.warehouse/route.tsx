import { Link } from "@remix-run/react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const dummyWarehouse = ["Surabaya", "Bekasi", "Bogor"];

export default function Stock() {
  return (
    <div className="container mx-auto flex flex-col py-10">
      <h2 className="text-center font-semibold capitalize mb-4">
        Warehouse Table
      </h2>
      <Select>
        <SelectTrigger className="w-full sm:w-48 md:w-64 lg:w-80">
          <SelectValue placeholder="Select warehouse" />
        </SelectTrigger>
        <SelectContent>
          {dummyWarehouse.map((warehouse) => (
            <SelectItem value={warehouse}>{warehouse}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Link
        className="mb-1 ml-auto inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        to="create"
      >
        <Plus className="h-4 w-4" />
        <span> New Warehouse</span>
      </Link>
      <DataTable columns={columns} data={[]} />
    </div>
  );
}
