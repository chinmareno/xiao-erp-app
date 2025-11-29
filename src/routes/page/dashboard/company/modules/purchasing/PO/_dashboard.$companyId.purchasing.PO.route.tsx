import { LoaderFunctionArgs } from "@remix-run/node";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { Link, useLoaderData } from "@remix-run/react";
import { Plus } from "lucide-react";
import { createCallerWithContext } from "~/server/api/trpc.caller";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { usePOStatusFilterStore } from "~/hooks/supplier/usePOStatusFilterStore";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const companyId = params.companyId as string;

  const caller = await createCallerWithContext(request, companyId);
  const POs = await caller.purchasing.PO.getPOsByCompanyId();

  return POs;
}

export default function PurchasingProduct() {
  const POs = useLoaderData<typeof loader>();
  const { selectedStatus, setSelectedStatus } = usePOStatusFilterStore();

  const filteredPOs = POs.filter((po) => {
    if (selectedStatus === "unreceived") return po.status === "UNRECEIVED";
    if (selectedStatus === "received") return po.status === "RECEIVED";
    if (selectedStatus === "inactive") return po.status === "INACTIVE";
    return true;
  });

  return (
    <div className="container mx-auto flex flex-col py-10">
      <h2 className="text-center font-semibold capitalize mb-4">
        Purchasing Orders Table
      </h2>
      <RadioGroup defaultValue={selectedStatus}>
        <div className="flex items-center gap-3">
          <RadioGroupItem
            onClick={() => setSelectedStatus("unreceived")}
            value="unreceived"
            id="unreceived"
          />
          <Label htmlFor="unreceived">Unreceivable</Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem
            onClick={() => setSelectedStatus("received")}
            value="received"
            id="received"
          />
          <Label htmlFor="received">Received</Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem
            onClick={() => setSelectedStatus("inactive")}
            value="inactive"
            id="inactive"
          />
          <Label htmlFor="inactive">Inactive</Label>
        </div>
      </RadioGroup>

      <Link
        className="mb-4 ml-auto inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        to="create"
      >
        <Plus className="mr-2 h-4 w-4" />
        <span>Add PO</span>
      </Link>

      <DataTable columns={columns} data={filteredPOs} />
    </div>
  );
}
