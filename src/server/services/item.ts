import { TRPCError } from "@trpc/server";
import { serviceErrorLogger } from "~/lib/logger/serviceErrorLogger";
import { DBClientType } from "~/types/DBClientType";
import { getSupplierProductCountByItemId } from "../repositories/supplierProduct";
import { getPurchasingOrderItemCountByItemId } from "../repositories/purchaseOrderItem";

export const findRemainingItemConnectionsByItemId = async (
  db: DBClientType,
  itemId: string
) => {
  const isExisting = db.item.findUnique({ where: { id: itemId } });
  if (!isExisting) {
    serviceErrorLogger({
      method: "findRemainingItemConnectionsByItemId",
      error: `Item with id ${itemId} not found during Find remaining item connections by item id`,
    });
    throw new TRPCError({ code: "NOT_FOUND" });
  }
  const supplierProductConnection = await getSupplierProductCountByItemId(
    db,
    itemId
  );
  const purchasingOrderItemConnection =
    await getPurchasingOrderItemCountByItemId(db, itemId);

  const remainingItemConnections =
    supplierProductConnection + purchasingOrderItemConnection;

  return remainingItemConnections;
};
