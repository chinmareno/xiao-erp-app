import { useEffect, useState } from "react";
import {
  MODULES_SUBMODULES,
  ModulesType,
} from "../../../../../../constants/companyModules";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";

type Props = {
  permission: ModulesType[];
  setPermission: (permission: ModulesType[]) => void;
  onConfirm: (permission: ModulesType[]) => void;
};

const PERMISSIONS = Object.keys(MODULES_SUBMODULES) as ModulesType[];

export default function InviteLinkConfigDialog({
  permission,
  setPermission,
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ModulesType[]>([]);

  const togglePermission = (perm: ModulesType) => {
    setSelected((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleConfirm = () => {
    setPermission(selected);
    onConfirm(selected);
    setOpen(false);
  };
  useEffect(() => {
    if (!open) setSelected(permission);
  }, [open]);

  return (
    <>
      <Button
        variant={"outline"}
        className="w-1/2 text-black mt-1 place-self-center"
        onClick={() => setOpen(true)}
      >
        Config Roles
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Permissions</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 my-4">
            {PERMISSIONS.map((perm) => (
              <div key={perm} className="flex items-center space-x-2">
                <Checkbox
                  id={perm}
                  checked={selected.includes(perm)}
                  onCheckedChange={() => togglePermission(perm)}
                />
                <Label htmlFor={perm}>{perm}</Label>
              </div>
            ))}
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
