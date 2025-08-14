import { z } from "zod";
import { createTRPCRouter, purchasingProcedure } from "~/api/trpc.server";

const npwpRegex = /^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/;

const createSupplierSchema = z
  .object({
    name: z.string().min(1, "Supplier name is required"),
    taxId: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val.trim()))
      .pipe(
        z.union([z.string().regex(npwpRegex, "Invalid NPWP format"), z.null()])
      )
      .nullable(),
    address: z.string(),
    notes: z.string().optional(),

    contactName: z.string().nullable(),
    contactPhone: z.string().trim().nullable(),
    contactEmail: z.string().nullable(),
    contactNotes: z.string().nullable(),
  })
  .refine(
    (data) => {
      if (data.contactName) {
        const hasContactWays = data.contactPhone || data.contactEmail;
        return hasContactWays;
      }
      return true;
    },
    {
      message:
        "At least one contact method (phone or email) is required when contact name is filled.",
      path: ["contactName"],
    }
  )
  .refine(
    (data) => {
      if (data.contactPhone || data.contactEmail || data.contactNotes) {
        return data.contactName;
      }
      return true;
    },
    {
      message: "Did you forget to fill in the contact name?",
      path: ["contactName"],
    }
  );

export const supplierRouter = createTRPCRouter({
  createSupplier: purchasingProcedure
    .input(createSupplierSchema)
    .mutation(async ({ ctx, input }) => {
      const isHaveContact = !!input.contactName;

      const supplierData = {
        name: input.name,
        address: input.address,
        notes: input.notes,
        taxId: input.taxId,
      };

      const contactData = {
        name: input.contactName as string,
        email: input.contactEmail,
        phone: input.contactPhone,
        notes: input.notes,
      };

      if (isHaveContact) {
        await ctx.db.company.update({
          where: { id: ctx.companyId },
          data: {
            suppliers: {
              create: {
                ...supplierData,
                contact: { create: contactData },
              },
            },
          },
        });
      } else {
        await ctx.db.company.update({
          where: { id: ctx.companyId },
          data: {
            suppliers: {
              create: supplierData,
            },
          },
        });
      }
    }),

  getSuppliersByCompanyId: purchasingProcedure.query(async ({ ctx }) => {
    const suppliers = await ctx.db.supplier.findMany({
      where: {
        companyId: ctx.companyId,
      },
      include: { contact: true },
    });

    return suppliers;
  }),

  getSupplierProductsBySupplierId: purchasingProcedure
    .input(z.object({ supplierId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { supplierId } = input;

      const supplierWithProducts = await ctx.db.supplier.findUnique({
        where: { id: supplierId },
        include: { _count: true, products: { include: { item: true } } },
      });

      if (!supplierWithProducts) throw new Error("Not Found");

      const flatProductsDetails = supplierWithProducts.products.map(
        (product) => ({
          id: product.id,
          itemId: product.item.id,
          name: product.item.name,
          price: product.price,
          priceCurrency: product.priceCurrency,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })
      );

      const supplierDetails = {
        name: supplierWithProducts.name,
        createdAt: supplierWithProducts.createdAt,
        updatedAt: supplierWithProducts.updatedAt,
        address: supplierWithProducts.address,
        taxId: supplierWithProducts.taxId,
        notes: supplierWithProducts.notes,
        products: flatProductsDetails,
        _count: supplierWithProducts._count,
      };

      return supplierDetails;
    }),

  getSupplierPOsBySupplierId: purchasingProcedure
    .input(z.object({ supplierId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { supplierId } = input;

      const supplierDetails = await ctx.db.supplier.findUnique({
        where: { id: supplierId },
        include: { purchaseOrders: true },
      });

      if (!supplierDetails || !supplierDetails.purchaseOrders)
        throw new Error("Not Found");

      const supplierPOs = supplierDetails.purchaseOrders;
      const poIds = supplierPOs.map((po) => po.id);

      const poItemCounts = await ctx.db.purchaseOrderItem.groupBy({
        by: ["purchaseOrderId"],
        _count: { purchaseOrderId: true },
        where: {
          purchaseOrderId: { in: poIds },
        },
      });

      const poItemsCountsObj = Object.fromEntries(
        poItemCounts.map((po) => [
          po.purchaseOrderId,
          po._count.purchaseOrderId,
        ])
      );

      const supplierPOsWithTotalItemTypes = supplierPOs.map((PO) => ({
        ...PO,
        totalItemTypes: poItemsCountsObj[PO.id],
        supplierTaxId: supplierDetails.taxId,
      }));

      return supplierPOsWithTotalItemTypes;
    }),

  addSupplierContact: purchasingProcedure
    .input(
      z.object({
        supplierId: z.string().min(1, "Supplier is required"),
        contactName: z.string().min(1, "Contact name is required"),
        contactPhone: z.string().nullable(),
        contactEmail: z.string().nullable(),
        contactNotes: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.supplier.update({
        where: { id: input.supplierId },
        data: {
          contact: {
            create: {
              name: input.contactName,
              phone: input.contactPhone,
              email: input.contactEmail,
              notes: input.contactNotes,
            },
          },
        },
      });
    }),
});
