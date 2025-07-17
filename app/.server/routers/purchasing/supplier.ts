import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/.server/trpc.server";

const createSupplierSchema = z
  .object({
    // Supplier fields
    name: z.string().min(1, "Supplier name is required"),
    taxId: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),

    // Contact fields (optional)
    contactName: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val)),
    contactPhone: z
      .string()
      .trim()
      .transform((val) => (val.trim() === "" ? null : val))

      .refine(
        (val) =>
          val === null || val === undefined || /^[0-9+\-\s()]+$/.test(val),
        {
          message: "Invalid phone number",
        }
      ),
    contactEmail: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val))
      .refine(
        (val) => val === null || z.string().email().safeParse(val).success,
        { message: "Invalid email format" }
      ),
    contactNotes: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val)),
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
      try {
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

        return { success: true };
      } catch (error) {
        console.log("Error happen  supplier router: " + error);
        return { success: false, message: "Uncaught Error" };
      }
    }),
});
