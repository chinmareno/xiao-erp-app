import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { DBClientType } from "~/types/DBClientType";

type createYuanIdrRateType = {
  idr: number;
  cny: number;
};

export const getYuanIdrRate = async (db: DBClientType) => {
  try {
    const yuanIdrRate = await db.yuanIdrRate.findFirst();

    return yuanIdrRate;
  } catch (error) {
    repositoryErrorLogger({ method: "getYuanIdrRate", error });
    throw error;
  }
};

export const createYuanIdrRate = async (
  db: DBClientType,
  { idr, cny }: createYuanIdrRateType
) => {
  try {
    const yuanIdrRate = await db.yuanIdrRate.create({
      data: {
        idrToYuanRate: cny / idr,
        yuanToIdrRate: idr / cny,
      },
    });

    return yuanIdrRate;
  } catch (error) {
    repositoryErrorLogger({ method: "createYuanIdrRate", error });
    throw error;
  }
};
