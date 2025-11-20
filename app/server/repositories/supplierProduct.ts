import { ItemCategory, PriceCurrency } from "@prisma/client";
import { z } from "zod";
import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { editPriceSupplierProductBySupplierIdAndItemIdSchema } from "~/schemas/purchasing/supplierProduct";
import { DBClientType } from "~/types/DBClientType";

type CreateSupplierProductType = {
  price: number;
  priceCurrency: PriceCurrency;
  supplierId: string;
  itemId: string;
};

type UpdateSupplierProductType = {
  data: Partial<CreateSupplierProductType>;
  supplierProductId: string;
};

type UpdateSupplierProductPriceBySupplierIdAndItemIdType = z.infer<
  typeof editPriceSupplierProductBySupplierIdAndItemIdSchema
>;

export const createSupplierProduct = async (
  db: DBClientType,
  { price, priceCurrency, supplierId, itemId }: CreateSupplierProductType
) => {
  try {
    await db.supplierProduct.create({
      data: {
        price,
        priceCurrency,
        supplierId,
        itemId,
      },
    });
  } catch (error) {
    repositoryErrorLogger({
      method: "createSupplierProduct",
      error,
    });
    throw error;
  }
};

export const updateSupplierProductById = async (
  db: DBClientType,
  { supplierProductId, data }: UpdateSupplierProductType
) => {
  try {
    await db.supplierProduct.update({
      where: { id: supplierProductId },
      data,
    });
  } catch (error) {
    repositoryErrorLogger({
      method: "updateSupplierProductById",
      error,
    });
    throw error;
  }
};

export const getSupplierProductById = async (
  db: DBClientType,
  supplierProductId: string
) => {
  try {
    const supplierProduct = await db.supplierProduct.findUnique({
      where: { id: supplierProductId },
      include: { item: true },
    });
    if (!supplierProduct) return null;

    const { item, ...rest } = supplierProduct;
    const flattenedSupplierProduct = {
      ...rest,
      itemName: item?.name,
      itemCategory: item?.category,
    };

    return flattenedSupplierProduct;
  } catch (error) {
    repositoryErrorLogger({
      method: "getSupplierProductById",
      error,
    });
    throw error;
  }
};

export const getSupplierProductCountByItemId = async (
  db: DBClientType,
  itemId: string
) => {
  try {
    const supplierProductCount = await db.supplierProduct.count({
      where: { itemId },
    });

    return supplierProductCount;
  } catch (error) {
    repositoryErrorLogger({
      method: "getSupplierProductCountByItemId",
      error,
    });
    throw error;
  }
};

export const getSupplierProductByItemId = async (
  db: DBClientType,
  itemId: string
) => {
  try {
    const supplierProducts = await db.supplierProduct.findMany({
      where: { itemId },
      include: { supplier: true, item: true },
      orderBy: { createdAt: "desc" },
    });

    const flattenedSupplierProducts = supplierProducts.map(
      ({ item, supplier, price, priceCurrency, ...rest }) => ({
        ...rest,
        supplierName: supplier.name,
        itemName: item.name,
        itemCategory: item.category,
        priceCurrency,
        price:
          priceCurrency === "IDR"
            ? Number(price).toLocaleString("en-US")
            : price,
      })
    );
    return flattenedSupplierProducts;
  } catch (error) {
    repositoryErrorLogger({
      method: "getSupplierProductByItemId",
      error,
    });
    throw error;
  }
};

export const getSupplierProductsBySupplierId = async (
  db: DBClientType,
  supplierId: string
) => {
  try {
    const supplierProducts = await db.supplierProduct.findMany({
      where: { supplierId },
      include: { item: true },
    });

    const flattenedSupplierProducts = supplierProducts.map(
      ({ item, ...rest }) => ({
        ...rest,
        itemName: item.name,
        itemCategory: item.category,
      })
    );

    return flattenedSupplierProducts;
  } catch (error) {
    repositoryErrorLogger({
      method: "getSupplierProductsBySupplierId",
      error,
    });
    throw error;
  }
};

export const getSupplierProductsSummaryByCompanyId = async (
  db: DBClientType,
  companyId: string
) => {
  try {
    const supplierProductsSummary = await db.supplierProduct.groupBy({
      by: ["itemId", "priceCurrency"],
      where: { supplier: { companyId } },
      _count: {
        supplierId: true,
      },
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
    });

    const itemIds = supplierProductsSummary.map(({ itemId }) => itemId);
    const items = await db.item.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, name: true, category: true },
    });
    const flattenedSupplierProductsSummary = supplierProductsSummary.map(
      ({ _count, _max, _min, itemId, priceCurrency }) => {
        const item = items.find(({ id }) => itemId === id);
        return {
          itemId,
          priceCurrency,
          itemName: item?.name || "",
          itemCategory: item?.category as ItemCategory,
          supplierCount: _count.supplierId,
          minPrice: _min.price,
          maxPrice: _max.price,
        };
      }
    );

    return flattenedSupplierProductsSummary;
  } catch (error) {
    repositoryErrorLogger({
      method: "getSupplierProductsSummaryByCompanyId  ",
      error,
    });
    throw error;
  }
};

export const deleteSupplierProductById = async (
  db: DBClientType,
  supplierProductId: string
) => {
  try {
    const supplierProduct = await db.supplierProduct.delete({
      where: { id: supplierProductId },
    });

    return supplierProduct;
  } catch (error) {
    repositoryErrorLogger({
      method: "deleteSupplierProductById",
      error,
    });
    throw error;
  }
};

export const updateSupplierProductPriceBySupplierIdAndItemId = async (
  db: DBClientType,
  {
    itemId,
    supplierId,
    price,
    priceCurrency,
  }: UpdateSupplierProductPriceBySupplierIdAndItemIdType
) => {
  try {
    await db.supplierProduct.updateMany({
      where: { itemId, supplierId },
      data: { price, priceCurrency },
    });
  } catch (error) {
    repositoryErrorLogger({
      method: "updateSupplierProductPriceBySupplierIdAndItemId",
      error,
    });
    throw error;
  }
};
