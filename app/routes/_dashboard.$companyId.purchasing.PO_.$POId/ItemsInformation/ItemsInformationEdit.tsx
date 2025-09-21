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
import { useEffect, useState } from "react";
import { thousandSeparatorFormatter } from "~/lib/thousandSeparatorFormatter";
import { type Params, useFetcher } from "@remix-run/react";
import { GetSupplierProductsBySupplierIdActionData } from "../../api.getSupplierProductsBySupplierId";

export type Item = {
  id: string | undefined;
  quantity: string;
  unit: string;
  price: string;
};

type SupplierProducts = GetSupplierProductsBySupplierIdActionData;

type Props = {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  selectedSupplierId: string | null;
  params: Readonly<Params<string>>;
};

export const ItemsInformationEdit = ({
  items,
  setItems,
  selectedSupplierId,
  params,
}: Props) => {
  const [priceCurrency, setPriceCurrency] = useState("IDR");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [supplierProduct, setSupplierProduct] = useState<SupplierProducts>([]);

  const fetcherSupplierProducts = useFetcher();

  useEffect(() => {
    if (!selectedSupplierId) return;
    setItems([{ id: undefined, quantity: "", unit: "pcs", price: "" }]);
    fetcherSupplierProducts.submit(
      {
        supplierId: selectedSupplierId,
        companyId: params.companyId as string,
      },
      { action: "/api/getSupplierProductsBySupplierId", method: "POST" }
    );
  }, [selectedSupplierId]);

  useEffect(() => {
    if (
      fetcherSupplierProducts.data &&
      fetcherSupplierProducts.state === "idle"
    ) {
      const products =
        fetcherSupplierProducts.data as GetSupplierProductsBySupplierIdActionData;
      setSupplierProduct(products);
    }
  }, [fetcherSupplierProducts.formData]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: undefined,
        quantity: "",
        unit: "pcs",
        price: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    const itemCopy = [...items];
    itemCopy.splice(index, 1);
    setItems(itemCopy);
  };

  const handleSelectItem = (index: number, value: string) => {
    const selectedItem = supplierProduct.find((i) => i.itemId === value);

    if (!selectedItem) return;

    if (selectedItem.priceCurrency === priceCurrency) {
      const isIDR = priceCurrency === "IDR";
      const formattedValue = thousandSeparatorFormatter(selectedItem.price);

      if (isIDR) {
        setItems((prev) =>
          prev.map((item, i) => {
            if (i === index) {
              return { ...item, id: value, price: formattedValue };
            }
            return item;
          })
        );
      } else {
        setItems((prev) =>
          prev.map((item, i) => {
            if (i === index) {
              return { ...item, id: value, price: selectedItem.price };
            }
            return item;
          })
        );
      }
    } else {
      setItems((prev) =>
        prev.map((item, i) => {
          if (i === index) {
            return { ...item, id: value };
          }
          return item;
        })
      );
    }
  };

  const handleInputQuantity = (index: number, value: string) => {
    const formattedValue = thousandSeparatorFormatter(value);
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
    const isIDR = priceCurrency === "IDR";
    const formattedValue = thousandSeparatorFormatter(value);

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

  const itemTotalParser = (itemPrice: string, itemQuantity: string) => {
    if (!itemPrice || !itemQuantity) return "0";
    const isIDR = priceCurrency === "IDR";

    const price = isIDR
      ? Number(itemPrice.replace(/,/g, ""))
      : parseFloat(itemPrice);

    const quantity = Number(itemQuantity.replace(/,/g, ""));

    const total = isIDR
      ? thousandSeparatorFormatter(String(price * quantity))
      : String(price * quantity);

    return total;
  };

  const subTotalParser = () => {
    const total = items.reduce((acc, item) => {
      if (!item.price || !item.quantity) return acc;
      const itemPrice = item.price.replace(/,/g, "");

      const itemQuantity = item.quantity.replace(/,/g, "");

      const price =
        priceCurrency === "IDR" ? Number(itemPrice) : parseFloat(itemPrice);

      const quantity = Number(itemQuantity);
      return acc + price * quantity;
    }, 0);

    return priceCurrency === "IDR"
      ? thousandSeparatorFormatter(String(total))
      : String(total);
  };

  const discountParser = () => {
    const subtotal = subTotalParser().replace(/,/g, "");
    const discountAmount = Math.ceil((Number(subtotal) * discount) / 100);

    return priceCurrency === "IDR"
      ? thousandSeparatorFormatter(String(discountAmount))
      : String(discountAmount);
  };

  const taxParser = () => {
    const subtotal = subTotalParser().replace(/,/g, "");
    const discountAmount = Math.ceil((Number(subtotal) * discount) / 100);
    const taxAmount = Math.ceil(
      ((Number(subtotal) - discountAmount) * tax) / 100
    );

    return priceCurrency === "IDR"
      ? thousandSeparatorFormatter(String(taxAmount))
      : String(taxAmount);
  };

  const totalParser = () => {
    const subtotal = subTotalParser().replace(/,/g, "");
    const discountAmount = Math.ceil((Number(subtotal) * discount) / 100);

    const taxAmount = Math.ceil(
      ((Number(subtotal) - discountAmount) * tax) / 100
    );

    const total = Number(subtotal) - discountAmount + taxAmount;

    return priceCurrency === "IDR"
      ? thousandSeparatorFormatter(String(Math.ceil(total)))
      : String(total);
  };

  return (
    <div>
      <div className="bg-blue-900 text-white p-3 font-semibold">ITEMS</div>

      <div className="border border-blue-200 bg-white">
        <div className="grid  items-center grid-cols-12 gap-2 p-3 bg-blue-100 border-b border-blue-200 font-semibold text-sm">
          <div className="col-span-1 ">No.</div>

          <div className="col-span-2">Name</div>

          <div className="col-span-2">Quantity</div>

          <div className="col-span-2">Unit</div>

          <div className="col-span-2">
            <Select
              name="priceCurrency"
              value={priceCurrency}
              onValueChange={(val) => handleSelectCurrency(val)}
            >
              <SelectTrigger className="pl-0 rounded-none shadow-none py-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IDR">Price (IDR)</SelectItem>
                <SelectItem value="YUAN">Price (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 text-right mr-3 self-center">
            {priceCurrency === "IDR" ? "Total (IDR)" : "Total (¥)"}
          </div>

          <div className="col-span-1 self-center">Action</div>
        </div>
      </div>

      <div className="border">
        {items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-12 gap-2 p-3 text-sm border-b border-blue-800"
          >
            <div className="col-span-1 self-center">{`${index + 1})`}</div>

            <div className="col-span-2">
              <Select
                name="itemId"
                required
                value={item.id}
                onValueChange={(val) => handleSelectItem(index, val)}
              >
                <SelectTrigger className="border-none rounded-none pl-1 shadow-none py-2">
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {supplierProduct.map((product, index) => {
                    const isSelected = items.some(
                      (i) => i.id === product.itemId
                    );

                    return (
                      <SelectItem
                        className={isSelected ? "hidden" : ""}
                        key={product.itemName + index}
                        value={product.itemId}
                      >
                        {product.itemName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Input
                name="itemQuantity"
                required
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
                name="itemUnit"
                required
                className="border-none rounded-none pl-1 shadow-none py-2"
                value={item.unit}
                onChange={(e) => handleInputUnit(index, e.currentTarget.value)}
                placeholder="Unit"
              />
            </div>
            <div className="col-span-2">
              <Input
                name="itemPrice"
                required
                className="border-none rounded-none pl-1 shadow-none py-2"
                value={item.price}
                placeholder="Enter Price"
                onChange={(e) => handleInputPrice(index, e.currentTarget.value)}
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
              />
            </div>
            <div className="col-span-2 mr-3 text-right self-center">
              <p> {itemTotalParser(item.price, item.quantity)}</p>
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

        <div className="flex mt-5">
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="flex items-center mb-4 mr-80 ml-4 gap-2 text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>

          <div className="ml-auto mr-3 flex flex-col text-right divide-y-2 items-center">
            <p className="font-semibold items-center w-full grid-cols-4 grid text-lg">
              <span className="col-span-1 text-left">
                Subtotal {priceCurrency === "IDR" ? "(IDR)" : "(¥)"}
              </span>
              <span className="col-span-3 pr-1 ml-auto my-2">
                {subTotalParser()}
              </span>
              <input name="subTotal" type="hidden" value={subTotalParser()} />
            </p>

            <p className="grid-cols-4 grid items-center w-full text-lg">
              <span className="col-span-1 text-left my-2"> Discount (%)</span>
              <Input
                name="discount"
                onChange={(e) => setDiscount(Number(e.currentTarget.value))}
                placeholder="Enter Discount"
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value
                    .replace(/[^0-9.]/g, "")
                    .replace(/(\..*?)\..*/g, "$1");
                }}
                maxLength={5}
                className="col-span-1 text-lg flex pr-1 border-none rounded-none pl-1 shadow-none py-2"
              />
              <span className="col-span-2">{discountParser()}</span>
              <input
                name="discountTotal"
                type="hidden"
                value={discountParser()}
              />
            </p>

            <p className="ml-auto w-full items-center text-lg grid-cols-4 grid">
              <span className="col-span-1 text-left my-2"> Tax (%)</span>
              <Input
                name="tax"
                onChange={(e) => setTax(Number(e.currentTarget.value))}
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value
                    .replace(/[^0-9.]/g, "")
                    .replace(/(\..*?)\..*/g, "$1");
                }}
                maxLength={5}
                placeholder="Enter Tax"
                className="col-span-1 pr-1 text-lg border-none rounded-none pl-1 shadow-none py-2"
              />
              <span className="col-span-2 ">{taxParser()}</span>
              <input name="taxTotal" type="hidden" value={taxParser()} />
            </p>
            <p className="ml-auto w-full items-center grid-cols-3 grid font-semibold text-lg">
              <span className="col-span-1 text-left my-2">Total Amount</span>
              <span className="col-span-2 pr-1 ml-auto">{totalParser()}</span>
              <input name="grandTotal" type="hidden" value={totalParser()} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
