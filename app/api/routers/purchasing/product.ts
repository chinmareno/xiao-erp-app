import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, purchasingProcedure } from "~/api/trpc.server";

export const createProductSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  itemId: z.string().min(1, "Item id is required").optional(),
  itemName: z.string().min(1, "Item name is required").optional(),
  itemImage: z.string().nullable().optional(),
  price: z.string().min(0, "Price must be a positive number"),
  priceCurrency: z.string().min(1, "Price currency is required"),
});

const getProductsBySupplierIdSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
});

export const productRouter = createTRPCRouter({
  createProduct: purchasingProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      const { supplierId, itemName, price, priceCurrency, itemId } = input;

      if (itemId) {
        const alreadyAdded = await ctx.db.item.findFirst({
          where: { id: itemId, supplierProducts: { some: { supplierId } } },
        });
        console.log(alreadyAdded);
        if (alreadyAdded) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "This supplier already has a product for the selected item.",
          });
        }

        await ctx.db.item.update({
          where: { id: itemId },
          data: {
            supplierProducts: {
              create: {
                price,
                priceCurrency,
                supplierId,
              },
            },
          },
        });
      } else if (itemName) {
        await ctx.db.item.create({
          data: {
            name: itemName,
            supplierProducts: { create: { supplierId, price, priceCurrency } },
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
          createdAt: true,
          updatedAt: true,
          price: true,
          priceCurrency: true,
          item: { select: { name: true } },
        },
      });

      const flatProducts = supplierProducts.map((p) => ({
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        price: p.price,
        priceCurrency: p.priceCurrency,
        name: p.item.name,
      }));

      return flatProducts;
    }),

  getProductsByCompanyId: purchasingProcedure.query(async ({ ctx }) => {
    const supplierIds = await ctx.db.supplier.findMany({
      where: { companyId: ctx.companyId },
      select: { id: true },
    });

    const supplierIdList = supplierIds.map((s) => s.id);

    const supplierProducts = await ctx.db.supplierProduct.findMany({
      where: {
        supplierId: { in: supplierIdList },
      },
      select: {
        price: true,
        itemId: true,
        item: {
          select: { name: true },
        },
        supplierId: true,
      },
    });

    const groupedByItem = supplierProducts.reduce((acc, sp) => {
      if (!acc[sp.itemId]) {
        acc[sp.itemId] = {
          name: sp.item.name,
          prices: [],
          supplierIds: new Set(),
        };
      }
      acc[sp.itemId].prices.push(Number(sp.price));
      acc[sp.itemId].supplierIds.add(sp.supplierId);
      return acc;
    }, {} as Record<string, { name: string; prices: number[]; supplierIds: Set<string> }>);

    const result = Object.values(groupedByItem).map((group) => {
      const min = Math.min(...group.prices);
      const max = Math.max(...group.prices);
      return {
        name: group.name,
        supplierCount: group.supplierIds.size,
        priceRange: min === max ? `¥${min}` : `¥${min} – ¥${max}`,
      };
    });

    return result;
  }),

  getUniqueItemsByCompanyId: purchasingProcedure.query(async ({ ctx }) => {
    const supplierIds = await ctx.db.supplier.findMany({
      where: { companyId: ctx.companyId },
      select: { id: true },
    });

    const uniqueItemsBySupplier = await ctx.db.supplierProduct.findMany({
      where: { supplierId: { in: supplierIds.map((s) => s.id) } },
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
