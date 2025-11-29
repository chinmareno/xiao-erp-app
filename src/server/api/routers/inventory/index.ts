import { createTRPCRouter } from "../../trpc";
import { warehouseRouter } from "./warehouse";

export const inventoryRouter = createTRPCRouter({
  warehouse: warehouseRouter,
});
