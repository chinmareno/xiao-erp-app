import { useActionData, useLoaderData } from "@remix-run/react";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { Plus } from "lucide-react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { createCallerWithContext } from "~/server/api/root.server";
import { z } from "zod";
import { formDataParser } from "~/lib/formDataParser";
import { CreateWarehouseDialog } from "./_components/CreateWarehouseDialog";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const companyId = params.companyId as string;
  const caller = await createCallerWithContext(request, companyId);
  const warehouses = await caller.inventory.warehouse.getWarehouses();

  return warehouses;
}

const createWarehouseSchema = z.object({
  name: z.string().min(1, "Warehouse name is required"),
  location: z.string(),
  pic: z.string(),
});
export async function action({ request, params }: ActionFunctionArgs) {
  const companyId = params.companyId as string;
  const formData = await formDataParser(request);
  const result = await createWarehouseSchema.safeParseAsync(formData);

  if (!result.success) {
    console.log({ errors: result.error.format() });
    return { errors: result.error.format() };
  }

  const { name, location, pic } = result.data;

  const caller = await createCallerWithContext(request, companyId);
  const newWarehouseId = await caller.inventory.warehouse.createWarehouse({
    name,
    pic,
    location,
  });

  return { newWarehouseId };
}

export default function Warehouse() {
  const loaderData = useLoaderData<typeof loader>();
  const [openDialog, setOpenDialog] = useState(false);
  const actionData = useActionData<typeof action>();

  useEffect(() => {
    if (!actionData) return;

    if (actionData?.errors) {
      toast.error("Invalid input. Please fix and try again.");
    } else if (actionData.newWarehouseId) {
      toast.success("Warehouse created successfully!");
      setOpenDialog(false);
    }
  }, [actionData]);

  return (
    <div className="container mx-auto flex flex-col py-10">
      <h2 className="text-center font-semibold capitalize mb-4">
        Warehouse Table
      </h2>
      <Button
        onClick={() => setOpenDialog(true)}
        className="mb-1 ml-auto inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span> New Warehouse</span>
      </Button>
      <CreateWarehouseDialog open={openDialog} onOpenChange={setOpenDialog} />
      <DataTable columns={columns} data={loaderData} />
    </div>
  );
}
