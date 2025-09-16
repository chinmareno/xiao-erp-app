import { DBClientType } from "~/types/DBClientType";

export const getPurchasingOrderItemCountsByPOIds = async (
  db: DBClientType,
  poIds: string[]
) => {
  const poItemCounts = await db.purchaseOrderItem.groupBy({
    by: ["purchaseOrderId"],
    _count: { purchaseOrderId: true },
    where: { purchaseOrderId: { in: poIds } },
  });

  return poItemCounts;
};
