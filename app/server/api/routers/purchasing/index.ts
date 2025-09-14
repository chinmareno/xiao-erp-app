import { supplierRouter } from "./supplier";
import { productRouter } from "./product";
import { PORouter } from "./PO";
import { createTRPCRouter } from "../../trpc.server";

export const purchasingRouter = createTRPCRouter({
  supplier: supplierRouter,
  product: productRouter,
  PO: PORouter,
});
