import { PriceCurrency } from "@prisma/client";
import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { DBClientType } from "~/types/DBClientType";

type ItemData = {
  name: string;
  category: "RAW_MATERIAL" | "SUPPORTING_MATERIAL" | "FINISHED_GOODS";
  companyId: string;
  supplierId: string;
  price: string;
  priceCurrency: PriceCurrency;
};

type CreateItemWithSupplierProductType = ItemData;

type UpdateItemByIdType = {
  data: Partial<ItemData>;
  itemId: string;
};

type UpdateItemByItemNameAndCompanyIdType = {
  data: Partial<ItemData>;
  itemName: string;
  companyId: string;
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

export const updateItemById = async (
  db: DBClientType,
  { itemId, data }: UpdateItemByIdType
) => {
  try {
    const item = await db.item.update({
      where: { id: itemId },
      data,
    });

    return item;
  } catch (error) {
    repositoryErrorLogger({
      method: "updateItemById",
      error,
    });
    throw error;
  }
};

export const updateItemByItemNameAndCompanyId = async (
  db: DBClientType,
  { itemName, companyId, data }: UpdateItemByItemNameAndCompanyIdType
) => {
  try {
    const item = await db.item.update({
      where: { name_companyId: { name: itemName, companyId } },
      data,
    });

    return item;
  } catch (error) {
    repositoryErrorLogger({
      method: "updateItemByItemNameAndCompanyId",
      error,
    });
    throw error;
  }
};

export const deleteItemById = async (db: DBClientType, itemId: string) => {
  try {
    await db.item.delete({
      where: { id: itemId },
    });
  } catch (error) {
    repositoryErrorLogger({
      method: "deleteItemById",
      error,
    });
    throw error;
  }
};
