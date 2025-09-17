import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createSupplierProductSchema } from "~/schemas/purchasing/product";
import {
  createItemWithSupplierProduct,
  getItemByCompanyId,
  getItemByIdAndSupplierId,
} from "../repositories/item";
import { createSupplierProduct } from "../repositories/supplierProduct";
import { normalizeString } from "~/lib/normalizeString";
import { getWarehousesByCompanyId } from "../repositories/warehouse";
import { createManyStockItem } from "../repositories/stockItem";

type AddSupplierProductType = z.infer<typeof createSupplierProductSchema> & {
  companyId: string;
};

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
