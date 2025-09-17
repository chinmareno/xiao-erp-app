import { useEffect, useState } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
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
import { createCallerWithContext } from "~/server/api/root.server";
import { thousandSeparatorFormatter } from "~/lib/thousandSeparatorFormatter";
import { z } from "zod";
import { toast } from "sonner";
import { ItemCategory } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const supplierId = params.supplierId as string;
  const companyId = params.companyId as string;

  const caller = await createCallerWithContext(request, companyId);
  const supplierProducts =
    await caller.purchasing.supplier.getSupplierProductsBySupplierId({
      supplierId,
    });
  const suppliersProducts =
    await caller.purchasing.supplierProduct.getProductsByCompanyId();

  const existingItemIds = new Set(
    supplierProducts.products.map((p) => p.itemId)
  );
  const filteredSuppliersProducts = suppliersProducts.filter(
    (sp) => !existingItemIds.has(sp.id)
  );

  if (supplierProducts === null) throw new Error("Not Found");

  return { ...supplierProducts, filteredSuppliersProducts };
}

const EditProductSchema = z.object({
  itemId: z.string().min(1, "Item id is required").optional(),
  itemName: z.string().min(1, "Item name is required").optional(),
  itemCategory: z.nativeEnum(ItemCategory),
  price: z.string().min(0, "Price must be a positive number"),
  priceCurrency: z.string().min(1, "Price currency is required"),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const companyId = params.companyId as string;

  const caller = await createCallerWithContext(request, companyId);
  const formData = await formDataParser(request);
  const result = await EditProductSchema.safeParseAsync(formData);
  if (!result.success) {
    console.log({ errors: result.error.format() });
    return null;
  }
  const { itemId, itemName, price, priceCurrency, itemCategory } = result.data;
  const normalizedPrice = price.replace(/,/g, "");

  const supplierId = params.supplierId as string;
  const supplierProductId = params.productId as string;

  try {
    if (itemId) {
      await caller.purchasing.supplierProduct.editProduct({
        price: normalizedPrice,
        priceCurrency,
        supplierId,
        supplierProductId,
        itemId,
        itemCategory,
      });
    } else {
      await caller.purchasing.supplierProduct.editProduct({
        price: normalizedPrice,
        priceCurrency,
        supplierId,
        supplierProductId,
        itemName,
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

  return redirect(
    `/${params.companyId}/purchasing/supplier/${params.supplierId}`
  );
}

enum ItemCategoryEnum {
  RAW_MATERIAL = "RAW_MATERIAL",
  SUPPORTING_MATERIAL = "SUPPORTING_MATERIAL",
  FINISHED_GOODS = "FINISHED_GOODS",
}

export default function ProductEdit() {
  const actionData = useActionData<typeof action>();

  const params = useParams();
  const productId = params.productId as string;
  const loaderData = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const selectedProduct = loaderData?.products.find(
    (product) => product.id === productId
  );

  const [priceCurrency, setPriceCurrency] = useState("IDR");
  const [price, setPrice] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState<ItemCategory | "">("");
  const [useExistingItem, setUseExistingItem] = useState(true);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!selectedProduct) {
      e.preventDefault();
      return toast.error("Invalid Product Id");
    }

    const unchangeName = selectedProduct.name === itemName.trim();
    const unchangeItemPriceCurrency =
      selectedProduct.priceCurrency === priceCurrency;
    const normalizedOldPrice = selectedProduct.price;
    const normalizedNewPrice = price.replace(/,/g, "");
    const unchangeItemPrice = normalizedOldPrice === normalizedNewPrice;

    if (unchangeName && unchangeItemPriceCurrency && unchangeItemPrice) {
      e.preventDefault();
      return navigate(
        `/${params.companyId}/purchasing/supplier/${params.supplierId}`
      );
    }
  };

  useEffect(() => {
    if (actionData?.errors) {
      if (actionData.errors === "This supplier already has this product") {
        toast.error("This supplier already has this product");
      }
    }
  }, [actionData]);

  return (
    <div className="container mx-auto py-10">
      <h2 className="mb-6 text-center text-xl font-bold">Edit Product</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border rounded-lg p-4 bg-muted">
          <h3 className="font-semibold mb-4">
            Previous {loaderData.name}'s Product Info
          </h3>
          {selectedProduct ? (
            <ul className="space-y-2">
              <li>
                <strong>Name:</strong> {selectedProduct.name}
              </li>
              <li>
                <strong>Price:</strong>{" "}
                {selectedProduct.priceCurrency === "IDR"
                  ? `Rp ${thousandSeparatorFormatter(selectedProduct.price)}`
                  : `¥${selectedProduct.price}`}
              </li>
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No product found</p>
          )}
        </div>

        <div>
          <Form method="POST" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Supplier</Label>
              <p>{loaderData?.name}</p>
            </div>

            <div>
              <Label>Item Name</Label>
              {useExistingItem ? (
                <>
                  <Select
                    required
                    name="itemId"
                    onValueChange={(val) => {
                      const itemCategory =
                        loaderData.filteredSuppliersProducts.find(
                          (product) => val === product.id
                        );
                      setItemCategory(itemCategory?.category || "");
                    }}
                  >
                    <SelectTrigger className="mb-1">
                      <SelectValue placeholder="Select an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {loaderData.filteredSuppliersProducts.map((item) => {
                        return (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground italic">
                    To change only the price by using the same item name{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="text-xs pl-0 text-muted-foreground italic"
                      onClick={() => {
                        setUseExistingItem((prev) => !prev);
                        setItemName("");
                      }}
                    >
                      click here.
                    </Button>
                  </p>
                </>
              ) : (
                <>
                  <Input
                    name="itemName"
                    value={itemName}
                    onChange={(e) => setItemName(e.currentTarget.value)}
                    placeholder="Enter new item name"
                    required
                  />
                  <p className="text-xs text-muted-foreground italic">
                    To change only the price, use the same item name.{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="text-xs pl-0 text-muted-foreground italic"
                      onClick={() => {
                        setItemName(selectedProduct?.name || "");
                        setPriceCurrency(selectedProduct?.priceCurrency || "");
                        setItemCategory(selectedProduct?.category || "");
                      }}
                    >
                      click here to auto-fill it.
                    </Button>{" "}
                  </p>
                </>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              className="mb-2"
              onClick={() => {
                setUseExistingItem((prev) => !prev);
                setItemName("");
                setItemCategory("");
                setPrice("");
              }}
            >
              {useExistingItem
                ? "Create New Item Name"
                : "Select Existing Item Name"}
            </Button>
            <div>
              <Label>Item Category</Label>
              <Select
                value={itemCategory}
                onValueChange={(val) => setItemCategory(val as ItemCategory)}
                name="itemCategory"
                required
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
            <div>
              <Label>
                <Select
                  name="priceCurrency"
                  value={priceCurrency}
                  onValueChange={(val) => {
                    setPriceCurrency(val);
                    setPrice("");
                  }}
                  required
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
                value={
                  priceCurrency === "IDR" ? price.replace(/,/g, "") : price
                }
                required
              />
            </div>

            <Button
              disabled={!selectedProduct}
              type="submit"
              className="w-full"
            >
              Save Product
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
