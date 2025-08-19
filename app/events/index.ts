// events/eventBus.ts
import { EventEmitter } from "events";
import { PurchasingEvents } from "./purchasingEvent";
import { db } from "~/lib/db.server";

export type AppEvents = PurchasingEvents;

class AppEventBus {
  private emitter = new EventEmitter();

  emit<K extends keyof AppEvents>(event: K, payload: AppEvents[K]) {
    this.emitter.emit(event as string, payload);
  }

  on<K extends keyof AppEvents>(
    event: K,
    handler: (payload: AppEvents[K]) => void
  ) {
    this.emitter.on(event as string, handler);
  }
}

export const eventBus = new AppEventBus();

eventBus.on("item:created", async ({ supplierProductId, companyId }) => {
  const warehouseIds = await db.warehouse
    .findMany({
      where: { companyId },
      select: { id: true },
    })
    .then((ws) => ws.map((w) => w.id));

  if (warehouseIds.length === 0) return;

  const stockItems = warehouseIds.map((warehouseId) => ({
    warehouseId,
    supplierProductId,
    quantity: 0,
    costIdr: 0,
    costYuan: 0,
  }));

  await db.stockItem.createMany({
    data: stockItems,
    skipDuplicates: true,
  });
});
