import { ActionFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { createCallerWithContext } from "~/server/api/root.server";
import { formDataParser } from "~/lib/formDataParser";

const changeStatusPOSchema = z.object({
  status: z.enum(["UNRECEIVED", "RECEIVED", "INACTIVE"]),
  POId: z.string().min(1),
  companyId: z.string().min(1),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await formDataParser(request);
  const parsed = await changeStatusPOSchema.safeParseAsync(formData);

  if (!parsed.success) {
    console.log({ error: parsed.error.format() });
    return {
      error: parsed.error.format(),
    };
  }

  const { status, POId, companyId } = parsed.data;

  const caller = await createCallerWithContext(request, companyId);
  await caller.purchasing.PO.changePOStatusByPOId({
    POId,
    status,
  });

  return { success: true };
}
