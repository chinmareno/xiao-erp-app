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
import { useState } from "react";
import { useKeyboard } from "~/lib/useKeyboard";
import { thousandSeparatoFormatter } from "~/lib/thousandSeparatoFormatter";

export type Item = {
  name: string;
  quantity: string;
  unit: string;
  price: string;
  total: number;
};

const supplierProduct = [
  { id: "1", name: "Wireless Earbuds", sku: "SKU12345" },
  { id: "2", name: "Bluetooth Speaker", sku: "SKU12346" },
  { id: "3", name: "Smart Watch", sku: "SKU12347" },
  { id: "4", name: "Phone Case", sku: "SKU12348" },
  { id: "5", name: "Screen Protector", sku: "SKU12349" },
];

export const Test = () => {
  const [items, setItems] = useState<Item[]>([
    { name: "", quantity: "", unit: "pcs", price: "", total: 0 },
  ]);
  const [priceCurrency, setPriceCurrency] = useState("idr");

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { name: "", quantity: "", unit: "pcs", price: "", total: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    const itemCopy = [...items];
    itemCopy.splice(index, 1);
    setItems(itemCopy);
  };

  const handleSelectItem = (index: number, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return { ...item, name: value };
        }
        return item;
      })
    );
  };

  const handleInputQuantity = (index: number, value: string) => {
    const formattedValue = thousandSeparatoFormatter(value);
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return { ...item, quantity: formattedValue };
        }
        return item;
      })
    );
  };

  const handleInputUnit = (index: number, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return { ...item, unit: value };
        }
        return item;
      })
    );
  };

  const handleInputPrice = (index: number, value: string) => {
    const isIDR = priceCurrency === "idr";
    const formattedValue = thousandSeparatoFormatter(value);

    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return { ...item, price: isIDR ? formattedValue : value };
        }
        return item;
      })
    );
  };

  const handleSelectCurrency = (value: string) => {
    setPriceCurrency(value);
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        price: "",
      }))
    );
  };

  const totalParser = (itemPrice: string, itemQuantity: string) => {
    if (!itemPrice || !itemQuantity) return "0";
    const isIDR = priceCurrency === "idr";
    const price = isIDR
      ? Number(itemPrice.replace(/\./g, ""))
      : parseFloat(itemPrice);
    console.log(price);
    const quantity = Number(itemQuantity.replace(/\./g, ""));

    const total = isIDR
      ? thousandSeparatoFormatter(String(price * quantity))
      : String(price * quantity);

    return total;
  };

  useKeyboard(() => console.log(items));

  return (
    <div>
      {/* Items Header */}
      <div className="bg-blue-600 text-white p-3 font-semibold">ITEMS</div>

      {/* Items Table */}
      <div className="border border-blue-200 bg-white">
        {/* Table Header */}
        <div className="grid  items-center grid-cols-12 gap-2 p-3 bg-blue-100 border-b border-blue-200 font-semibold text-sm">
          <div className="col-span-1 ">No.</div>
          <div className="col-span-2">Name</div>
          <div className="col-span-2">Quantity</div>
          <div className="col-span-2">Unit</div>
          <div className="col-span-2">
            <Select
              value={priceCurrency}
              onValueChange={(val) => handleSelectCurrency(val)}
            >
              <SelectTrigger className="pl-0 rounded-none shadow-none py-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idr">Price (IDR)</SelectItem>
                <SelectItem value="yuan">Price (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 self-center">
            {priceCurrency === "idr" ? "Total (IDR)" : "Total (¥)"}
          </div>
          <div className="col-span-1 self-center">Action</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="border">
        {items.map((item, index) => (
          <div
            key={item.name + index}
            className="grid grid-cols-12 gap-2 p-3 text-sm border-b border-blue-800"
          >
            <div className="col-span-1 self-center">{`${index + 1})`}</div>

            <div className="col-span-2">
              <Select
                value={item.name}
                onValueChange={(val) => handleSelectItem(index, val)}
              >
                <SelectTrigger className="border-none rounded-none pl-0 shadow-none py-2">
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {supplierProduct.map((product) => (
                    <SelectItem key={product.sku} value={product.name}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Input
                className="border-none rounded-none pl-1 shadow-none py-2"
                value={item.quantity}
                onChange={(e) =>
                  handleInputQuantity(index, e.currentTarget.value)
                }
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(
                    /\D/g,
                    ""
                  );
                }}
                placeholder="Enter Quantity"
              />
            </div>

            <div className="col-span-2">
              <Input
                className="border-none rounded-none pl-1 shadow-none py-2"
                value={item.unit}
                onChange={(e) => handleInputUnit(index, e.currentTarget.value)}
                placeholder="Unit"
              />
            </div>
            <div className="col-span-2">
              <Input
                className="border-none rounded-none pl-1 shadow-none py-2"
                value={item.price}
                placeholder="Enter Price"
                onChange={(e) => handleInputPrice(index, e.currentTarget.value)}
                onInput={(e) => {
                  priceCurrency === "idr"
                    ? (e.currentTarget.value = e.currentTarget.value.replace(
                        /\D/g,
                        ""
                      ))
                    : (e.currentTarget.value = e.currentTarget.value
                        .replace(/[^0-9.]/g, "")
                        .replace(/^([0-9]*\.[0-9]*)|\./g, "$1")
                        .replace(/^\./, ""));
                }}
              />
            </div>
            <div className="col-span-2 self-center">
              <p>{totalParser(item.price, item.quantity)}</p>
            </div>
            <div className="col-span-1">
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length <= 1}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 " />
              </Button>
            </div>
          </div>
        ))}
        <div className="p-3 border-t border-blue-200" />
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          className="flex items-center mb-4 ml-4 gap-2 text-blue-600 border-blue-300 hover:bg-blue-50"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>
    </div>
  );
};
