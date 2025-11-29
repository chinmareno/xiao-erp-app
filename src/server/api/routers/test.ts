import z from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const testRouter = createTRPCRouter({
  checkaja: publicProcedure.query(async ({ ctx }) => {
    console.log("object");
    return { aa: "ssssss" };
  }),
  checkajas: publicProcedure.mutation(async ({ ctx }) => {
    console.log("object");
    return "mutate";
  }),
});
