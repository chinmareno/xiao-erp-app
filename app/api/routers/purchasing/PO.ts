import { createTRPCRouter, purchasingProcedure } from "~/api/trpc.server";
import { z } from "zod";

const createPOSchema = z.object({
  PONumber: z.string().min(1, "PO Number is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  expectedFullReceivedDate: z.date().optional(),
  costIn: z.enum(["YUAN", "IDR"]),
  items: z
    .array(
      z.object({
        supplierProductId: z.string().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        itemCost: z.number().min(1, "Cost in IDR must be positive"),
      })
    )
    .min(1, "At least one item is required"),
});

export const PORouter = createTRPCRouter({
  createPO: purchasingProcedure
    .input(createPOSchema)
    .mutation(async ({ ctx, input }) => {
      const { PONumber, supplierId, expectedFullReceivedDate, items, costIn } =
        input;

      const idrYuanRate = await ctx.db.yuanIdrRate.findFirst();
      if (!idrYuanRate) throw new Error("Yuan to IDR rate not found");

      const { idrToYuanRate, yuanToIdrRate } = idrYuanRate;

      if (costIn === "YUAN") {
        const updatedItems = items.map((item) => ({
          supplierProductId: item.supplierProductId,
          quantity: item.quantity,
          costYuan: item.itemCost,
          costIdr: item.itemCost * yuanToIdrRate,
        }));

        await ctx.db.purchaseOrder.create({
          data: {
            PONumber,
            supplierId,
            expectedFullReceivedDate,
            companyId: ctx.companyId,
            items: {
              createMany: { data: updatedItems },
            },
          },
        });
      } else if (costIn === "IDR") {
        const updatedItems = items.map((item) => ({
          supplierProductId: item.supplierProductId,
          quantity: item.quantity,
          costIdr: item.itemCost,
          costYuan: item.itemCost * idrToYuanRate,
        }));
        await ctx.db.purchaseOrder.create({
          data: {
            PONumber,
            supplierId,
            expectedFullReceivedDate,
            companyId: ctx.companyId,
            items: {
              createMany: { data: updatedItems },
            },
          },
        });
      }
    }),
  getPONumberFormatByCompanyId: purchasingProcedure.query(async ({ ctx }) => {
    const PONumberFormatData = await ctx.db.pONumberFormat.findFirst({
      where: {
        companyId: ctx.companyId,
      },
    });
    if (!PONumberFormatData) {
      const newPONumberFormatData = await ctx.db.pONumberFormat.create({
        data: {
          companyId: ctx.companyId,
          currentNumber: 1,
          prefix: "PO",
        },
      });
      const PONumberFormatString = `${
        newPONumberFormatData.prefix
      }-${newPONumberFormatData.currentNumber.toString().padStart(6, "0")}`;

      return PONumberFormatString;
    }

    const PONumberFormatString = `${
      PONumberFormatData.prefix
    }-${PONumberFormatData.currentNumber.toString().padStart(6, "0")}`;

    return PONumberFormatString;
  }),
});
