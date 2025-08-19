import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form } from "@remix-run/react";
import { Label } from "~/components/ui/label";

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
          <div>
            <Label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="e.g. 苏州一号仓库"
            />
          </div>

          <div>
            <Label
              htmlFor="location"
              className="block text-sm font-medium mb-1"
            >
              Location
            </Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g. Shanghai, China"
            />
          </div>

          <div>
            <Label htmlFor="pic" className="block text-sm font-medium mb-1">
              Person in Charge (PIC)
            </Label>
            <Input id="pic" name="pic" placeholder="e.g. Zhang Wei" />
          </div>

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
