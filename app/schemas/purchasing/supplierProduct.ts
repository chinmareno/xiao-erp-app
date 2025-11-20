import { ItemCategory, PriceCurrency } from "@prisma/client";
import { z } from "zod";

export const createSupplierProductSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  itemId: z.string().min(1, "Item id is required").optional(),
  itemName: z.string().min(1, "Item name is required").optional(),
  itemImage: z.string().nullable().optional(),
  itemCategory: z.nativeEnum(ItemCategory),
  price: z.coerce.number().min(1, "Price must be a positive number"),
  priceCurrency: z.nativeEnum(PriceCurrency),
});

export const editSupplierProductSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  supplierProductId: z.string().min(1, "Item id is required"),
  itemId: z.string().min(1, "Item id is required").optional(),
  itemName: z.string().min(1, "Item name is required").optional(),
  itemCategory: z.nativeEnum(ItemCategory),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  priceCurrency: z.nativeEnum(PriceCurrency),
});

export const editPriceSupplierProductBySupplierIdAndItemIdSchema = z.object({
  supplierId: z.string().min(1),
  itemId: z.string().min(1),
  price: z.coerce.number().min(1, "Price must be a positive number"),
  priceCurrency: z.nativeEnum(PriceCurrency),
});
