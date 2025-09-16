import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { DBClientType } from "~/types/DBClientType";

export const getSupplierById = async (db: DBClientType, supplierId: string) => {
  try {
    const supplier = await db.supplier.findUnique({
      where: {
        id: supplierId,
      },
    });

    return supplier;
  } catch (error) {
    repositoryErrorLogger({ method: "getSupplierById", error });
    throw error;
  }
};
