import { createTRPCRouter, publicProcedure } from "../trpc.server";
import { findSuppliersProductsByCompanyId } from "~/server/services/supplierProduct";

export const testRouter = createTRPCRouter({
  supplierProductSumamry: publicProcedure.query(async ({ ctx }) => {
    const companyId = "cmfscyy49002uuqqkn9d4vj06";
    const test = await findSuppliersProductsByCompanyId(ctx.db, companyId);
    // const supplierIds = await ctx.db.supplier.findMany({
    //   where: { companyId },
    //   select: { id: true },
    // });

    // const uniqueItemsBySupplier = await ctx.db.supplierProduct.findMany({
    //   where: { supplierId: { in: supplierIds.map((s) => s.id) } },
    //   select: {
    //     item: true,
    //   },
    //   distinct: ["itemId"],
    // });

    // const flatUniqueItemsBySupplier = uniqueItemsBySupplier.map(({ item }) => ({
    //   ...item,
    // }));
    // return flatUniqueItemsBySupplier;

    return test;
  }),
});
