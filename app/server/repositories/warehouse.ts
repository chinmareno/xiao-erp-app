import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { DBClientType } from "~/types/DBClientType";

export const getWarehousesByCompanyId = async (
  db: DBClientType,
  companyId: string
) => {
  try {
    const warehouses = await db.warehouse.findMany({
      where: { companyId },
    });

    return warehouses;
  } catch (error) {
    repositoryErrorLogger({
      method: "getWarehousesByCompanyId",
      error,
    });
    throw error;
  }
};
