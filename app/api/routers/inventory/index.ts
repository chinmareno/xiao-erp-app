import { createTRPCRouter } from "~/api/trpc.server";
import { warehouseRouter } from "./warehouse";

export const inventoryRouter = createTRPCRouter({
  warehouse: warehouseRouter,
});
