import { ItemCategory } from "@prisma/client";
import { z } from "zod";

export const createSupplierProductSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  itemId: z.string().min(1, "Item id is required").optional(),
  itemName: z.string().min(1, "Item name is required").optional(),
  itemImage: z.string().nullable().optional(),
  itemCategory: z.nativeEnum(ItemCategory),
  price: z.string().min(1, "Price must be a positive number"),
  priceCurrency: z.string().min(1, "Price currency is required"),
});
