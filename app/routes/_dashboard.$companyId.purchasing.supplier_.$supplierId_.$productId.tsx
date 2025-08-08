import { useEffect, useState } from "react";
import {
  Form,
  useLoaderData,
  useNavigate,
  useParams,
  useRouteLoaderData,
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
import { createCallerWithContext } from "~/api/root.server";
import { thousandSeparatorFormatter } from "~/lib/thousandSeparatorFormatter";
import { z } from "zod";
import { toast } from "sonner";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const supplierId = params.supplierId as string;
  const companyId = params.companyId as string;

  const caller = await createCallerWithContext(request, companyId);
  const supplierProducts =
    await caller.purchasing.supplier.getSupplierProductsBySupplierId({
      supplierId,
    });
  const suppliersProducts =
    await caller.purchasing.product.getProductsByCompanyId();

  const existingItemIds = new Set(
    supplierProducts.products.map((p) => p.itemId) // adjust field name if it's different
  );
  const filteredSuppliersProducts = suppliersProducts.filter(
    (sp) => !existingItemIds.has(sp.id) // sp.id here is your itemId from getProductsByCompanyId
  );

  if (supplierProducts === null) throw new Error("Not Found");

  return { ...supplierProducts, filteredSuppliersProducts };
}

const EditProductSchema = z.object({
  itemId: z.string().min(1, "Item id is required").optional(),
  itemName: z.string().min(1, "Item name is required").optional(),
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
  const { itemId, itemName, price, priceCurrency } = result.data;
  const normalizedPrice = price.replace(/,/g, "");

  const supplierId = params.supplierId as string;
  const supplierProductId = params.productId as string;

  if (itemId) {
    await caller.purchasing.product.editProduct({
      price: normalizedPrice,
      priceCurrency,
      supplierId,
      supplierProductId,
      itemId,
    });
  } else {
    await caller.purchasing.product.editProduct({
      price: normalizedPrice,
      priceCurrency,
      supplierId,
      supplierProductId,
      itemName,
    });
  }

  return redirect(
    `/${params.companyId}/purchasing/supplier/${params.supplierId}`
  );
}

export default function ProductEdit() {
  const params = useParams();
  const productId = params.productId as string;
  const loaderData = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const selectedProduct = loaderData?.products.find(
    (product) => product.id === productId
  );

  const [priceCurrency, setPriceCurrency] = useState("IDR");
  const [price, setPrice] = useState("");
  const [item, setItem] = useState("");
  const [useExistingItem, setUseExistingItem] = useState(true);

  useEffect(() => {
    if (!selectedProduct || selectedProduct.name === item) return;

    setPriceCurrency(selectedProduct.priceCurrency);
    setItem(selectedProduct.name);
    const isIdr = selectedProduct.priceCurrency === "IDR";

    const formattedValue = thousandSeparatorFormatter(selectedProduct.price);
    isIdr ? setPrice(formattedValue) : setPrice(selectedProduct.price);
  }, [loaderData, selectedProduct]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!selectedProduct) {
      e.preventDefault();
      return toast.error("Invalid Product Id");
    }

    const unchangeName = selectedProduct.name === item.trim();
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
                      setItem(val);
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
                        setItem("");
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
                    value={item}
                    onChange={(e) => setItem(e.currentTarget.value)}
                    placeholder="Enter new item name"
                    required
                  />
                  <p className="text-xs text-muted-foreground italic">
                    To change only the price, use the same item name.{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="text-xs pl-0 text-muted-foreground italic"
                      onClick={() => setItem(selectedProduct?.name || "")}
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
                setItem("");
              }}
            >
              {useExistingItem
                ? "Create New Item Name"
                : "Select Existing Item Name"}
            </Button>

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
                value={
                  priceCurrency === "IDR" ? price.replace(/,/g, "") : price
                }
              />
            </div>

            <Button type="submit" className="w-full">
              Save Product
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
