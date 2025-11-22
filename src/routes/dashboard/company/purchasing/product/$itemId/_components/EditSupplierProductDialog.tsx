import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
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
import { useEffect, useState } from "react";
import { useSubmit } from "@remix-run/react";
import { thousandSeparatorFormatter } from "~/lib/thousandSeparatorFormatter";

type Props = {
  supplierName: string;
  itemName: string;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  initialCurrency: string;
  initialPrice: string;
  supplierId: string;
  itemId: string;
};

export function EditSupplierProductDialog({
  supplierName,
  itemName,
  initialCurrency,
  initialPrice,
  openDialog,
  setOpenDialog,
  supplierId,
  itemId,
}: Props) {
  const [priceCurrency, setPriceCurrency] = useState(initialCurrency);
  const [price, setPrice] = useState(initialPrice);
  const submit = useSubmit();
  const handleSave = () => {
    const numberPrice =
      priceCurrency === "IDR" ? price.replace(/,/g, "") : price;

    submit(
      { supplierId, price: Number(numberPrice), priceCurrency, itemId },
      { method: "POST" }
    );
    setOpenDialog(false);
  };

  useEffect(() => {
    if (openDialog) {
      if (initialPrice !== price) {
        setPrice(initialPrice);
      }
      if (initialCurrency !== price) {
        setPriceCurrency(initialCurrency);
      }
    }
  }, [initialPrice, initialCurrency, openDialog]);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Edit Product Price</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Supplier Name</Label>
            <p className="text-gray-700">{supplierName}</p>
          </div>

          <div>
            <Label>Item Name</Label>
            <p className="text-gray-700">{itemName}</p>
          </div>

          <div>
            <Label>Currency</Label>
            <Select
              value={priceCurrency}
              onValueChange={(val) => {
                setPriceCurrency(val);
                setPrice("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IDR">(IDR)</SelectItem>
                <SelectItem value="YUAN">(¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Price {priceCurrency === "IDR" ? "(IDR)" : "(¥)"}</Label>
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
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
