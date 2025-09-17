import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { DBClientType } from "~/types/DBClientType";

type CreateManyStockItemType = {
  warehouseId: string;
  supplierProductId: string;
  quantity: number;
  costIdr: number;
  costYuan: number;
}[];

export const createManyStockItem = async (
  db: DBClientType,
  stockItems: CreateManyStockItemType
) => {
  try {
    await db.stockItem.createMany({
      data: stockItems,
      skipDuplicates: true,
    });
  } catch (error) {
    repositoryErrorLogger({
      method: "createManyStockItem",
      error,
    });
    throw error;
  }
};
