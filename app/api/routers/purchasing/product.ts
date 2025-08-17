import { ItemCategory } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, purchasingProcedure } from "~/api/trpc.server";

export const createProductSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  itemId: z.string().min(1, "Item id is required").optional(),
  itemName: z.string().min(1, "Item name is required").optional(),
  itemImage: z.string().nullable().optional(),
  itemCategory: z.nativeEnum(ItemCategory),
  price: z.string().min(1, "Price must be a positive number"),
  priceCurrency: z.string().min(1, "Price currency is required"),
});

const getProductsBySupplierIdSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
});

export const productRouter = createTRPCRouter({
  createProduct: purchasingProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        supplierId,
        itemName,
        itemCategory,
        price,
        priceCurrency,
        itemId,
      } = input;

      if (itemId) {
        const alreadyAdded = await ctx.db.item.findFirst({
          where: { id: itemId, supplierProducts: { some: { supplierId } } },
        });
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
            category: itemCategory,
            supplierProducts: { create: { supplierId, price, priceCurrency } },
          },
        });
      }
    }),

  editProduct: purchasingProcedure
    .input(
      z.object({
        supplierId: z.string().min(1, "Supplier is required"),
        supplierProductId: z.string().min(1, "Item id is required"),
        itemId: z.string().min(1, "Item id is required").optional(),
        itemName: z.string().min(1, "Item name is required").optional(),
        itemCategory: z.nativeEnum(ItemCategory),
        price: z.string().min(0, "Price must be a positive number"),
        priceCurrency: z.string().min(1, "Price currency is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        supplierId,
        supplierProductId,
        itemName,
        price,
        priceCurrency,
        itemId,
        itemCategory,
      } = input;
      const oldSupplierProduct = await ctx.db.supplierProduct.findUnique({
        where: { id: supplierProductId },
        include: { item: true },
      });
      if (!oldSupplierProduct) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Supplier product not found",
        });
      }

      if (itemId) {
        await ctx.db.$transaction([
          ctx.db.item.update({
            where: { id: itemId },
            data: { category: itemCategory },
          }),
          ctx.db.supplierProduct.update({
            where: { id: supplierProductId },
            data: { itemId },
          }),
        ]);
      } else if (itemName?.trim() === oldSupplierProduct.item.name) {
        await ctx.db.$transaction([
          ctx.db.item.updateMany({
            where: { name: itemName?.trim() },
            data: { category: itemCategory },
          }),
          ctx.db.supplierProduct.update({
            where: { id: supplierProductId },
            data: { price, priceCurrency },
          }),
        ]);
      } else if (itemName) {
        await ctx.db.$transaction([
          ctx.db.item.create({
            data: {
              name: itemName,
              category: itemCategory,
              supplierProducts: {
                create: { supplierId, price, priceCurrency },
              },
            },
          }),
          ctx.db.supplierProduct.delete({ where: { id: supplierProductId } }),
        ]);
      }

      const remainingConnections = await ctx.db.supplierProduct.count({
        where: { itemId: oldSupplierProduct.itemId },
      });

      if (remainingConnections === 0) {
        await ctx.db.item.delete({
          where: { id: oldSupplierProduct.itemId },
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
        priceCurrency: true,
        itemId: true,
        item: true,
        supplierId: true,
      },
    });

    const grouped = supplierProducts.reduce(
      (acc, sp) => {
        const key = sp.itemId;

        if (!acc[key]) {
          acc[key] = {
            id: sp.itemId,
            name: sp.item.name,
            category: sp.item.category,
            supplierIds: new Set<string>(),
            IDR: [] as number[],
            YUAN: [] as number[],
          };
        }

        acc[key].supplierIds.add(sp.supplierId);

        if (sp.priceCurrency === "IDR") {
          acc[key].IDR.push(Number(sp.price));
        } else if (sp.priceCurrency === "YUAN") {
          acc[key].YUAN.push(Number(sp.price));
        }

        return acc;
      },
      {} as Record<
        string,
        {
          id: string;
          name: string;
          supplierIds: Set<string>;
          category: ItemCategory;
          IDR: number[];
          YUAN: number[];
        }
      >
    );

    const result = Object.values(grouped).map((group) => {
      const formatRange = (
        prices: number[],
        symbol: string,
        formatIDR = false
      ) => {
        if (prices.length === 0) return null;
        const min = Math.min(...prices);
        const max = Math.max(...prices);

        const formatPrice = (value: number) =>
          formatIDR ? value.toLocaleString("en-US") : value.toString();

        return min === max
          ? `${symbol}${formatPrice(min)}`
          : `${symbol}${formatPrice(min)} – ${symbol}${formatPrice(max)}`;
      };

      return {
        id: group.id,
        name: group.name,
        category: group.category,
        supplierCount: group.supplierIds.size,
        priceRangeIDR: formatRange(group.IDR, "Rp ", true),
        priceRangeYUAN: formatRange(group.YUAN, "¥"),
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
      distinct: ["itemId"],
    });

    const flatUniqueItemsBySupplier = uniqueItemsBySupplier.map(({ item }) => ({
      ...item,
    }));
    return flatUniqueItemsBySupplier;
  }),

  deleteSupplierProductById: purchasingProcedure
    .input(
      z.object({
        supplierId: z.string().min(1),
        supplierProductId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supplierId, supplierProductId } = input;

      const deletedSupplierProduct = await ctx.db.supplierProduct.delete({
        where: { id: supplierProductId, supplierId: supplierId },
        select: { itemId: true },
      });

      const remainingConnections = await ctx.db.supplierProduct.count({
        where: { itemId: deletedSupplierProduct.itemId },
      });

      if (remainingConnections === 0) {
        await ctx.db.item.delete({
          where: { id: deletedSupplierProduct.itemId },
        });
      }
    }),

  getSupplierProductByItemId: purchasingProcedure
    .input(z.object({ itemId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { itemId } = input;

      const supplierProduct = await ctx.db.supplierProduct.findMany({
        where: { itemId },
        include: { supplier: true, item: true },
        orderBy: { createdAt: "desc" },
      });

      const flattenedSupplierProduct = supplierProduct.map((sp) => ({
        ...sp,
        name: sp.item.name,
        supplierName: sp.supplier.name,
        category: sp.item.category,
        price:
          sp.priceCurrency === "IDR"
            ? Number(sp.price).toLocaleString("en-US")
            : sp.price,
      }));
      return flattenedSupplierProduct;
    }),

  editPriceSupplierProductBySupplierIdAndItemId: purchasingProcedure
    .input(
      z.object({
        supplierId: z.string().min(1),
        itemId: z.string().min(1),
        price: z.string().min(1, "Price must be a positive number"),
        priceCurrency: z.string().min(1, "Price currency is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supplierId, itemId, price, priceCurrency } = input;

      await ctx.db.supplierProduct.updateMany({
        where: { itemId, supplierId },
        data: { price, priceCurrency },
      });
    }),
});
