import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { createCallerWithContext } from "~/server/api/trpc.caller";
import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { useEffect, useState } from "react";
import { Item } from "./_components/POItemsInformation/POItemsInformationEdit";
import POStatusSelect from "./_components/POStatusSelect";
import { POHeader } from "./_components/POHeader";
import { CustomerInformation } from "./_components/CustomerInformation";
import { POItemsInformation } from "./_components/POItemsInformation";
import { SupplierInformation } from "./_components/SupplierInformation";

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
  const products =
    await caller.purchasing.supplierProduct.getSupplierProductsByCompanyId();

  return { suppliers, products };
}

export default function PODetail() {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null
  );
  const fetcher = useFetcher<typeof action>();
  const fetcherSubmit = useFetcher();

  const loaderData = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [POItems, setPOItems] = useState<Item[]>([
    { id: undefined, quantity: "", unit: "pcs", price: "" },
  ]);

  const params = useParams();

  const isReceivedPO = loaderData.status === "RECEIVED";
  useEffect(() => {
    if (isReceivedPO) setSelectedSupplierId(loaderData.supplierId);
  }, []);

  const toggleEditing = () => {
    setIsEditing((prev) => !prev);
    fetcher.submit({}, { method: "post" });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formObject = Object.fromEntries(formData.entries());
    const POItemssArray = POItems.filter(
      (POItems) => POItems.id && POItems.quantity && POItems.price
    ).map((POItems) => ({
      itemId: POItems.id,
      quantity: Number(POItems.quantity.replace(/,/g, "")),
      itemCost: Number(POItems.price.replace(/,/g, "")),
      unit: POItems.unit,
    }));
    const completeData = {
      ...formObject,
      POItems: POItemssArray as {
        itemId: string;
        quantity: number;
        itemCost: number;
        unit: string;
      }[],
    };

    fetcherSubmit.submit(
      { data: JSON.stringify(completeData) },
      {
        method: "post",
        action: "/api/editPO",
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="POId" value={params.POId as string} />
      <input
        type="hidden"
        name="companyId"
        value={params.companyId as string}
      />
      <div className="flex justify-between mb-20 flex-col relative items-center">
        <h1 className="text-2xl font-bold">Purchase Order Details</h1>
        <div className="self-end mr-4 items-center">
          {isEditing ? (
            <>
              <Button
                type="button"
                onClick={() => setIsEditing(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button variant="default" className=" ml-2" type="submit">
                Save Changes
              </Button>
            </>
          ) : (
            <Button type="button" onClick={toggleEditing} variant="default">
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
        <CustomerInformation isEditing={isEditing} loaderData={loaderData} />
        <POItemsInformation
          selectedSupplierId={selectedSupplierId}
          POItems={POItems}
          setPOItems={setPOItems}
          params={params}
          isEditing={isEditing}
          loaderData={loaderData}
        />
      </div>

      <div className="mt-8 ml-16 gap-7 flex">
        <Button onClick={() => navigate(-1)} type="button" variant="secondary">
          Back
        </Button>
      </div>
    </form>
  );
}
