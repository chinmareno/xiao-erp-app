import { z } from "zod";
import { createTRPCRouter, purchasingProcedure } from "../../trpc";
import {
  addNewSupplier,
  addSupplierContact,
  findSupplierBySupplierId,
  findSupplierPOsBySupplierId,
  findSuppliersByCompanyId,
} from "~/server/services/supplier";
import { createSupplierSchema } from "~/schemas/purchasing/supplier";
import { addContactSchema } from "~/schemas/contact";

export const supplierRouter = createTRPCRouter({
  createSupplier: purchasingProcedure
    .input(createSupplierSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, taxId, address, notes, contactData } = input;
      const companyId = ctx.companyId;

      await addNewSupplier(ctx.db, {
        name,
        taxId,
        address,
        notes,
        companyId,
        contactData,
      });
    }),

  getSuppliersByCompanyId: purchasingProcedure.query(async ({ ctx }) => {
    const companyId = ctx.companyId;

    const suppliers = await findSuppliersByCompanyId(ctx.db, companyId);

    return suppliers;
  }),

  getSupplierById: purchasingProcedure
    .input(z.object({ supplierId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { supplierId } = input;

      const suppliers = await findSupplierBySupplierId(ctx.db, supplierId);

      return suppliers;
    }),

  getSupplierPOsBySupplierId: purchasingProcedure
    .input(z.object({ supplierId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { supplierId } = input;

      const PO = await findSupplierPOsBySupplierId(ctx.db, supplierId);

      return PO;
    }),

  addSupplierContact: purchasingProcedure
    .input(addContactSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        supplierId,
        contactEmail,
        contactName,
        contactNotes,
        contactPhone,
      } = input;

      await addSupplierContact(ctx.db, {
        supplierId,
        contactEmail,
        contactName,
        contactNotes,
        contactPhone,
      });
    }),
});
