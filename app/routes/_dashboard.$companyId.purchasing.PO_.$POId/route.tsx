import { LoaderFunctionArgs } from "@remix-run/node";
import { CustomerInformation } from "./CustomerInformation";
import { POHeader } from "./POHeader";
import { SupplierInformation } from "./SupplierInformation";
import { createCallerWithContext } from "~/api/root.server";
import { useLoaderData } from "@remix-run/react";
import { ItemsInformation } from "./ItemsInformation";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const companyId = params.companyId as string;
  const POId = params.POId as string;

  const caller = await createCallerWithContext(request, companyId);

  const result = await caller.purchasing.PO.getPOByPOId({ id: POId });

  return result;
}

export default function PODetail() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <div className="max-w-6xl mx-auto p-6 border border-blue-200 bg-blue-50">
      <POHeader loaderData={loaderData} />
      <SupplierInformation loaderData={loaderData} />
      <CustomerInformation loaderData={loaderData} />
      <ItemsInformation loaderData={loaderData} />
    </div>
  );
}
