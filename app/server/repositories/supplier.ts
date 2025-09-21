import { z } from "zod";
import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { createSupplierSchema } from "~/schemas/purchasing/supplier";
import { DBClientType } from "~/types/DBClientType";

type CreateSupplierType = Omit<
  z.infer<typeof createSupplierSchema>,
  "contactData"
> & {
  companyId: string;
};

export const getSupplierById = async (db: DBClientType, supplierId: string) => {
  try {
    const supplier = await db.supplier.findUnique({
      where: {
        id: supplierId,
      },
      include: { contact: true, products: { include: { item: true } } },
    });

    if (!supplier) return null;

    const { products, ...restSupplier } = supplier;

    const flattenedProducts = products.map(({ item, ...rest }) => ({
      ...rest,
      itemId: item.id,
      itemCategory: item.category,
      itemName: item.name,
    }));

    const flattenedSupplier = { ...restSupplier, products: flattenedProducts };

    return flattenedSupplier;
  } catch (error) {
    repositoryErrorLogger({ method: "getSupplierById", error });
    throw error;
  }
};

export const getSuppliersByCompanyId = async (
  db: DBClientType,
  companyId: string
) => {
  try {
    const suppliers = await db.supplier.findMany({
      where: {
        companyId,
      },
      include: { contact: true },
    });

    return suppliers;
  } catch (error) {
    repositoryErrorLogger({ method: "getSuppliersByCompanyId", error });
    throw error;
  }
};

export const getSupplierIdById = async (
  db: DBClientType,
  supplierId: string
) => {
  try {
    const supplier = await db.supplier.findUnique({
      where: {
        id: supplierId,
      },
      select: { id: true },
    });

    return supplier;
  } catch (error) {
    repositoryErrorLogger({ method: "getSupplierIdById", error });
    throw error;
  }
};

export const createSupplier = async (
  db: DBClientType,
  { name, taxId, address, notes, companyId }: CreateSupplierType
) => {
  try {
    const supplier = await db.supplier.create({
      data: {
        name,
        taxId,
        address,
        notes,
        companyId,
      },
    });

    return supplier;
  } catch (error) {
    repositoryErrorLogger({ method: "createSupplier", error });
    throw error;
  }
};
