import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { columns as productColumns } from "./SupplierProductDataTable/columns";
import { DataTable as ProductDataTable } from "./SupplierProductDataTable/data-table";
import { columns as poColumns } from "./SupplierPODataTable/columns";
import { DataTable as PODataTable } from "./SupplierPODataTable/data-table";
import { createCallerWithContext } from "~/server/api/root.server";
import { Button } from "~/components/ui/button";
import { useSupplierDetailStore } from "~/hooks/useSupplierDetailStore";
import { usePOStatusFilterStore } from "~/hooks/usePOStatusFilterStore";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useSupplierPOStore } from "~/hooks/useSupplierPOStore";
import { Plus } from "lucide-react";

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
  const { activeTab, setActiveTab } = useSupplierDetailStore();
  const { selectedStatus, setSelectedStatus } = usePOStatusFilterStore();
  const { setSelectedSupplierPO } = useSupplierPOStore();
  const navigate = useNavigate();

  const params = useParams();

  const supplierData = useLoaderData<typeof loader>();

  const filteredPOs = supplierData.POs.filter((po) => {
    if (selectedStatus === "unreceived") return po.status === "UNRECEIVED";
    if (selectedStatus === "received") return po.status === "RECEIVED";
    if (selectedStatus === "inactive") return po.status === "INACTIVE";
    return true;
  });

  return (
    <div className="container mx-auto py-10">
      <h2 className="mb-6 text-xl text-center font-semibold capitalize">
        {`${supplierData.name}'s ${
          activeTab === "pos" ? "Purchasing Orders" : "Products Catalog"
        } Table`}
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
            <Button
              onClick={() => navigate("add-product")}
              className="ml-auto mb-2 mr-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Add Product</span>
            </Button>
          </div>
          <ProductDataTable
            columns={productColumns}
            data={supplierData.products}
          />
        </div>
      ) : (
        <div>
          <div className="flex">
            <RadioGroup className="mb-4" defaultValue={selectedStatus}>
              <div className="flex items-center gap-3">
                <RadioGroupItem
                  onClick={() => setSelectedStatus("unreceived")}
                  value="unreceived"
                  id="unreceived"
                />
                <Label htmlFor="unreceived">Unreceivable</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem
                  onClick={() => setSelectedStatus("received")}
                  value="received"
                  id="received"
                />
                <Label htmlFor="received">Received</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem
                  onClick={() => setSelectedStatus("inactive")}
                  value="inactive"
                  id="inactive"
                />
                <Label htmlFor="inactive">Inactive</Label>
              </div>
            </RadioGroup>
            <Button
              className="mb-4 ml-auto self-end inline-flex items-center gap-2 rounded-md bg-blue-600 py-0 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              onClick={() => {
                setSelectedSupplierPO(params.supplierId as string);
                navigate(`/${params.companyId}/purchasing/PO/create`);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Add PO</span>
            </Button>
          </div>
          <PODataTable columns={poColumns} data={filteredPOs} />
        </div>
      )}
    </div>
  );
}
