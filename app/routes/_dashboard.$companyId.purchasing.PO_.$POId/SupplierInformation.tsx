import { useEffect, useMemo, useState } from "react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import InputWithLabel from "~/components/InputWithLabel";
import { Label } from "~/components/ui/label";
import { FetcherWithComponents, useFetcher, useParams } from "@remix-run/react";
import { z } from "zod";
import { type loader, type action } from "./route";

type createPOFetcher = FetcherWithComponents<{
  suppliers: ({
    contact: {
      name: string;
      id: string;
      email: string | null;
      createdAt: Date;
      updatedAt: Date;
      notes: string | null;
      supplierId: string;
      phone: string | null;
    }[];
  } & {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    companyId: string;
    address: string;
    taxId: string | null;
    notes: string | null;
  })[];
  products: {
    id: string;
    name: string;
    supplierCount: number;
    priceRangeIDR: string | null;
    priceRangeYUAN: string | null;
  }[];
}>;

type SupplierContact = {
  id: string;
  supplierId: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
};

type Supplier = {
  id: string;
  name: string;
  address: string;
  contact: SupplierContact[];
};

type Props = {
  loaderData: Awaited<ReturnType<typeof loader>>;
  POCreateLoaderData?: Awaited<ReturnType<typeof action>>;
  isEditing: boolean;
  selectedSupplierId: string | null;
  setSelectedSupplierId: React.Dispatch<React.SetStateAction<string | null>>;
  createPOFetcher: createPOFetcher;
};

type ContactErrors = {
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
};

