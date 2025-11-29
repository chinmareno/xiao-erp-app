import {
  ActionFunctionArgs,
  redirect,
  LoaderFunctionArgs,
} from "@remix-run/node";
import {
  ClientActionFunctionArgs,
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import { createCallerWithContext } from "~/server/api/trpc.caller";
import { useEffect, useState } from "react";
import { z } from "zod";

import { Button } from "~/components/ui/button";

import { SupplierInformation } from "./_components/SupplierInformation";
import { CustomerInformation } from "./_components/CustomerInformation";
import { POHeader } from "./_components/POHeader";
import { ChangePONumberPrefix } from "./_components/ChangePONumberPrefix";
import { Item, POItemsInformation } from "./_components/POItemsInformation";
import { useSupplierPOStore } from "~/hooks/supplier/useSupplierPOStore";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const companyId = params.companyId as string;
  const caller = await createCallerWithContext(request, companyId);

  const suppliers = await caller.purchasing.supplier.getSuppliersByCompanyId();
  const products =
    await caller.purchasing.supplierProduct.getSupplierProductsByCompanyId();
  const POFormat = await caller.purchasing.PO.getPONumberFormatByCompanyId();
  const latestPOCustomerContact =
    await caller.purchasing.PO.getLastPOCustomerContactByCompanyId();

  return { suppliers, products, POFormat, latestPOCustomerContact };
}

const createPOSchema = z.object({
  supplierContactId: z.string().min(1, "Contact is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  customerContactName: z.string().min(1, "Customer contact name is required"),
  customerContactEmail: z.union([
    z.string().email("Invalid email"),
    z.literal(""),
  ]),
  discount: z.coerce.number().min(0).max(99),
  tax: z.coerce.number().min(0).max(99),
  subTotal: z.string().min(1),
  discountTotal: z.string().min(1),
  taxTotal: z.string().min(1),
  grandTotal: z.string().min(1),
  customerContactPhone: z.union([z.string(), z.literal("")]),
  priceCurrency: z.enum(["YUAN", "IDR"]),
  POItems: z
    .array(
      z.object({
        itemId: z.string().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        itemCost: z.number().min(1, "Item cost is required"),
        unit: z.string().min(1, "Unit is required"),
      })
    )
    .min(1, "At least one item is required"),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const companyId = params.companyId as string;
  const formData = await JSON.parse(
    (await request.formData()).get("data") as string
  );

  const result = await createPOSchema.safeParseAsync(formData);

  const caller = await createCallerWithContext(request, companyId);

  if (!result.success) {
    return { errors: result.error.format() };
  }
  const {
    supplierId,
    POItems,
    customerContactEmail,
    customerContactName,
    customerContactPhone,
    priceCurrency,
    supplierContactId,
    discount,
    tax,
    discountTotal,
    grandTotal,
    subTotal,
    taxTotal,
  } = result.data;

  await caller.purchasing.PO.createPO({
    supplierId,
    POItems,
    discount,
    tax,
    customerContactEmail,
    customerContactName,
    customerContactPhone,
    priceCurrency,
    supplierContactId,
    discountTotal,
    grandTotal,
    subTotal,
    taxTotal,
  });

  return redirect(`/${companyId}/purchasing/PO`);
}

export async function clientAction({
  request,
  serverAction,
}: ClientActionFunctionArgs) {
  const requestClone = request.clone();
  const formData = await JSON.parse(
    (await requestClone.formData()).get("data") as string
  );
  const result = await createPOSchema.safeParseAsync(formData);

  if (result.error) {
    console.log({ errors: result.error.format() });
    return { errors: result.error.format() };
  }
  return serverAction<typeof action>();
}

export default function POCreate() {
  const params = useParams();
  const loaderData = useLoaderData<typeof loader>();
  const fetcherPOFormat = useFetcher();
  const submitFetcher = useFetcher();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null
  );
  const [POItems, setPOItems] = useState<Item[]>([
    { id: undefined, quantity: "", unit: "pcs", price: "" },
  ]);

  const { selectedSupplierPO, setSelectedSupplierPO } = useSupplierPOStore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const formObject = Object.fromEntries(formData.entries());

    const POItemsArray = POItems.filter(
      (POItem) => POItem.id && POItem.quantity && POItem.price
    ).map((POItem) => ({
      itemId: POItem.id,
      quantity: Number(POItem.quantity.replace(/,/g, "")),
      itemCost: Number(POItem.price.replace(/,/g, "")),
      unit: POItem.unit,
    }));

    const completeData = {
      ...formObject,
      POItems: POItemsArray as {
        itemId: string;
        quantity: number;
        itemCost: number;
        unit: string;
      }[],
    };

    submitFetcher.submit(
      { data: JSON.stringify(completeData) },
      { method: "POST" }
    );
  };

  useEffect(() => {
    if (selectedSupplierPO) {
      setSelectedSupplierId(selectedSupplierPO);
      setSelectedSupplierPO(null);
    }
  }, []);

  return (
    <>
      <ChangePONumberPrefix fetcherPOFormat={fetcherPOFormat} params={params} />

      <Form onSubmit={handleSubmit}>
        <div className="max-w-6xl mx-auto p-6 border border-blue-200 bg-blue-50">
          <POHeader loaderData={loaderData} fetcherPOFormat={fetcherPOFormat} />

          <SupplierInformation
            companyId={params.companyId}
            selectedSupplierId={selectedSupplierId}
            setSelectedSupplierId={setSelectedSupplierId}
            loaderData={loaderData}
          />

          <CustomerInformation loaderData={loaderData} />

          <POItemsInformation
            params={params}
            selectedSupplierId={selectedSupplierId}
            POItems={POItems}
            setPOItems={setPOItems}
          />
        </div>
        <div className="mt-8 ml-16 gap-7 flex">
          <Button type="button" variant="secondary" asChild>
            <Link to={`/${params.companyId}/purchasing/PO`}>Cancel</Link>
          </Button>
          <Button type="submit" className="bg-blue-600 text-white">
            Submit Purchase Order
          </Button>
        </div>
      </Form>
    </>
  );
}
