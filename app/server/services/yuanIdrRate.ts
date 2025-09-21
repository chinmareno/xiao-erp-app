import { PrismaClient } from "@prisma/client";
import { createYuanIdrRate, getYuanIdrRate } from "../repositories/yuanIdrRate";
import { TRPCError } from "@trpc/server";
import { serviceErrorLogger } from "~/lib/logger/serviceErrorLogger";

export const findYuanIdrRate = async (db: PrismaClient) => {
  try {
    const yuanIdrRate = await getYuanIdrRate(db);

    if (!yuanIdrRate) {
      const apiUrl = process.env.YUAN_IDR_RATE_API;

      if (!apiUrl) {
        serviceErrorLogger({
          method: "findYuanIdrRate",
          error: "YUAN_IDR_RATE_API environment variable is not set",
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Exchange rate API not configured",
        });
      }

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        serviceErrorLogger({
          method: "findYuanIdrRate",
          error: `Failed to fetch from external API: ${response.status} ${errorText}`,
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch exchange rate",
        });
      }

      const result = await response.json();

      if (!result.conversion_rates?.CNY || !result.conversion_rates?.IDR) {
        serviceErrorLogger({
          method: "findYuanIdrRate",
          error: "Invalid API response structure",
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid exchange rate data",
        });
      }

      const cny = result.conversion_rates.CNY as number;
      const idr = result.conversion_rates.IDR as number;

      const newlyCreatedYuanIdrRate = await createYuanIdrRate(db, { cny, idr });

      return newlyCreatedYuanIdrRate;
    }

    return yuanIdrRate;
  } catch (error) {
    serviceErrorLogger({
      method: "findYuanIdrRate",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });

    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get exchange rate",
    });
  }
};
