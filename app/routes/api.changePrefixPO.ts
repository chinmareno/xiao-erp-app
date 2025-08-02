import { ActionFunctionArgs } from "@remix-run/node";
import { ClientActionFunctionArgs } from "@remix-run/react";
import { z } from "zod";
import { createCallerWithContext } from "~/api/root.server";
import { formDataParser } from "~/lib/formDataParser";

export async function action({ request }: ActionFunctionArgs) {
  const formData = (await formDataParser(request)) as {
    prefix: string;
    companyId: string;
  };

  const caller = await createCallerWithContext(request, formData.companyId);
  const result = await caller.purchasing.PO.changePONumberFormat({
    prefix: formData.prefix,
  });

  return result;
}
