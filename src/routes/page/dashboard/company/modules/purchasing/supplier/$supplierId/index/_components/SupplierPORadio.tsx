import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { POStatus } from "~/hooks/stores/supplier/usePOStatusFilterStore";

type Props = {
  selectedStatus: POStatus;
  setSelectedStatus: (status: POStatus) => void;
};

export const SupplierPORadio = ({
  selectedStatus,
  setSelectedStatus,
}: Props) => {
  return (
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
  );
};
