import { PrismaClient } from "@prisma/client";
import {
  createPONumberFormat,
  getPONumberFormatByCompanyId,
} from "../repositories/PONumberFormat";
import { PONumberFormatter } from "~/lib/PONumberFormatter";

export const findPONumberFormatByCompanyId = async (
  db: PrismaClient,
  companyId: string
) => {
  const PONumberFormat = await getPONumberFormatByCompanyId(db, companyId);

  if (!PONumberFormat) {
    const newlyCreatedPONumberFormatData = await createPONumberFormat(
      db,
      companyId
    );
    const { prefix, currentNumber } = newlyCreatedPONumberFormatData;

    const formattedPONumber = PONumberFormatter({ prefix, currentNumber });
    return { prefix, currentNumber, formattedPONumber };
  }

  const { prefix, currentNumber } = PONumberFormat;
  const formattedPONumber = PONumberFormatter({ prefix, currentNumber });

  return { prefix, currentNumber, formattedPONumber };
};
