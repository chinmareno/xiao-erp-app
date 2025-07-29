import { ActionFunctionArgs, redirect } from "@remix-run/node";
import {
  ClientActionFunctionArgs,
  Form,
  useActionData,
  useLoaderData,
  useRouteLoaderData,
} from "@remix-run/react";
import { createCallerWithContext } from "~/api/root.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useMemo, useState } from "react";
import { formDataParser } from "~/lib/formDataParser";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { useKeyboard } from "~/lib/useKeyboard";
import { Button } from "~/components/ui/button";
import { CompanyIdLoader } from "./_dashboard.$companyId";
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

export async function loader({ request, params }: LoaderFunctionArgs) {
  const companyId = params.companyId as string;
  const caller = await createCallerWithContext(request, companyId);

  const suppliers = await caller.purchasing.supplier.getSuppliersByCompanyId();
  const products = await caller.purchasing.product.getProductsByCompanyId();
  const POFormat = await caller.purchasing.PO.getPONumberFormatByCompanyId();

  return { suppliers, products, POFormat };
}

const createPOSchema = z.object({
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

export async function clientAction({
  request,
  serverAction,
}: ClientActionFunctionArgs) {
  const requestClone = request.clone();
  const formData = await formDataParser(requestClone);

  const result = await createPOSchema.safeParseAsync(formData);
  if (result.error) return { errors: result.error.format() };
  return serverAction<typeof action>();
}

interface SupplierContact {
  id: string;
  supplierId: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Supplier {
  id: string;
  name: string;
  address: string;
  contact: SupplierContact[];
}

export default function POCreate() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const companyLoaderData = useRouteLoaderData<CompanyIdLoader>(
    "routes/_dashboard.$companyId"
  );
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [selectedContact, setSelectedContact] =
    useState<SupplierContact | null>(null);

  const supplierMap = useMemo(() => {
    return new Map(
      loaderData.suppliers.map((supplier) => [supplier.id, supplier])
    );
  }, [loaderData.suppliers]);

  const contactMap = useMemo(() => {
    if (!selectedSupplier) return new Map();
    return new Map(
      selectedSupplier.contact.map((contact) => [contact.id, contact])
    );
  }, [selectedSupplier]);

  const handleSupplierChange = (supplierId: string) => {
    const supplier = supplierMap.get(supplierId);
    if (supplier) {
      setSelectedSupplier(supplier);
      setSelectedContact(null);
    }
  };

  const handleContactChange = (contactId: string) => {
    const contact = contactMap.get(contactId);
    if (contact) {
      setSelectedContact(contact);
    }
  };

  return (
    <>
      <div className="w-full justify-end flex">
        <Dialog>
          <DialogTrigger className="mb-5 bg-zinc-50" asChild>
            <Button variant="outline">Change PO Number Prefix</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>P.O. Number Prefix</DialogTitle>
              <DialogDescription>
                This new Prefix will only affect new P.O. being created.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center">
              <Input className="text-end text-sm" />
              <p className="ml-1 text-sm mt-1">-000001</p>
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="max-w-6xl mx-auto p-6 bg-blue-50">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-900">PURCHASE ORDER</h1>
          </div>

          <div>
            <div className="border border-gray-300 min-w-[300px]">
              <div className="grid grid-cols-2">
                <div className="bg-blue-900 text-white px-4 py-2 text-xs font-semibold text-center">
                  P.O. NUMBER
                </div>
                <div className="bg-blue-900 text-white px-4 py-2 text-xs font-semibold text-center">
                  ISSUED DATE
                </div>
              </div>
              <div className="grid grid-cols-2">
                <div className="px-4 py-2 text-center border-r border-gray-300 text-gray-900 bg-white">
                  <div className="text-sm font-bold">{loaderData.POFormat}</div>
                </div>
                <div className="px-4 py-2 text-center bg-white">
                  <div className="text-sm text-gray-700">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Form className="space-y-6">
          <div className="border border-gray-300">
            <div className="bg-blue-900 text-white px-4 py-2">
              <h3 className="font-semibold text-sm">SUPPLIER INFORMATION</h3>
            </div>
            <div className="grid grid-cols-2 border-b border-gray-300">
              <div className="p-3 border-r border-gray-300">
                <div className="text-xs text-gray-600 mb-1">SUPPLIER NAME</div>
                <Select
                  onValueChange={(value) => {
                    handleSupplierChange(value);
                  }}
                  name="supplierId"
                  required
                >
                  <SelectTrigger className="w-full border-0 p-0 h-auto">
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {loaderData.suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3">
                <div className="text-xs text-gray-600 mb-1">CONTACT</div>
                <Select
                  onValueChange={(value) => {
                    handleContactChange(value);
                  }}
                  name="contactId"
                  required
                >
                  <SelectTrigger className="w-full border-0 p-0 h-auto">
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedSupplier?.contact?.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-3 border-b border-gray-300">
              <div className="text-xs text-gray-600 mb-1">ADDRESS</div>
              <div className="text-sm">{selectedSupplier?.address || "-"}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="p-3 border-r border-gray-300">
                <div className="text-xs text-gray-600 mb-1">CONTACT NO</div>
                <div className="text-sm">{selectedContact?.phone || "-"}</div>
              </div>
              <div className="p-3">
                <div className="text-xs text-gray-600 mb-1">EMAIL ADDRESS</div>
                <div className="text-sm">{selectedContact?.email || "-"}</div>
              </div>
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="border border-gray-300">
            <div className="bg-blue-900 text-white px-4 py-2">
              <h3 className="font-semibold text-sm">CUSTOMER INFORMATION</h3>
            </div>
            <div className="grid grid-cols-2 border-b border-gray-300">
              <div className="p-3 border-r border-gray-300">
                <div className="text-xs text-gray-600 mb-1">CUSTOMER NAME</div>
                <div className="text-sm font-medium">
                  {companyLoaderData?.userSelectedCompany?.name || "Loading..."}
                </div>
              </div>
              <div className="p-3">
                <div className="text-xs text-gray-600 mb-1">CONTACT PERSON</div>
                <Input type="text" placeholder="Contact Person" />
              </div>
            </div>
            <div className="p-3 border-b border-gray-300">
              <div className="text-xs text-gray-600 mb-1">ADDRESS</div>
              <div className="text-sm">
                {companyLoaderData?.userSelectedCompany?.address ||
                  "Loading..."}
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="p-3 border-r border-gray-300">
                <div className="text-xs text-gray-600 mb-1">CONTACT NO</div>
                <Input type="text" placeholder="Contact Number" />
              </div>
              <div className="p-3">
                <div className="text-xs text-gray-600 mb-1">EMAIL ADDRESS</div>
                <Input type="email" placeholder="Email Address" />
              </div>
            </div>
          </div>

          {/* Placeholder for remaining sections */}
          <div className="text-center py-8 text-gray-500">
            Items table and totals section will be added next...
          </div>
        </Form>
      </div>
    </>
  );
}
