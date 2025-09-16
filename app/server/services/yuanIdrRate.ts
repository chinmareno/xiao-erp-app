import { PrismaClient } from "@prisma/client";
import { createYuanIdrRate, getYuanIdrRate } from "../repositories/yuanIdrRate";
import { TRPCError } from "@trpc/server";
import { serviceErrorLogger } from "~/lib/logger/serviceErrorLogger";

export const findYuanIdrRate = async (db: PrismaClient) => {
  const yuanIdrRate = await getYuanIdrRate(db);
  if (!yuanIdrRate) {
    const response = await fetch(process.env.YUAN_IDR_RATE as string);

    if (!response.ok) {
      serviceErrorLogger({
        method: "findYuanIdrRate",
        error: "Failed to fetch from external api because " + response.text,
      });
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    const result = await response.json();
    const cny = result.conversion_rates.CNY as number;
    const idr = result.conversion_rates.IDR as number;

    const newlyCreatedYuanIdrRate = await createYuanIdrRate(db, { cny, idr });

    return newlyCreatedYuanIdrRate;
  }

  return yuanIdrRate;
};
