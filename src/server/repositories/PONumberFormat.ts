import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { DBClientType } from "~/types/DBClientType";

export const getPONumberFormatByCompanyId = async (
  db: DBClientType,
  companyId: string
) => {
  try {
    const PONumberFormat = await db.pONumberFormat.findFirst({
      where: { companyId: companyId },
    });

    return PONumberFormat;
  } catch (error) {
    repositoryErrorLogger({ method: "getPONumberFormatByCompanyId", error });
    throw error;
  }
};
export const createPONumberFormat = async (
  db: DBClientType,
  companyId: string
) => {
  try {
    const PONumberFormat = await db.pONumberFormat.create({
      data: { prefix: "PO", companyId },
    });

    return PONumberFormat;
  } catch (error) {
    repositoryErrorLogger({ method: "createPONumberFormatByCompanyId", error });
    throw error;
  }
};

export const updatePONumberFormatCurrentNumberByCompanyId = async (
  db: DBClientType,
  {
    currentNumber,
    companyId,
  }: {
    currentNumber: number;
    companyId: string;
  }
) => {
  try {
    const PONumberFormat = await db.pONumberFormat.update({
      data: { currentNumber },
      where: { companyId },
    });

    return PONumberFormat;
  } catch (error) {
    repositoryErrorLogger({
      method: "updatePONumberFormatCurrentNumberByCompanyId",
      error,
    });
    throw error;
  }
};

export const updatePONumberFormatPrefixByCompanyId = async (
  db: DBClientType,
  {
    prefix,
    companyId,
  }: {
    prefix: string;
    companyId: string;
  }
) => {
  try {
    const PONumberFormat = await db.pONumberFormat.update({
      where: { companyId },
      data: { prefix },
    });

    return PONumberFormat;
  } catch (error) {
    repositoryErrorLogger({
      method: "updatePONumberFormatPrefixByCompanyId",
      error,
    });
    throw error;
  }
};
