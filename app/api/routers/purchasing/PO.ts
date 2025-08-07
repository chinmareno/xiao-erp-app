import { createTRPCRouter, purchasingProcedure } from "~/api/trpc.server";
import { z } from "zod";

const createPOSchema = z.object({
  supplierContactId: z.string().min(1, "Contact is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  customerContactName: z.string().min(1, "Customer contact name is required"),
  customerContactEmail: z.union([
    z.string().email("Invalid email"),
    z.literal(""),
  ]),
  customerContactPhone: z.union([z.string(), z.literal("")]),
  priceCurrency: z.enum(["YUAN", "IDR"]),
  items: z
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

export const PORouter = createTRPCRouter({
  createPO: purchasingProcedure
    .input(createPOSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        customerContactEmail,
        customerContactName,
        customerContactPhone,
        items,
        priceCurrency,
        supplierContactId,
        supplierId,
      } = input;

      const idrYuanRate = await ctx.db.yuanIdrRate.findFirst();
      if (!idrYuanRate) throw new Error("Yuan to IDR rate not found");

      const { idrToYuanRate, yuanToIdrRate } = idrYuanRate;

      const PONumberFormatData = await ctx.db.pONumberFormat.findFirst({
        where: { companyId: ctx.companyId },
      });
      if (!PONumberFormatData) throw new Error("PO Number format not found");
      const PONumber = `${
        PONumberFormatData.prefix
      }${PONumberFormatData.currentNumber.toString().padStart(6, "0")}`;

      const supplierDetail = await ctx.db.supplier.findUnique({
        where: {
          id: supplierId,
        },
      });
      const supplierContactDetail = await ctx.db.contact.findUnique({
        where: { id: supplierContactId },
      });

      const customerDetail = await ctx.db.company.findUnique({
        where: { id: ctx.companyId },
      });
      if (!supplierDetail || !customerDetail || !supplierContactDetail)
        throw new Error("Internal Server Error");

      if (priceCurrency === "YUAN") {
        const updatedItems = items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          costYuan: item.itemCost,
          costIdr: item.itemCost * yuanToIdrRate,
        }));

        await ctx.db.$transaction([
          ctx.db.pONumberFormat.update({
            where: { companyId: ctx.companyId },
            data: { currentNumber: PONumberFormatData.currentNumber + 1 },
          }),
          ctx.db.purchaseOrder.create({
            data: {
              PONumber,
              customerName: customerDetail.name,
              supplierName: supplierDetail.name,
              customerAddress: customerDetail.address,
              customerContactName,
              supplierAdress: supplierDetail.address,
              supplierContactId,
              supplierContactName: supplierContactDetail.name,
              supplierContactPhone: supplierContactDetail.phone,
              supplierContactEmail: supplierContactDetail.email,
              customerContactEmail,
              customerContactPhone,
              supplierId,
              companyId: ctx.companyId,
              items: {
                createMany: { data: updatedItems },
              },
            },
          }),
        ]);
      } else if (priceCurrency === "IDR") {
        const updatedItems = items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          costIdr: item.itemCost,
          costYuan: item.itemCost * idrToYuanRate,
        }));
        await ctx.db.$transaction([
          ctx.db.pONumberFormat.update({
            where: { companyId: ctx.companyId },
            data: { currentNumber: PONumberFormatData.currentNumber + 1 },
          }),

          ctx.db.purchaseOrder.create({
            data: {
              PONumber,
              customerName: customerDetail.name,
              supplierName: supplierDetail.name,
              customerAddress: customerDetail.address,
              customerContactName,
              supplierAdress: supplierDetail.address,
              supplierContactId,
              supplierContactName: supplierContactDetail.name,
              supplierContactPhone: supplierContactDetail.phone,
              supplierContactEmail: supplierContactDetail.email,
              customerContactEmail,
              customerContactPhone,
              supplierId,
              companyId: ctx.companyId,
              items: {
                createMany: { data: updatedItems },
              },
            },
          }),
        ]);
      }
    }),

  getPONumberFormatByCompanyId: purchasingProcedure.query(async ({ ctx }) => {
    const PONumberFormatData = await ctx.db.pONumberFormat.findFirst({
      where: {
        companyId: ctx.companyId,
      },
    });
    if (!PONumberFormatData) throw Error("Not Found");

    return {
      PONumberPrefix: PONumberFormatData.prefix,
      PONumberCurrentNumber: PONumberFormatData.currentNumber
        .toString()
        .padStart(6, "0"),
    };
  }),

  changePONumberFormat: purchasingProcedure
    .input(
      z.object({
        prefix: z.string().min(1, "Prefix is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prefix } = input;

      const PONumberFormatData = await ctx.db.pONumberFormat.update({
        where: { companyId: ctx.companyId },
        data: { prefix },
      });

      return {
        PONumberPrefix: PONumberFormatData.prefix,
        PONumberCurrentNumber: PONumberFormatData.currentNumber
          .toString()
          .padStart(6, "0"),
      };
    }),

  getLatestPOCustomerContactByCompanyId: purchasingProcedure.query(
    async ({ ctx }) => {
      const result = await ctx.db.purchaseOrder.findFirst({
        where: { companyId: ctx.companyId },
        select: {
          customerContactName: true,
          customerContactEmail: true,
          customerContactPhone: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return result;
    }
  ),

  getPOsByCompanyId: purchasingProcedure.query(async ({ ctx }) => {
    const POs = await ctx.db.purchaseOrder.findMany({
      where: { companyId: ctx.companyId },
      include: { supplier: { select: { taxId: true } } },
    });

    const flatPOs = POs.map(({ supplier, ...rest }) => ({
      ...rest,
      supplierTaxId: supplier?.taxId ?? null,
    }));

    return flatPOs;
  }),
});
