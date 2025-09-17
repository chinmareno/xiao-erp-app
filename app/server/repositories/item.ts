import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { DBClientType } from "~/types/DBClientType";

type CreateItemWithSupplierProductType = {
  name: string;
  category: "RAW_MATERIAL" | "SUPPORTING_MATERIAL" | "FINISHED_GOODS";
  companyId: string;
  supplierId: string;
  price: string;
  priceCurrency: string;
};

export const createItemWithSupplierProduct = async (
  db: DBClientType,
  {
    name,
    category,
    companyId,
    supplierId,
    price,
    priceCurrency,
  }: CreateItemWithSupplierProductType
) => {
  try {
    const { supplierProducts } = await db.item.create({
      data: {
        name,
        category,
        companyId,
        supplierProducts: {
          create: { supplierId, price, priceCurrency },
        },
      },
      select: { supplierProducts: { select: { id: true } } },
    });
    const supplierProductId = supplierProducts[0].id;

    return supplierProductId;
  } catch (error) {
    repositoryErrorLogger({
      method: "createItemWithSupplierProduct",
      error,
    });
    throw error;
  }
};

export const getItemByIdAndSupplierId = async (
  db: DBClientType,
  { itemId, supplierId }: { itemId: string; supplierId: string }
) => {
  try {
    const item = await db.item.findFirst({
      where: { id: itemId, supplierProducts: { some: { supplierId } } },
    });

    return item;
  } catch (error) {
    repositoryErrorLogger({
      method: "getItemByIdAndSupplierId",
      error,
    });
    throw error;
  }
};

export const getItemByCompanyId = async (
  db: DBClientType,
  companyId: string
) => {
  try {
    const item = await db.item.findMany({
      where: { companyId },
    });

    return item;
  } catch (error) {
    repositoryErrorLogger({
      method: "getItemByCompanyId",
      error,
    });
    throw error;
  }
};
