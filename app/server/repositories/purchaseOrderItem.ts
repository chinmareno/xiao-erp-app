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

    return poItemCounts;
  } catch (error) {
    repositoryErrorLogger({
      method: "getPurchasingOrderItemCountsByPOIds",
      error,
    });
    throw error;
  }
};
