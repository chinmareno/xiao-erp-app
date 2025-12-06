import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { createCallerWithContext } from "~/server/api/trpc.caller";
import { Button } from "~/components/ui/button";
import { useSupplierDetailStore } from "~/hooks/stores/supplier/useSupplierDetailStore";
import { usePOStatusFilterStore } from "~/hooks/stores/supplier/usePOStatusFilterStore";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useSupplierPOStore } from "~/hooks/stores/supplier/useSupplierPOStore";
import { Plus } from "lucide-react";
import { SupplierPOTable } from "./_components/SupplierPOTable";
import { SupplierProductTable } from "./_components/SupplierProductTable";
import { SupplierPORadio } from "./_components/SupplierPORadio";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const supplierId = params.supplierId as string;
  const companyId = params.companyId as string;

  const caller = await createCallerWithContext(request, companyId);

  const supplier = await caller.purchasing.supplier.getSupplierById({
    supplierId,
  });

  const supplierProducts =
    await caller.purchasing.supplierProduct.getSupplierProductsBySupplierId({
      supplierId,
    });
  const supplierPOs =
    await caller.purchasing.supplier.getSupplierPOsBySupplierId({
      supplierId,
    });

  return { supplier, supplierProducts, supplierPOs };
}

export default function SupplierDetail() {
  const { activeTab, setActiveTab } = useSupplierDetailStore();
  const { selectedStatus, setSelectedStatus } = usePOStatusFilterStore();
  const { setSelectedSupplierPO } = useSupplierPOStore();
  const navigate = useNavigate();

  const params = useParams();

  const loaderData = useLoaderData<typeof loader>();
  const supplier = loaderData.supplier;
  const supplierPOs = loaderData.supplierPOs;
  const supplierProducts = loaderData.supplierProducts;

  const filteredPOs = supplierPOs.filter((po) => {
    if (selectedStatus === "unreceived") return po.status === "UNRECEIVED";
    if (selectedStatus === "received") return po.status === "RECEIVED";
    if (selectedStatus === "inactive") return po.status === "INACTIVE";
    return true;
  });

  return (
    <div className="container mx-auto py-10">
      <h2 className="mb-6 text-xl text-center font-semibold capitalize">
        {`${supplier.name}'s ${
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
          Products ({supplierProducts.length})
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
          Purchase Orders ({supplierPOs.length})
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

          <SupplierProductTable data={supplierProducts} />
        </div>
      ) : (
        <div>
          <div className="flex">
            <SupplierPORadio
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            />

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

          <SupplierPOTable data={filteredPOs} />
        </div>
      )}
    </div>
  );
}
