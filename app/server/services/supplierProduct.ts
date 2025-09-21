import { ItemCategory, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createSupplierProductSchema,
  editPriceSupplierProductBySupplierIdAndItemIdSchema,
  editSupplierProductSchema,
} from "~/schemas/purchasing/supplierProduct";
import {
  createItemWithSupplierProduct,
  deleteItemById,
  getItemByCompanyId,
  getItemByIdAndSupplierId,
  updateItemById,
  updateItemByItemNameAndCompanyId,
} from "../repositories/item";
import {
  createSupplierProduct,
  getSupplierProductById,
  getSupplierProductsBySupplierId,
  getSupplierProductsSummaryByCompanyId,
  updateSupplierProductById,
  getSupplierProductByItemId,
  getSupplierProductCountByItemId,
  updateSupplierProductPriceBySupplierIdAndItemId,
  deleteSupplierProductById,
} from "../repositories/supplierProduct";
import { normalizeString } from "~/lib/normalizeString";
import { getWarehousesByCompanyId } from "../repositories/warehouse";
import { createManyStockItem } from "../repositories/stockItem";
import { serviceErrorLogger } from "~/lib/logger/serviceErrorLogger";
import { DBClientType } from "~/types/DBClientType";

type AddSupplierProductType = z.infer<typeof createSupplierProductSchema> & {
  companyId: string;
};

type EditSupplierProductType = z.infer<typeof editSupplierProductSchema> & {
  companyId: string;
};

type ChangePriceSupplierProductBySupplierIdAndItemIdType = z.infer<
  typeof editPriceSupplierProductBySupplierIdAndItemIdSchema
>;

export const addSupplierProduct = async (
  db: PrismaClient,
  {
    supplierId,
    itemName,
    itemCategory,
    price,
    priceCurrency,
    itemId,
    companyId,
  }: AddSupplierProductType
) => {
  if (itemId) {
    const itemAlreadyAdded = await getItemByIdAndSupplierId(db, {
      itemId,
      supplierId,
    });
    if (itemAlreadyAdded) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "This supplier already has a product for the selected item.",
      });
    }
    await createSupplierProduct(db, {
      price,
      priceCurrency,
      supplierId,
      itemId,
    });
  } else if (itemName) {
    const companyItems = await getItemByCompanyId(db, companyId);

    const sameItemName = companyItems.find(
      (item) => normalizeString(item.name) === normalizeString(itemName)
    );
    if (sameItemName) {
      const alreadyAdded = await getItemByIdAndSupplierId(db, {
        itemId: sameItemName.id,
        supplierId,
      });

      if (alreadyAdded) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This supplier already has a product for the selected item.",
        });
      } else {
        await createSupplierProduct(db, {
          price,
          priceCurrency,
          supplierId,
          itemId: sameItemName.id,
        });
      }
    } else {
      await db.$transaction(async (tx) => {
        const newlyCreatedsupplierProductId =
          await createItemWithSupplierProduct(tx, {
            name: itemName,
            category: itemCategory,
            companyId,
            supplierId,
            price,
            priceCurrency,
          });

        const warehouses = await getWarehousesByCompanyId(tx, companyId);
        if (0 < warehouses.length) {
          const stockItems = warehouses.map(({ id }) => ({
            warehouseId: id,
            supplierProductId: newlyCreatedsupplierProductId,
            quantity: 0,
            costIdr: 0,
            costYuan: 0,
          }));

          await createManyStockItem(tx, stockItems);
        }
      });
    }
  }
};

