import { z } from "zod";
import { createTRPCRouter, purchasingProcedure } from "~/api/trpc.server";

export const createProductSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  itemId: z.string().optional(),
  itemName: z.string().min(1, "Item name is required").optional(),
  itemImage: z.string().nullable().optional(),
  costIdr: z.number().min(0),
  costYuan: z.number().min(0),
});

const getProductsBySupplierIdSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
});

export const productRouter = createTRPCRouter({
  createProduct: purchasingProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      const { supplierId, itemName, costIdr, costYuan, itemId } = input;
      if (itemId) {
        await ctx.db.item.update({
          where: { id: itemId },
          data: {
            supplierProducts: {
              create: {
                supplierId,
                costIdr,
                costYuan,
              },
            },
          },
        });
      } else if (itemName) {
        await ctx.db.item.create({
          data: {
            name: itemName,
            supplierProducts: { create: { supplierId, costIdr, costYuan } },
          },
        });
      }
    }),

  getProductsBySupplierId: purchasingProcedure
    .input(getProductsBySupplierIdSchema)
    .query(async ({ ctx, input }) => {
      const { supplierId } = input;

      const supplierProducts = await ctx.db.supplierProduct.findMany({
        where: {
          supplier: {
            id: supplierId,
          },
        },
        select: {
          costIdr: true,
          costYuan: true,
          createdAt: true,
          updatedAt: true,
          item: { select: { name: true } },
        },
      });

      const flatProducts = supplierProducts.map((p) => ({
        costIdr: p.costIdr,
        costYuan: p.costYuan,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        name: p.item.name,
      }));

      return flatProducts;
    }),

  getProductsByCompanyId: purchasingProcedure.query(async ({ ctx }) => {
    const supplierIds = await ctx.db.supplier.findMany({
      where: { companyId: ctx.companyId },
      select: { id: true },
    });

    const uniqueItemsBySupplier = await ctx.db.supplierProduct.findMany({
      where: { supplierId: { in: supplierIds.map((s) => s.id) } },
      distinct: ["itemId", "supplierId"],
      select: {
        item: true,
      },
    });

    const flatUniqueItemsBySupplier = uniqueItemsBySupplier.map(({ item }) => ({
      ...item,
    }));
    return flatUniqueItemsBySupplier;
  }),
});
