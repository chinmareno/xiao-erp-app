import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Trash2, Plus } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  code?: string; // Made optional since it might not be available from the API
  sku?: string; // Alternative field that might contain the code
}

export interface PurchaseOrderItem {
  id: string;
  supplierProductId: string;
  quantity: number;
  itemCost: number;
}

interface ItemsInformationProps {
  items: PurchaseOrderItem[];
  products: Product[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (
    id: string,
    field: keyof PurchaseOrderItem,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) => void;
  calculateTotal: () => number;
}

export function ItemsInformationTest({
  items,
  products,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  calculateTotal,
}: ItemsInformationProps) {
  return (
    <div className="mt-6">
      {/* Items Header */}
      <div className="bg-blue-600 text-white p-3 font-semibold">ITEMS</div>

      {/* Items Table */}
      <div className="border border-blue-200 bg-white">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 p-3 bg-blue-100 border-b border-blue-200 font-semibold text-sm">
          <div className="col-span-1">Code</div>
          <div className="col-span-4">Product Description</div>
          <div className="col-span-2">Quantity</div>
          <div className="col-span-2">Unit Price</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-1">Action</div>
        </div>

        {/* Items Rows */}
        {items.map((item, index) => {
          const selectedProduct = products.find(
            (p) => p.id === item.supplierProductId
          );
          const amount = item.quantity * item.itemCost;

          return (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-2 p-3 border-b border-blue-100 items-center"
            >
              {/* Code */}
              <div className="col-span-1">
                <span className="text-sm text-gray-600">
                  {selectedProduct?.code || selectedProduct?.sku || "-"}
                </span>
              </div>

              {/* Product Description */}
              <div className="col-span-4">
                <Select
                  value={item.supplierProductId}
                  onValueChange={(value) =>
                    onUpdateItem(item.id, "supplierProductId", value)
                  }
                  name={`items[${index}].supplierProductId`}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="col-span-2">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    onUpdateItem(
                      item.id,
                      "quantity",
                      parseInt(e.target.value) || 1
                    )
                  }
                  name={`items[${index}].quantity`}
                  className="w-full"
                />
              </div>

              {/* Unit Price */}
              <div className="col-span-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.itemCost}
                  onChange={(e) =>
                    onUpdateItem(
                      item.id,
                      "itemCost",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  name={`items[${index}].itemCost`}
                  className="w-full"
                />
              </div>

              {/* Amount */}
              <div className="col-span-2">
                <div className="p-2 bg-gray-50 rounded text-right font-medium">
                  {amount.toLocaleString("id-ID")}
                </div>
              </div>

              {/* Action */}
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                  disabled={items.length === 1}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {/* Add Item Button */}
        <div className="p-3 border-t border-blue-200">
          <Button
            type="button"
            variant="outline"
            onClick={onAddItem}
            className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* Total Section */}
        <div className="bg-blue-50 p-3 border-t border-blue-200">
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total Amount (IDR):</span>
                <span className="text-blue-600">
                  {calculateTotal().toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
