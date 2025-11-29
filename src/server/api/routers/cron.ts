import { TRPCError } from "@trpc/server";
import { createTRPCRouter, cronProcedure } from "../trpc";

export const cronRouter = createTRPCRouter({
  deleteExpiredInviteLinks: cronProcedure.mutation(async ({ ctx }) => {
    try {
      const now = new Date();
      await ctx.db.inviteLink.deleteMany({
        where: { expiresAt: { lt: now } },
      });
    } catch (error) {
      console.error("Error deleting expired invite links:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete expired invite links",
      });
    }
  }),
});
