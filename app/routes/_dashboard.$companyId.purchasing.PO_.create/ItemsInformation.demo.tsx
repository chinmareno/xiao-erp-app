import { useState, useCallback } from "react";
import {
  ItemsInformation,
  Product,
  PurchaseOrderItem,
} from "./ItemsInformation";

// Mock data for products
const mockProducts: Product[] = [
  { id: "1", name: "Wireless Earbuds", sku: "SKU12345" },
  { id: "2", name: "Bluetooth Speaker", sku: "SKU12346" },
  { id: "3", name: "Smart Watch", sku: "SKU12347" },
  { id: "4", name: "Phone Case", sku: "SKU12348" },
  { id: "5", name: "Screen Protector", sku: "SKU12349" },
];

// Initial mock items
const initialItems: PurchaseOrderItem[] = [
  { id: "1", supplierProductId: "1", quantity: 2, itemCost: 250000 },
  { id: "2", supplierProductId: "3", quantity: 1, itemCost: 1200000 },
];

export function ItemsInformationDemo() {
  const [items, setItems] = useState<PurchaseOrderItem[]>(initialItems);
  const [products] = useState<Product[]>(mockProducts);

  // Handle adding a new item
  const handleAddItem = useCallback(() => {
    const newId = (items.length + 1).toString();
    setItems([
      ...items,
      {
        id: newId,
        supplierProductId: products[0]?.id || "",
        quantity: 1,
        itemCost: 0,
      },
    ]);
  }, [items, products]);

  // Handle removing an item
  const handleRemoveItem = useCallback(
    (id: string) => {
      setItems(items.filter((item) => item.id !== id));
    },
    [items]
  );

  // Handle updating an item
  const handleUpdateItem = useCallback(
    (id: string, field: keyof PurchaseOrderItem, value: any) => {
      setItems(
        items.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        )
      );
    },
    [items]
  );

  // Calculate total amount
  const calculateTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.itemCost, 0);
  }, [items]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Purchase Order Items Demo</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <ItemsInformation
          items={items}
          products={products}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onUpdateItem={handleUpdateItem}
          calculateTotal={calculateTotal}
        />
      </div>

      {/* Debug panel */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Debug Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Current Items State:</h3>
            <pre className="text-xs p-2 bg-gray-100 rounded overflow-auto h-40">
              {JSON.stringify(items, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-medium mb-2">Available Products:</h3>
            <pre className="text-xs p-2 bg-gray-100 rounded overflow-auto h-40">
              {JSON.stringify(products, null, 2)}
            </pre>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-medium mb-2">
            Current Total: IDR {calculateTotal().toLocaleString("id-ID")}
          </h3>
        </div>
      </div>
    </div>
  );
}

export default ItemsInformationDemo;
