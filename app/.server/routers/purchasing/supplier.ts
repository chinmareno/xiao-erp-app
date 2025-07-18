import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/.server/trpc.server";

const createSupplierSchema = z
  .object({
    name: z.string().min(1, "Supplier name is required"),
    taxId: z.string().optional(),
    address: z.string().optional(),
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
  create: protectedProcedure
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
        await ctx.db.supplier.create({
          data: {
            ...supplierData,
            contact: {
              create: contactData,
            },
          },
        });
      } else {
        await ctx.db.supplier.create({
          data: supplierData,
        });
      }
    }),
});
