import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Form } from "@remix-run/react";
import InputWithLabel from "~/components/InputWithLabel";

type CreateWarehouseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateWarehouseDialog({
  open,
  onOpenChange,
}: CreateWarehouseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Warehouse</DialogTitle>
        </DialogHeader>

        <Form method="post" className="space-y-4">
          <InputWithLabel
            id="name"
            label="Name"
            required
            placeholder="e.g. Gudang surabaya"
          />

          <InputWithLabel
            id="location"
            label="Location"
            required
            placeholder="e.g. Shanghai, China"
          />

          <InputWithLabel
            id="pic"
            label="Person in Charge (PIC)"
            required
            placeholder="e.g. Zhang Wei"
          />

          <DialogFooter>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Save
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
