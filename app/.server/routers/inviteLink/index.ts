import { z } from "zod";
import { nanoid } from "nanoid";
import { createTRPCRouter, ownerProcedure } from "~/.server/trpc.server";

export const inviteLinkRouter = createTRPCRouter({
  create: ownerProcedure
    .input(
      z.object({
        companyId: z.string().min(1, "Company ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { companyId } = input;

      const token = nanoid(24);

      const EXPIRED_MINUTE = 15;
      const expiresAt = new Date(Date.now() + EXPIRED_MINUTE * 60 * 1000);

      await ctx.db.inviteLink.create({
        data: {
          token,
          companyId,
          expiresAt,
        },
        select: { id: true },
      });

      const inviteLink = `${process.env.APP_URL}/invite/${token}`;
      return inviteLink;
    }),
});
