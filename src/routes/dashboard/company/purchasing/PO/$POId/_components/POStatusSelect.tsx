import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { type loader } from "../_dashboard.$companyId.purchasing.PO_.$POId.route";
import { useFetcher } from "@remix-run/react";
import { toast } from "sonner"; // or your toast library
import { Label } from "~/components/ui/label";

type Props = {
  loaderData: Awaited<ReturnType<typeof loader>>;
};

type POStatus = "UNRECEIVED" | "RECEIVED" | "INACTIVE";

const POStatusSelect = ({ loaderData }: Props) => {
  const [selectedStatus, setSelectedStatus] = useState<POStatus | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const fetcher = useFetcher<{ success: true }>();

  const currentStatus = loaderData.status;

  const getDialogContent = () => {
    const next = selectedStatus;
    if (!next) return { title: "", description: "" };

    if (currentStatus === "UNRECEIVED" && next === "RECEIVED") {
      return {
        title: "Change PO Status",
        description:
          "Are you sure you want to change UNRECEIVED to RECEIVED? This action is irreversible.",
      };
    }
    if (currentStatus === "UNRECEIVED" && next === "INACTIVE") {
      return {
        title: "Mark PO as Inactive",
        description:
          "This PO will no longer appear in any reports, but will still exist in the system.",
      };
    }
    if (currentStatus === "RECEIVED" && next === "INACTIVE") {
      return {
        title: "Change Not Allowed",
        description: "You cannot mark a RECEIVED PO as INACTIVE.",
      };
    }
    if (currentStatus === "RECEIVED" && next === "UNRECEIVED") {
      return {
        title: "Change Not Allowed",
        description: "You cannot revert a RECEIVED PO back to UNRECEIVED.",
      };
    }
    if (currentStatus === "INACTIVE" && next === "UNRECEIVED") {
      return {
        title: "Reactivate PO",
        description: "This will make the PO active again as UNRECEIVED.",
      };
    }
    if (currentStatus === "INACTIVE" && next === "RECEIVED") {
      return {
        title: "Change Not Allowed",
        description:
          "You cannot mark an INACTIVE PO as RECEIVED. Please reactivate it as UNRECEIVED first.",
      };
    }
    return { title: "", description: "" };
  };

  const handleStatusChange = (val: POStatus) => {
    setSelectedStatus(val);
    setDialogOpen(true);
  };

  const confirmChange = () => {
    if (!selectedStatus) return;
    fetcher.submit(
      {
        status: selectedStatus,
        POId: loaderData.id,
        companyId: loaderData.companyId,
      },
      { method: "POST", action: "/api/changeStatusPO" }
    );
    setDialogOpen(false);
  };

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success) {
        toast.success("PO status updated successfully");
      } else {
        toast.error("Failed to update PO status");
      }
    }
  }, [fetcher.state, fetcher.data]);

  const { title, description } = getDialogContent();

  return (
    <div>
      <div className="flex flex-col gap-2">
        <Label className="font-medium ml-1 whitespace-nowrap">PO Status</Label>
        <Select
          onValueChange={(val) => handleStatusChange(val as POStatus)}
          value={currentStatus}
        >
          <SelectTrigger
            className={`w-64 border-none shadow-none ${
              currentStatus === "UNRECEIVED" && "bg-yellow-100 text-yellow-800"
            } ${
              currentStatus === "RECEIVED" && "bg-green-100 text-green-800"
            } ${currentStatus === "INACTIVE" && "bg-red-100 text-red-800"}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UNRECEIVED">UNRECEIVED</SelectItem>
            <SelectItem value="RECEIVED">RECEIVED</SelectItem>
            <SelectItem value="INACTIVE">INACTIVE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <button
              className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </button>
            {!title.includes("Not Allowed") && (
              <button
                onClick={confirmChange}
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                {fetcher.state === "submitting" ? "Saving..." : "OK"}
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POStatusSelect;
