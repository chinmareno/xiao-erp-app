import { createTRPCRouter } from "~/api/trpc.server";
import { supplierRouter } from "./supplier";
import { productRouter } from "./product";
import { PORouter } from "./PO";

export const purchasingRouter = createTRPCRouter({
  supplier: supplierRouter,
  product: productRouter,
  PO: PORouter,
});
