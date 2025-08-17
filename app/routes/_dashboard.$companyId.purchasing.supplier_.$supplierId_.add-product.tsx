import { useEffect, useState } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { formDataParser } from "~/lib/formDataParser";
import { createProductSchema } from "~/api/routers/purchasing/product";
import { createCallerWithContext } from "~/api/root.server";
import { thousandSeparatorFormatter } from "~/lib/thousandSeparatorFormatter";
import { TRPCError } from "@trpc/server";
import { toast } from "sonner";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const companyId = params.companyId as string;

  const caller = await createCallerWithContext(request, companyId);

  const suppliers = await caller.purchasing.supplier.getSuppliersByCompanyId();
  const products = await caller.purchasing.product.getUniqueItemsByCompanyId();
  return { suppliers, products };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const companyId = params.companyId as string;

  const caller = await createCallerWithContext(request, companyId);
  const formData = await formDataParser(request);
  const result = await createProductSchema.safeParseAsync(formData);
  if (!result.success) {
    console.log({ errors: result.error.format() });
    return null;
  }
  const {
    itemId,
    itemName,
    price,
    itemImage,
    priceCurrency,
    supplierId,
    itemCategory,
  } = result.data;

  if (itemId) {
    try {
      await caller.purchasing.product.createProduct({
        itemId,
        supplierId,
        price,
        itemImage,
        priceCurrency,
        itemCategory,
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        if (
          error.message ===
          "This supplier already has a product for the selected item."
        ) {
          return { errors: "This supplier already has this product" };
        }
      } else {
        throw error;
      }
    }
  } else if (itemName) {
    await caller.purchasing.product.createProduct({
      supplierId,
      itemName,
      price,
      itemImage,
      priceCurrency,
      itemCategory,
    });
  }
  return redirect(`/${companyId}/purchasing/supplier/${supplierId}`);
}

export default function ProductCreate() {
  const actionData = useActionData<typeof action>();

  const loaderData = useLoaderData<typeof loader>();
  const [priceCurrency, setPriceCurrency] = useState("IDR");
  const [addNewItem, setAddNewItem] = useState(false);
  const [price, setPrice] = useState("");

  const params = useParams();

  const selectedSupplier = loaderData.suppliers.find(
    (s) => s.id === params.supplierId
  );

  useEffect(() => {
    if (actionData?.errors) {
      if (actionData.errors === "This supplier already has this product") {
        toast.error("This supplier already has this product");
      }
    }
  }, [actionData]);

  return (
    <div className="container mx-auto max-w-lg py-10">
      <h2 className="mb-6 text-center text-xl font-bold">Add Product</h2>
      <Form className="space-y-4" method="POST">
        <div>
          <Label>Supplier</Label>
          <input name="supplierId" type="hidden" value={selectedSupplier?.id} />
          <p className="p-1.5 pl-2 border border-input rounded-md shadow-sm">
            {selectedSupplier?.name}
          </p>
        </div>
        <div>
          <Label>Item</Label>
          {!addNewItem ? (
            <>
              <div className="flex gap-2">
                <Select name="itemId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {loaderData.products.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddNewItem(true)}
                >
                  Add New
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Input required name="itemName" placeholder="New item name" />
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddNewItem(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
        <div>
          <Label>
            <Select
              name="priceCurrency"
              value={priceCurrency}
              onValueChange={(val) => {
                setPriceCurrency(val);
                setPrice("");
              }}
            >
              <SelectTrigger className="pl-0 border-none mb-1 rounded-none shadow-none py-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IDR">Price (IDR)</SelectItem>
                <SelectItem value="YUAN">Price (¥)</SelectItem>
              </SelectContent>
            </Select>
          </Label>
          <Input
            value={price}
            onChange={(e) => {
              const isIdr = priceCurrency === "IDR";
              const formattedValue = thousandSeparatorFormatter(
                e.currentTarget.value
              );
              isIdr
                ? setPrice(formattedValue)
                : setPrice(e.currentTarget.value);
            }}
            onInput={(e) => {
              priceCurrency === "IDR"
                ? (e.currentTarget.value = e.currentTarget.value.replace(
                    /\D/g,
                    ""
                  ))
                : (e.currentTarget.value = e.currentTarget.value
                    .replace(/[^0-9.]/g, "")
                    .replace(/^([0-9]*\.[0-9]*)|\./g, "$1")
                    .replace(/^\./, ""));
            }}
            required
            placeholder="e.g. 12000"
          />
          <input
            type="hidden"
            name="price"
            value={priceCurrency === "IDR" ? price.replace(/,/g, "") : price}
          />
        </div>

        <Button type="submit" className="w-full">
          Save Product
        </Button>
      </Form>
    </div>
  );
}
