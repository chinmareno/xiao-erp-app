import { useState } from "react";
import { Form, useLoaderData } from "@remix-run/react";
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


export async function loader({ request, params }: LoaderFunctionArgs) {
  const companyId = params.companyId as string;

  const caller = await createCallerWithContext(request, companyId);
  
  const suppliers = await caller.purchasing.supplier.getSuppliersByCompanyId();
  const products = await caller.purchasing.product.getProductsByCompanyId();
  return { suppliers, products };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const companyId = params.companyId as string;

  const caller = await createCallerWithContext(request, companyId);
  const formData = await formDataParser(request);
const result=await createProductSchema.safeParseAsync(formData)
if(!result.success){
  return {errors: result.error.format()}
}
const {itemId, costIdr, costYuan, supplierId, itemName}=result.data

  if (itemId) {
    await caller.purchasing.product.createProduct({
      itemId,
      costIdr: Number(costIdr),
      costYuan: Number(costYuan),
      supplierId,
    });
  } else if (itemName) {
    await caller.purchasing.product.createProduct({
      itemName,
      costIdr: Number(costIdr),
      costYuan: Number(costYuan),
      supplierId,
    });
  }
  return redirect("../product");
}

export default function ProductCreate() {
  const loaderData = useLoaderData<typeof loader>();
  const [itemId, setItemId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [addNewItem, setAddNewItem] = useState(false);

  return (
    <div className="container mx-auto max-w-lg py-10">
      <h2 className="mb-6 text-center text-xl font-bold">Add Product</h2>
      <Form className="space-y-4" method="POST">
        <div>
          <Label>Supplier</Label>
          <Input name="supplierId" value={supplierId} className="hidden" />
          <Select
            name="supplierId"
            value={supplierId}
            onValueChange={setSupplierId}
            required
          >
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
              <Input name="itemName" value={itemId} className="hidden" />
              <div className="flex gap-2">
                <Select
                  name="itemName"
                  value={itemId}
                  onValueChange={setItemId}
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
                  onClick={() => setAddNewItem(true)}
                >
                  Add New
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Input name="itemName" placeholder="New item name" />
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
          <Label>Cost (IDR)</Label>
          <Input
            name="costYuan"
            type="number"
            min="0"
            placeholder="e.g. 12000"
          />
        </div>
        <div>
          <Label>Cost (Yuan)</Label>
          <Input name="costIdr" type="number" min="0" placeholder="e.g. 6" />
        </div>
        <Button type="submit" className="w-full">
          Save Product
        </Button>
      </Form>
    </div>
  );
}
