import { supplierRouter } from "./supplier";
import { PORouter } from "./PO";
import { createTRPCRouter } from "../../trpc";
import { supplierProductRouter } from "./supplierProduct";

export const purchasingRouter = createTRPCRouter({
  supplier: supplierRouter,
  supplierProduct: supplierProductRouter,
  PO: PORouter,
});
