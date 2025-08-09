import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { columns as productColumns } from "./SupplierProductDataTable/columns";
import { DataTable as ProductDataTable } from "./SupplierProductDataTable/data-table";
import { columns as poColumns } from "./SupplierPODataTable/columns";
import { DataTable as PODataTable } from "./SupplierPODataTable/data-table";
import { createCallerWithContext } from "~/api/root.server";
import { Button } from "~/components/ui/button";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const supplierId = params.supplierId as string;
  const companyId = params.companyId as string;

  const caller = await createCallerWithContext(request, companyId);
  const supplierProducts =
    await caller.purchasing.supplier.getSupplierProductsBySupplierId({
      supplierId,
    });
  const supplierPOs =
    await caller.purchasing.supplier.getSupplierPOsBySupplierId({
      supplierId,
    });

  if (supplierProducts === null) throw new Error("Not Found");

  return { ...supplierProducts, POs: supplierPOs };
}

export default function SupplierDetail() {
  const [activeTab, setActiveTab] = useState<"products" | "pos">("products");

  const supplierData = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto py-10">
      <h2 className="mb-6 text-xl text-center font-semibold capitalize">
        {supplierData?.name} Details
      </h2>

      <div className="mb-6 flex border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "products"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("products")}
        >
          Products ({supplierData._count.products})
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "pos"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => {
            setActiveTab("pos");
          }}
        >
          Purchase Orders ({supplierData._count.purchaseOrders})
        </button>
      </div>

      {activeTab === "products" ? (
        <div>
          <div className="flex">
            <h3 className="mb-4 text-lg font-semibold">Supplier Products</h3>
            <Button asChild className="ml-auto mr-4">
              <Link to={"add-product"}>Add Product</Link>
            </Button>
          </div>
          <ProductDataTable
            columns={productColumns}
            data={supplierData.products}
          />
        </div>
      ) : (
        <div>
          <h3 className="mb-4 text-lg font-semibold">Purchase Orders</h3>
          <PODataTable columns={poColumns} data={supplierData.POs} />
        </div>
      )}
    </div>
  );
}