export const SupplierInformation = ({
  loaderData,
  isEditing,
  selectedSupplierId,
  setSelectedSupplierId,
  POCreateLoaderData,
  createPOFetcher,
}: Props) => {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [selectedContact, setSelectedContact] =
    useState<SupplierContact | null>(null);
  const [openContactDialog, setOpenContactDialog] = useState(false);
  const [contactErrors, setContactErrors] = useState<ContactErrors | null>(
    null
  );

  const fetcher = useFetcher();
  const params = useParams();

  const supplierMap = useMemo(() => {
    return new Map(POCreateLoaderData?.suppliers.map((s) => [s.id, s]));
  }, [POCreateLoaderData?.suppliers]);

  const contactMap = useMemo(() => {
    if (!selectedSupplier) return new Map();
    return new Map(selectedSupplier.contact.map((c) => [c.id, c]));
  }, [selectedSupplier]);

  const handleSupplierChange = (supplierId: string) => {
    const supplier = supplierMap.get(supplierId);

    if (supplier) {
      setSelectedSupplier(supplier);
      setSelectedContact(null);
    }
  };

  const handleContactChange = (contactId: string) => {
    const contact = contactMap.get(contactId);
    if (contact) {
      setSelectedContact(contact);
    }
  };

  useEffect(() => {
    if (
      isEditing &&
      selectedSupplier?.id === loaderData.supplierId &&
      !selectedContact
    ) {
      handleContactChange(loaderData.supplierContactId);
    }
  }, [contactMap]);

  useEffect(() => {
    if (isEditing) {
      setSelectedSupplierId(loaderData.supplierId);
      handleSupplierChange(loaderData.supplierId);
    }
  }, [isEditing, POCreateLoaderData?.suppliers]);

  useEffect(() => {
    if (selectedSupplier?.id && fetcher.state === "idle") {
      if (fetcher.data !== null) {
        const { errors } = fetcher.data as {
          errors: z.ZodFormattedError<
            {
              supplierId: string;
              contactName: string;
              contactPhone: string;
              contactEmail: string;
              contactNotes: string;
            },
            string
          >;
        };
        setContactErrors({
          contactEmail: errors.contactEmail?._errors[0],
          contactName: errors.contactName?._errors[0],
          contactPhone: errors.contactPhone?._errors[0],
        });
      } else {
        setContactErrors(null);
        const supplier = supplierMap.get(selectedSupplier.id);
        setSelectedSupplier(supplier || null);
        setOpenContactDialog(false);
        createPOFetcher.submit({}, { method: "post" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.formData]);

  return !isEditing ? (
    <div className="border border-gray-300">
      <div className="bg-blue-900 text-white px-4 py-2">
        <h3 className="font-semibold text-sm">SUPPLIER INFORMATION</h3>
      </div>
      <div className="grid grid-cols-2 border-b border-gray-300">
        <div className="p-3 border-r border-gray-300">
          <div className="text-xs text-gray-600 mb-1">SUPPLIER NAME</div>
          <div className="text-sm bg-white py-3 pl-2">
            {loaderData.supplierName}
          </div>
        </div>
        <div className="p-3">
          <div className="text-xs text-gray-600 mb-1">CONTACT PERSON</div>
          <div className="text-sm bg-white py-3 pl-2">
            {loaderData.supplierContactName}
          </div>
        </div>
      </div>
      <div className="p-3 border-b border-gray-300">
        <div className="text-xs text-gray-600 mb-1">ADDRESS</div>
        <div className="text-sm pl-2 py-3 bg-white">
          {loaderData.supplierAdress}
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="p-3 border-r border-gray-300">
          <div className="text-xs text-gray-600 mb-1">PHONE NUMBER</div>
          <div className="text-sm py-3 pl-2 bg-white">
            {loaderData.supplierContactPhone}
          </div>
        </div>
        <div className="p-3">
          <div className="text-xs text-gray-600 mb-1">EMAIL ADDRESS</div>
          <div className="text-sm py-3 pl-2 bg-white">
            {loaderData.supplierContactEmail}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="border border-gray-300">
      <div className="bg-blue-900 text-white px-4 py-2">
        <h3 className="font-semibold text-sm">SUPPLIER INFORMATION</h3>
      </div>
      <div className="grid grid-cols-2 border-b border-gray-300">
        <div className="p-3 border-r border-gray-300">
          <div className="text-xs text-gray-600 mb-1">SUPPLIER NAME</div>
          <Select
            value={selectedSupplierId || undefined}
            onValueChange={(value) => {
              setSelectedSupplierId(value);
              handleSupplierChange(value);
            }}
            name="supplierId"
            required
          >
            <SelectTrigger className="w-full border-0 bg-white rounded-none shadow-none py-3 pl-2 h-auto">
              <SelectValue placeholder="Select a supplier" />
            </SelectTrigger>
            <SelectContent>
              {POCreateLoaderData?.suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="p-3">
          <div className="text-xs text-gray-600 mb-1">CONTACT PERSON</div>
          <Select
            value={selectedContact?.id || undefined}
            onValueChange={(value) => {
              handleContactChange(value);
            }}
            name="supplierContactId"
            required
          >
            <SelectTrigger className="w-full border-0 bg-white rounded-none shadow-none py-3 pl-2 h-auto">
              <SelectValue placeholder="Select contact" />
            </SelectTrigger>
            <SelectContent className="max-h-48">
              {selectedSupplier?.contact?.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.name}
                </SelectItem>
              ))}
              {selectedSupplier && (
                <Dialog
                  open={openContactDialog}
                  onOpenChange={setOpenContactDialog}
                >
                  <DialogTrigger
                    onClick={() => setOpenContactDialog(true)}
                    asChild
                  >
                    <div className="border-t border-gray-200 my-1 cursor-pointer px-2 py-1.5 text-sm hover:bg-blue-100 text-blue-600">
                      + Add new contact
                    </div>
                  </DialogTrigger>
                  <DialogContent
                    onXIconClick={() => setOpenContactDialog(false)}
                    className="sm:max-w-md"
                  >
                    <DialogHeader>
                      <DialogTitle>Supplier Contact</DialogTitle>
                      <DialogDescription>
                        Fill in the contact details for the selected supplier.
                      </DialogDescription>
                    </DialogHeader>
                    <div>
                      <fetcher.Form
                        method="POST"
                        action="/api/addSupplierContact"
                      >
                        <input
                          type="hidden"
                          name="supplierId"
                          value={selectedSupplier.id}
                        />
                        <input
                          type="hidden"
                          name="companyId"
                          value={params.companyId as string}
                        />
                        <InputWithLabel
                          id="contactName"
                          label="Contact name"
                          error={contactErrors?.contactName}
                        />
                        <Label
                          htmlFor="contactPhone"
                          className="text-sm font-medium"
                        >
                          Phone Number
                        </Label>
                        <Input
                          name="contactPhone"
                          onInput={(e) => {
                            e.currentTarget.value =
                              e.currentTarget.value.replace(
                                /[^0-9+\-() ]/g,
                                ""
                              );
                          }}
                        />
                        <p className="text-xs text-muted-foreground italic">
                          Include country code for international numbers.
                        </p>
                        <p className="text-sm text-red-600">
                          {contactErrors?.contactPhone}
                        </p>
                        <InputWithLabel
                          id="contactEmail"
                          label="Email"
                          error={contactErrors?.contactEmail}
                        />
                        <InputWithLabel
                          id="contactNotes"
                          label="Notes"
                          inputClassName=" pt-2 text-wrap pb-20"
                          multiline
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            className="bg-blue-600 text-white"
                          >
                            Add new contact
                          </Button>
                          <Button
                            onClick={() => setOpenContactDialog(false)}
                            type="button"
                            variant="secondary"
                          >
                            Close
                          </Button>
                        </div>
                      </fetcher.Form>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="p-3 border-b border-gray-300">
        <div className="text-xs text-gray-600 mb-1">ADDRESS</div>
        <div className="text-sm pl-2 py-3 bg-white">
          {selectedSupplier?.address || "-"}
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="p-3 border-r border-gray-300">
          <div className="text-xs text-gray-600 mb-1">PHONE NUMBER</div>
          <div className="text-sm py-3 pl-2 bg-white">
            {selectedContact?.phone || "-"}
          </div>
        </div>
        <div className="p-3">
          <div className="text-xs text-gray-600 mb-1">EMAIL ADDRESS</div>
          <div className="text-sm py-3 pl-2 bg-white">
            {selectedContact?.email || "-"}
          </div>
        </div>
      </div>
    </div>
  );
};
