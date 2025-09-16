import { DBClientType } from "~/types/DBClientType";
import { getSupplierById } from "../repositories/supplier";

export const findSupplierBySupplierId = async (
  db: DBClientType,
  supplierId: string
) => {
  const supplier = await getSupplierById(db, supplierId);

  return supplier;
};
