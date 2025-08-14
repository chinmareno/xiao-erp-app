import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { CustomerInformation } from "./CustomerInformation";
import { POHeader } from "./POHeader";
import { SupplierInformation } from "./SupplierInformation";
import { createCallerWithContext } from "~/api/root.server";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { ItemsInformation } from "./ItemsInformation";
import { Button } from "~/components/ui/button";
import POStatusSelect from "./POStatusSelect";
import { useState } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const companyId = params.companyId as string;
  const POId = params.POId as string;

  const caller = await createCallerWithContext(request, companyId);

  const result = await caller.purchasing.PO.getPOByPOId({ id: POId });

  return result;
}

export async function action({ request, params }: ActionFunctionArgs) {
  const companyId = params.companyId as string;
  const caller = await createCallerWithContext(request, companyId);

  const suppliers = await caller.purchasing.supplier.getSuppliersByCompanyId();
  const products = await caller.purchasing.product.getProductsByCompanyId();

  return { suppliers, products };
}

export default function PODetail() {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null
  );
  const fetcher = useFetcher<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const toggleEditing = () => {
    setIsEditing((prev) => !prev);
    fetcher.submit({}, { method: "post" });
  };

  return (
    <>
      <div className="flex justify-between mb-20 flex-col relative items-center">
        <h1 className="text-2xl font-bold">Purchase Order Details</h1>
        <div className="self-end mr-4 items-center">
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} variant="secondary">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                }}
                variant="default"
                className=" ml-2"
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={toggleEditing} variant="default">
              Edit PO
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-6xl relative mx-auto p-6 border border-blue-200 bg-blue-50">
        <div className="flex w-full absolute justify-end items-center gap-3 -top-16 right-0">
          <POStatusSelect loaderData={loaderData} />
        </div>
        <POHeader loaderData={loaderData} />
        <SupplierInformation
          createPOFetcher={fetcher}
          selectedSupplierId={selectedSupplierId}
          setSelectedSupplierId={setSelectedSupplierId}
          POCreateLoaderData={fetcher.data}
          loaderData={loaderData}
          isEditing={isEditing}
        />
        <CustomerInformation loaderData={loaderData} />
        <ItemsInformation loaderData={loaderData} />
      </div>

      <div className="mt-8 ml-16 gap-7 flex">
        <Button onClick={() => navigate(-1)} type="button" variant="secondary">
          Back
        </Button>
      </div>
    </>
  );
}
