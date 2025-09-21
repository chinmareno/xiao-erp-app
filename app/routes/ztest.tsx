import { LoaderFunctionArgs } from "@remix-run/node";
import { createCallerWithContext } from "~/server/api/root.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const caller = await createCallerWithContext(request);
  return await caller.test.supplierProductSumamry();
};