export const editSupplierProduct = async (
  db: PrismaClient,
  {
    supplierId,
    supplierProductId,
    itemName,
    price,
    priceCurrency,
    itemId,
    itemCategory,
    companyId,
  }: EditSupplierProductType
) => {
  const uneditedSupplierProduct = await getSupplierProductById(
    db,
    supplierProductId
  );
  if (!uneditedSupplierProduct) {
    serviceErrorLogger({
      method: "editSupplierProduct",
      logType: "warn",
      error: `Client bypassed validation to edit non-existent supplier product ID: ${supplierProductId}`,
    });
    throw new TRPCError({
      code: "NOT_FOUND",
    });
  }

  if (itemId) {
    await db.$transaction(async (tx) => {
      await updateItemById(tx, { itemId, data: { category: itemCategory } });
      await updateSupplierProductById(tx, {
        supplierProductId,
        data: {
          itemId,
        },
      });
    });
  } else if (
    normalizeString(itemName || "") ===
    normalizeString(uneditedSupplierProduct.itemName)
  ) {
    await db.$transaction(async (tx) => {
      const itemNameTrimmed = itemName ? itemName.trim() : "";
      await updateItemByItemNameAndCompanyId(tx, {
        itemName: itemNameTrimmed,
        companyId,
        data: { category: itemCategory },
      });
      await updateSupplierProductById(tx, {
        supplierProductId,
        data: { price, priceCurrency },
      });
    });
  } else if (itemName) {
    const supplierProducts = await getSupplierProductsBySupplierId(
      db,
      supplierId
    );
    const sameItemName = supplierProducts.find(
      ({ itemName: existingItemName }) =>
        normalizeString(existingItemName) === normalizeString(itemName)
    );
    if (sameItemName) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "This supplier already has a product for the selected item.",
      });
    }

    await db.$transaction(async (tx) => {
      await createItemWithSupplierProduct(tx, {
        name: itemName,
        category: itemCategory,
        companyId,
        supplierId,
        price,
        priceCurrency,
      });
      await removeSupplierProductById(tx, supplierProductId);
    });
  }
};

export const findSupplierProductsBySupplierId = async (
  db: PrismaClient,
  supplierId: string
) => {
  const supplierProducts = await getSupplierProductsBySupplierId(
    db,
    supplierId
  );

  return supplierProducts;
};

export const findSupplierProductsByItemId = async (
  db: DBClientType,
  itemId: string
) => {
  const supplierProducts = await getSupplierProductByItemId(db, itemId);

  return supplierProducts;
};

export const findSuppliersProductsByCompanyId = async (
  db: PrismaClient,
  companyId: string
) => {
  const suppliersProducts = await getSupplierProductsSummaryByCompanyId(
    db,
    companyId
  );
  const formattedSuppliersProducts = suppliersProducts.reduce(
    (acc, item) => {
      const { priceCurrency, minPrice, maxPrice, ...rest } = item;
      const isIdr = priceCurrency === "IDR";
      const isOnlyOnePrice = minPrice === maxPrice;
      const formattedMinPrice = isIdr
        ? Number(minPrice).toLocaleString("en-US")
        : minPrice;
      const formattedMaxPrice = isIdr
        ? Number(maxPrice).toLocaleString("en-US")
        : maxPrice;
      const priceRangeIDR = isIdr
        ? isOnlyOnePrice
          ? `Rp ${formattedMinPrice}`
          : `Rp ${formattedMinPrice} – Rp ${formattedMaxPrice}`
        : "";
      const priceRangeYUAN = isIdr
        ? isOnlyOnePrice
          ? `¥${formattedMinPrice}`
          : `¥${formattedMinPrice} – ¥${formattedMaxPrice}`
        : "";
      const existingIndex = acc.findIndex(
        ({ itemId }) => item.itemId === itemId
      );

      if (existingIndex !== -1) {
        if (isIdr) {
          acc[existingIndex].priceRangeIDR = priceRangeIDR;
        } else {
          acc[existingIndex].priceRangeYUAN = priceRangeYUAN;
        }
      } else {
        if (isIdr) {
          acc.push({
            ...rest,
            priceRangeIDR,
            priceRangeYUAN,
          });
        }
      }

      return acc;
    },
    [] as {
      itemId: string;
      itemName: string;
      itemCategory: ItemCategory;
      supplierCount: number;
      priceRangeIDR: string;
      priceRangeYUAN: string;
    }[]
  );

  return formattedSuppliersProducts;
};

export const removeSupplierProductById = async (
  db: DBClientType,
  supplierProductId: string
) => {
  const deletedSupplierProduct = await deleteSupplierProductById(
    db,
    supplierProductId
  );
  const remainingConnections = await getSupplierProductCountByItemId(
    db,
    deletedSupplierProduct.itemId
  );
  if (remainingConnections === 0) {
    await deleteItemById(db, deletedSupplierProduct.itemId);
  }
};

export const changePriceSupplierProductBySupplierIdAndItemId = async (
  db: DBClientType,
  {
    supplierId,
    itemId,
    price,
    priceCurrency,
  }: ChangePriceSupplierProductBySupplierIdAndItemIdType
) => {
  await updateSupplierProductPriceBySupplierIdAndItemId(db, {
    supplierId,
    itemId,
    price,
    priceCurrency,
  });
};
