import { createTRPCRouter, inventoryProcedure } from "../../trpc";
import { z } from "zod";

export const warehouseRouter = createTRPCRouter({
  createWarehouse: inventoryProcedure
    .input(
      z.object({
        name: z.string().min(1, "Warehouse name is required"),
        location: z.string(),
        pic: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, location, pic } = input;

      const newWarehouse = await ctx.db.warehouse.create({
        data: {
          name,
          location: location.trim() === "" ? null : location,
          pic: pic.trim() === "" ? null : pic,
          companyId: ctx.companyId,
        },
        select: { id: true },
      });

      return newWarehouse.id;
    }),

  getWarehouses: inventoryProcedure.query(async ({ ctx }) => {
    const warehouses = await ctx.db.warehouse.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
    });

    return warehouses;
  }),
});
