import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { DBClientType } from "~/types/DBClientType";

export const getPurchasingOrderItemCountsByPOIds = async (
  db: DBClientType,
  poIds: string[]
) => {
  try {
    const poItemCounts = await db.purchaseOrderItem.groupBy({
      by: ["purchaseOrderId"],
      _count: { purchaseOrderId: true },
      where: { purchaseOrderId: { in: poIds } },
    });
    8;

    return poItemCounts;
  } catch (error) {
    repositoryErrorLogger({
      method: "getPurchasingOrderItemCountsByPOIds",
      error,
    });
    throw error;
  }
};

export const getPurchasingOrderItemCountByItemId = async (
  db: DBClientType,
  itemId: string
) => {
  try {
    const poItemCounts = await db.purchaseOrderItem.count({
      where: { itemId },
    });

    return poItemCounts;
  } catch (error) {
    repositoryErrorLogger({
      method: "getPurchasingOrderItemCountByItemId",
      error,
    });
    throw error;
  }
};
