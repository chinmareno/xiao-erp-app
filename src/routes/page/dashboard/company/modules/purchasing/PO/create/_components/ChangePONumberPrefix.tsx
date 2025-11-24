import type { FetcherWithComponents, Params } from "@remix-run/react";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { useKeyboard } from "~/lib/useKeyboard";

type Props = {
  params: Readonly<Params<string>>;
  fetcherPOFormat: FetcherWithComponents<unknown>;
};

export const ChangePONumberPrefix = ({ fetcherPOFormat, params }: Props) => {
  const [prefixPO, setPrefixPO] = useState("");
  const submitRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = () =>
    fetcherPOFormat.submit(
      {
        prefix: prefixPO,
        companyId: params.companyId as string,
      },
      { method: "POST", action: "/api/changePrefixPO" }
    );

  useKeyboard(() => {
    if (prefixPO.length === 0) return;
    submitRef.current?.click();
  }, "Enter");

  return (
    <div className="w-full justify-end flex">
      <Dialog onOpenChange={() => setPrefixPO("")}>
        <DialogTrigger className="mb-5 bg-zinc-50" asChild>
          <Button variant="outline">Change PO Number Prefix</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>P.O. Number Prefix</DialogTitle>
            <DialogDescription>
              This new Prefix will only affect new P.O. being created.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center">
            <Input
              value={prefixPO}
              onChange={(e) => setPrefixPO(e.currentTarget.value)}
              className="text-end pr-1 text-sm"
            />
            <p className="text-sm">‑XXXXXX</p>
          </div>
          <DialogFooter className="justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                disabled={prefixPO.length === 0}
                onClick={handleSubmit}
                ref={submitRef}
              >
                Save
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
