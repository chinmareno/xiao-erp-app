import { createTRPCRouter, inventoryProcedure } from "~/api/trpc.server";
import { z } from "zod";
import { eventBus } from "~/events";
import { on } from "events";
// Warehouse name (仓库名称) — e.g. “苏州一号仓库”

// Location (仓库地址/位置) — city, province, or exact location

// PIC (负责人/联系人) — person-in-charge

// Company (公司) — useful

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

  // getWarehouseStockByWarehouseId: inventoryProcedure
  //   .input(z.object({ warehouseId: z.string().min(1) }))
  //   .query(async ({ ctx, input }) => {
  //     const { warehouseId } = input;

  //     return warehouses;
  //   }),

  // addItemToAllWarehouses: inventoryProcedure.subscription(async function* (
  //   opts
  // ) {
  //   // listen for new events
  //   for await (const [data] of on(eventBus, "add", {
  //     // Passing the AbortSignal from the request automatically cancels the event emitter when the request is aborted
  //     signal: opts.signal,
  //   })) {
  //     const post = data;
  //     yield post;
  //   }
  // }),
});
