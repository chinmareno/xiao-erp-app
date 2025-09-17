import { supplierRouter } from "./supplier";
import { PORouter } from "./PO";
import { createTRPCRouter } from "../../trpc.server";
import { supplierProductRouter } from "./supplierProduct";

export const purchasingRouter = createTRPCRouter({
  supplier: supplierRouter,
  supplierProduct: supplierProductRouter,
  PO: PORouter,
});
