import { ActionFunctionArgs } from "@remix-run/node";
import { createCallerWithContext } from "~/api/root.server";
import { formDataParser } from "~/lib/formDataParser";

export type AddSupplierContact = {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactNotes: string;
  supplierId: string;
  companyId: string;
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = (await formDataParser(request)) as AddSupplierContact;
  const caller = await createCallerWithContext(request, formData.companyId);

  await caller.purchasing.supplier.addSupplierContact({
    supplierId: formData.supplierId,
    contactName: formData.contactName,
    contactPhone: formData.contactPhone,
    contactEmail: formData.contactEmail,
    contactNotes: formData.contactNotes,
  });

  return null;
}
