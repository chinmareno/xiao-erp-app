import {
  ActionFunctionArgs,
  redirect,
  LoaderFunctionArgs,
} from "@remix-run/node";
import {
  ClientActionFunctionArgs,
  Form,
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
  useParams,
  useRevalidator,
  useRouteLoaderData,
} from "@remix-run/react";
import { createCallerWithContext } from "~/api/root.server";
import { useState } from "react";
import { formDataParser } from "~/lib/formDataParser";
import { set, z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { CompanyIdLoader } from "../_dashboard.$companyId";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import InputWithLabel from "~/components/InputWithLabel";
import { Label } from "~/components/ui/label";
import { useKeyboard } from "~/lib/useKeyboard";
import { data } from "@remix-run/node";
import { SupplierInformation } from "./SupplierInformation";
import { CustomerInformation } from "./CustomerInformation";
import { POHeader } from "./POHeader";
import { ChangePONumberPrefix } from "./ChangePONumberPrefix";
import { ItemsInformation, type PurchaseOrderItem } from "./ItemsInformation";
import { Test } from "./Test";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const companyId = params.companyId as string;
  const caller = await createCallerWithContext(request, companyId);

  const suppliers = await caller.purchasing.supplier.getSuppliersByCompanyId();
  const products = await caller.purchasing.product.getProductsByCompanyId();
  const POFormat = await caller.purchasing.PO.getPONumberFormatByCompanyId();

  return { suppliers, products, POFormat };
}

const createPOSchema = z.object({
  supplierName: z.string().min(1, "Supplier name is required"),
  supplierAdress: z.string(),
  PONumber: z.string().min(1, "PO Number is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  expectedFullReceivedDate: z.date().optional(),
  costIn: z.enum(["YUAN", "IDR"]),
  items: z
    .array(
      z.object({
        supplierProductId: z.string().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        itemCost: z.number().min(1, "Cost in IDR must be positive"),
      })
    )
    .min(1, "At least one item is required"),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const companyId = params.companyId as string;
  const formData = await formDataParser(request);

  const caller = await createCallerWithContext(request, companyId);

  const result = await createPOSchema.safeParseAsync(formData);

  if (!result.success) {
    return { errors: result.error.format() };
  }
  const { PONumber, supplierId, expectedFullReceivedDate, items, costIn } =
    result.data;

  await caller.purchasing.PO.createPO({
    PONumber,
    supplierId,
    expectedFullReceivedDate,
    items,
    costIn,
  });

  return redirect(`/${companyId}/purchasing/PO`);
}

// export async function clientAction({
//   request,
//   serverAction,
// }: ClientActionFunctionArgs) {
//   const requestClone = request.clone();
//   const formData = await formDataParser(requestClone);
//   console.log(formData);
//   return null;

//   const result = await createPOSchema.safeParseAsync(formData);
//   if (result.error) return { errors: result.error.format() };
//   return serverAction<typeof action>();
// }

export default function POCreate() {
  const params = useParams();
  const loaderData = useLoaderData<typeof loader>();
  const fetcherPOFormat = useFetcher();

  const [items, setItems] = useState<PurchaseOrderItem[]>([
    {
      id: crypto.randomUUID(),
      supplierProductId: "",
      quantity: 1,
      itemCost: 0,
    },
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        supplierProductId: "",
        quantity: 1,
        itemCost: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleUpdateItem = (
    id: string,
    field: keyof PurchaseOrderItem,
    value: any
  ) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const calculateTotal = () => {
    return items.reduce(
      (total, item) => total + item.quantity * item.itemCost,
      0
    );
  };

  return (
    <>
      <ChangePONumberPrefix fetcherPOFormat={fetcherPOFormat} params={params} />
      <Form method="POST">
        <div className="max-w-6xl mx-auto p-6 border border-blue-200 bg-blue-50">
          <POHeader loaderData={loaderData} fetcherPOFormat={fetcherPOFormat} />

          <SupplierInformation loaderData={loaderData} params={params} />

          <CustomerInformation />
          <Test />

          <ItemsInformation
            items={items}
            products={loaderData.products}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onUpdateItem={handleUpdateItem}
            calculateTotal={calculateTotal}
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
