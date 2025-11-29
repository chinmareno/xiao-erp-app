import { z } from "zod";
import { createTRPCRouter, purchasingProcedure } from "../../trpc";
import {
  createSupplierProductSchema,
  editPriceSupplierProductBySupplierIdAndItemIdSchema,
  editSupplierProductSchema,
} from "~/schemas/purchasing/supplierProduct";
import {
  addSupplierProduct,
  changePriceSupplierProductBySupplierIdAndItemId,
  editSupplierProduct,
  findSupplierProductsByItemId,
  findSupplierProductsBySupplierId,
  findSuppliersProductsByCompanyId,
  removeSupplierProductById,
} from "~/server/services/supplierProduct";

export const supplierProductRouter = createTRPCRouter({
  createSupplierProduct: purchasingProcedure
    .input(createSupplierProductSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        supplierId,
        itemName,
        itemCategory,
        price,
        priceCurrency,
        itemId,
      } = input;
      const companyId = ctx.companyId;

      await addSupplierProduct(ctx.db, {
        supplierId,
        itemName,
        itemCategory,
        price,
        priceCurrency,
        itemId,
        companyId,
      });
    }),

  editSupplierProduct: purchasingProcedure
    .input(editSupplierProductSchema)
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
      const companyId = ctx.companyId;

      await editSupplierProduct(ctx.db, {
        supplierId,
        supplierProductId,
        itemName,
        price,
        priceCurrency,
        itemId,
        itemCategory,
        companyId,
      });
    }),

  getSupplierProductsByCompanyId: purchasingProcedure.query(async ({ ctx }) => {
    const companyId = ctx.companyId;

    const companySupplierProducts = await findSuppliersProductsByCompanyId(
      ctx.db,
      companyId
    );

    return companySupplierProducts;
  }),

  deleteSupplierProductById: purchasingProcedure
    .input(
      z.object({
        supplierProductId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supplierProductId } = input;

      await removeSupplierProductById(ctx.db, supplierProductId);
    }),

  getSupplierProductByItemId: purchasingProcedure
    .input(z.object({ itemId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { itemId } = input;

      const supplierProducts = await findSupplierProductsByItemId(
        ctx.db,
        itemId
      );

      return supplierProducts;
    }),

  editPriceSupplierProductBySupplierIdAndItemId: purchasingProcedure
    .input(editPriceSupplierProductBySupplierIdAndItemIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { supplierId, itemId, price, priceCurrency } = input;

      await changePriceSupplierProductBySupplierIdAndItemId(ctx.db, {
        supplierId,
        itemId,
        price,
        priceCurrency,
      });
    }),

  getSupplierProductsBySupplierId: purchasingProcedure
    .input(z.object({ supplierId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { supplierId } = input;

      const supplierProducts = findSupplierProductsBySupplierId(
        ctx.db,
        supplierId
      );

      return supplierProducts;
    }),
});
