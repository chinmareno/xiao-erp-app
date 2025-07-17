import { createTRPCRouter } from "~/.server/trpc.server";
import { supplierRouter } from "./supplier";

export const purchasingRouter = createTRPCRouter({
  supplier: supplierRouter,
});
