import { z } from "zod";

export const createPOSchema = z.object({
  supplierContactId: z.string().min(1, "Contact is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  customerContactName: z.string().min(1, "Customer contact name is required"),
  discount: z.number().min(0).max(99),
  tax: z.number().min(0).max(99),
  subTotal: z.string().min(1),
  discountTotal: z.string().min(1),
  taxTotal: z.string().min(1),
  grandTotal: z.string().min(1),
  customerContactEmail: z.union([
    z.string().email("Invalid email"),
    z.literal(""),
  ]),
  customerContactPhone: z.union([z.string(), z.literal("")]),
  priceCurrency: z.enum(["YUAN", "IDR"]),
  POItems: z
    .array(
      z.object({
        itemId: z.string().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        itemCost: z.number().min(1, "Item cost is required"),
        unit: z.string().min(1, "Unit is required"),
      })
    )
    .min(1, "At least one item is required"),
});

export const editPOSchema = z.object({
  POId: z.string().min(1),
  supplierContactId: z.string().min(1, "Contact is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  customerContactName: z.string().min(1, "Customer contact name is required"),
  discount: z.number().min(0).max(99),
  tax: z.coerce.number().min(0).max(99),
  subTotal: z.string().min(1),
  discountTotal: z.string().min(1),
  taxTotal: z.string().min(1),
  grandTotal: z.string().min(1),
  customerContactEmail: z.union([
    z.string().email("Invalid email"),
    z.literal(""),
  ]),
  customerContactPhone: z.union([z.string(), z.literal("")]),
  priceCurrency: z.enum(["YUAN", "IDR"]),
  POItems: z
    .array(
      z.object({
        itemId: z.string().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        itemCost: z.number().min(1, "Item cost is required"),
        unit: z.string().min(1, "Unit is required"),
      })
    )
    .min(1, "At least one item is required"),
});
