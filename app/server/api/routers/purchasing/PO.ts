import { createPOSchema, editPOSchema } from "~/schemas/purchasing/PO";
import { createTRPCRouter, purchasingProcedure } from "../../trpc.server";
import { z } from "zod";
import {
  changePONumberFormatPrefix,
  changePOStatusByPOId,
  editPOByPOId,
  findLastPOCustomerContactByCompanyId,
  findPOByPOId,
  findPOsByCompanyId,
  makePO,
} from "~/server/services/PO";
import { findPONumberFormatByCompanyId } from "~/server/services/PONumberFormat";

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
        discount,
        tax,
        discountTotal,
        taxTotal,
        subTotal,
        grandTotal,
      } = input;
      const companyId = ctx.companyId;

      await makePO(ctx.db, {
        customerContactEmail,
        customerContactName,
        customerContactPhone,
        items,
        priceCurrency,
        supplierContactId,
        supplierId,
        discount,
        tax,
        discountTotal,
        taxTotal,
        subTotal,
        grandTotal,
        companyId,
      });
    }),

  getPONumberFormatByCompanyId: purchasingProcedure.query(async ({ ctx }) => {
    const companyId = ctx.companyId;

    const { formattedPONumber } = await findPONumberFormatByCompanyId(
      ctx.db,
      companyId
    );

    return formattedPONumber;
  }),

  changePONumberFormat: purchasingProcedure
    .input(
      z.object({
        prefix: z.string().min(1, "Prefix is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prefix } = input;
      const companyId = ctx.companyId;

      const PONumberFormat = await changePONumberFormatPrefix(ctx.db, {
        prefix,
        companyId,
      });

      return PONumberFormat;
    }),

  getLastPOCustomerContactByCompanyId: purchasingProcedure.query(
    async ({ ctx }) => {
      const companyId = ctx.companyId;

      const lastPOCustomerContact = await findLastPOCustomerContactByCompanyId(
        ctx.db,
        companyId
      );

      return lastPOCustomerContact;
    }
  ),

  getPOsByCompanyId: purchasingProcedure.query(async ({ ctx }) => {
    const companyId = ctx.companyId;

    const POs = await findPOsByCompanyId(ctx.db, companyId);

    return POs;
  }),

  getPOByPOId: purchasingProcedure
    .input(
      z.object({
        id: z.string().min(1, "PO ID is required"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: poId } = input;
      const companyId = ctx.companyId;

      const PO = findPOByPOId(ctx.db, { poId, companyId });

      return PO;
    }),

  changePOStatusByPOId: purchasingProcedure
    .input(
      z.object({
        POId: z.string().min(1),
        status: z.enum(["UNRECEIVED", "RECEIVED", "INACTIVE"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { POId: poId, status } = input;

      await changePOStatusByPOId(ctx.db, { poId, status });
    }),

  editPOByPOId: purchasingProcedure
    .input(editPOSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        customerContactEmail,
        customerContactName,
        customerContactPhone,
        items,
        priceCurrency,
        supplierContactId,
        supplierId,
        discount,
        tax,
        discountTotal,
        taxTotal,
        subTotal,
        grandTotal,
        POId,
      } = input;
      const companyId = ctx.companyId;

      await editPOByPOId(ctx.db, {
        customerContactEmail,
        customerContactName,
        customerContactPhone,
        items,
        priceCurrency,
        supplierContactId,
        supplierId,
        discount,
        tax,
        discountTotal,
        taxTotal,
        subTotal,
        grandTotal,
        POId,
        companyId,
      });
    }),
});
