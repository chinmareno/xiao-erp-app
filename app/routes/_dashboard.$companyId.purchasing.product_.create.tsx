import { useEffect, useState } from "react";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
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
import { createCallerWithContext } from "~/server/api/root.server";
import { thousandSeparatorFormatter } from "~/lib/thousandSeparatorFormatter";
import { TRPCError } from "@trpc/server";
import { toast } from "sonner";
import { ItemCategory } from "@prisma/client";
import { createProductSchema } from "~/server/api/routers/purchasing/product";

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
    supplierId,
    itemName,
    price,
    itemImage,
    priceCurrency,
    itemCategory,
  } = result.data;

  try {
    if (itemId) {
      await caller.purchasing.product.createProduct({
        itemId,
        supplierId,
        price,
        itemImage,
        priceCurrency,
        itemCategory,
      });
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
  return redirect("../product");
}

enum ItemCategoryEnum {
  RAW_MATERIAL = "RAW_MATERIAL",
  SUPPORTING_MATERIAL = "SUPPORTING_MATERIAL",
  FINISHED_GOODS = "FINISHED_GOODS",
}

export default function ProductCreate() {
  const actionData = useActionData<typeof action>();

  const loaderData = useLoaderData<typeof loader>();
  const [priceCurrency, setPriceCurrency] = useState("IDR");
  const [addNewItem, setAddNewItem] = useState(false);
  const [itemCategory, setItemCategory] = useState<ItemCategory | "">("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    const errorMessage = actionData?.errors;
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [actionData]);

  return (
    <div className="container mx-auto max-w-lg py-10">
      <h2 className="mb-6 text-center text-xl font-bold">Add Product</h2>
      <Form className="space-y-4" method="POST">
        <div>
          <Label>Supplier</Label>
          <Select name="supplierId" required>
            <SelectTrigger>
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {loaderData.suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Item</Label>
          {!addNewItem ? (
            <>
              <div className="flex gap-2">
                <Select
                  onValueChange={(val) => {
                    const itemCategory = loaderData.products.find(
                      (product) => product.id === val
                    );
                    setItemCategory(itemCategory?.category || "");
                  }}
                  name="itemId"
                  required
                >
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
                  onClick={() => {
                    setAddNewItem(true);
                    setItemCategory("");
                    setPrice("");
                  }}
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
                onClick={() => {
                  setAddNewItem(false);
                  setItemCategory("");
                  setPrice("");
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
        <div>
          <div>
            <Label>Item Category</Label>
            <input
              type="hidden"
              name="itemCategory"
              value={itemCategory || undefined}
            />
            <Select
              name="itemCategory"
              value={itemCategory || undefined}
              onValueChange={(val) => setItemCategory(val as ItemCategory)}
              required
              disabled={!addNewItem}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ItemCategoryEnum.RAW_MATERIAL}>
                  Raw Material
                </SelectItem>
                <SelectItem value={ItemCategoryEnum.SUPPORTING_MATERIAL}>
                  Supporting Material
                </SelectItem>
                <SelectItem value={ItemCategoryEnum.FINISHED_GOODS}>
                  Finished Goods
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
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
