import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { DBClientType } from "~/types/DBClientType";

type CreateSupplierProductType = {
  price: string;
  priceCurrency: string;
  supplierId: string;
  itemId: string;
};

export const createSupplierProduct = async (
  db: DBClientType,
  { price, priceCurrency, supplierId, itemId }: CreateSupplierProductType
) => {
  try {
    await db.supplierProduct.create({
      data: {
        price,
        priceCurrency,
        supplierId,
        itemId,
      },
    });
  } catch (error) {
    repositoryErrorLogger({
      method: "createSupplierProduct",
      error,
    });
  }
};
