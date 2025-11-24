import { ItemCategory } from "@prisma/client";
import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { DBClientType } from "~/types/DBClientType";

type POItemType = {
  itemId: string;
  itemName: string;
  itemCategory: ItemCategory;
  quantity: number;
  costYuan: number;
  costIdr: number;
  unit: string;
};

type POSupplierType = {
  supplierName: string;
  supplierAdress: string;
  supplierContactId: string;
  supplierContactName: string;
  supplierContactPhone: string | null;
  supplierContactEmail: string | null;
  supplierId: string;
};

type POCustomerType = {
  customerName: string;
  customerAddress: string;
  customerContactName: string;
  customerContactEmail: string;
  customerContactPhone: string;
};

type POType = {
  PONumber: string;
  discount: number;
  discountTotal: string;
  grandTotal: string;
  subTotal: string;
  tax: number;
  taxTotal: string;
  priceCurrency: "IDR" | "YUAN";
  POItems: POItemType[];
} & POCustomerType &
  POSupplierType;

type CreatePOWithItemsType = {
  companyId: string;
} & POType;

type UpdatePOByIdType = { POId: string } & Omit<POType, "PONumber">;

export const createPOWithItems = async (
  db: DBClientType,
  {
    PONumber,
    discountTotal,
    grandTotal,
    subTotal,
    taxTotal,
    priceCurrency,
    customerName,
    supplierName,
    customerAddress,
    customerContactName,
    supplierAdress,
    supplierContactId,
    supplierContactName,
    supplierContactPhone,
    supplierContactEmail,
    customerContactEmail,
    customerContactPhone,
    supplierId,
    tax,
    discount,
    companyId,
    POItems,
  }: CreatePOWithItemsType
) => {
  try {
    await db.purchaseOrder.create({
      data: {
        PONumber,
        discountTotal,
        grandTotal,
        subTotal,
        taxTotal,
        priceCurrency,
        customerName,
        customerAddress,
        customerContactName,
        supplierName,
        supplierAdress,
        supplierContactId,
        supplierContactName,
        supplierContactPhone,
        supplierContactEmail,
        customerContactEmail,
        customerContactPhone,
        supplierId,
        tax,
        discount,
        companyId,
        POItems: {
          createMany: { data: POItems },
        },
      },
    });
  } catch (error) {
    repositoryErrorLogger({ method: "createPOWithItems", error });
    throw error;
  }
};

export const getLastPOCustomerContactByCompanyId = async (
  db: DBClientType,
  companyId: string
) => {
  try {
    const customerContact = await db.purchaseOrder.findFirst({
      where: { companyId },
      select: {
        customerContactName: true,
        customerContactEmail: true,
        customerContactPhone: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return customerContact;
  } catch (error) {
    repositoryErrorLogger({
      method: "getLastPOCustomerContactByCompanyId",
      error,
    });
    throw error;
  }
};

export const getPOsByCompanyId = async (
  db: DBClientType,
  companyId: string
) => {
  try {
    const POs = await db.purchaseOrder.findMany({
      where: { companyId },
      include: { supplier: { select: { taxId: true } } },
      orderBy: { createdAt: "desc" },
    });
    const POsFlattened = POs.map(({ supplier, ...po }) => ({
      ...po,
      supplierTaxId: supplier?.taxId ?? null,
    }));

    return POsFlattened;
  } catch (error) {
    repositoryErrorLogger({
      method: "getPOsByCompanyId",
      error,
    });
    throw error;
  }
};

export const getPOById = async (
  db: DBClientType,
  { poId, companyId }: { poId: string; companyId: string }
) => {
  try {
    const PO = await db.purchaseOrder.findUnique({
      where: { id: poId, companyId },
      include: {
        POItems: { include: { item: true } },
      },
    });

    return PO;
  } catch (error) {
    repositoryErrorLogger({
      method: "getPOById",
      error,
    });
    throw error;
  }
};

export const getPOsBySupplierId = async (
  db: DBClientType,
  supplierId: string
) => {
  try {
    const POs = await db.purchaseOrder.findMany({
      where: { supplierId },
      include: {
        supplier: { select: { taxId: true } },
      },
    });

    const poIds = POs.map((po) => po.id);
    const poItemCounts = await db.purchaseOrderItem.groupBy({
      by: ["purchaseOrderId"],
      _count: { purchaseOrderId: true },
      where: {
        purchaseOrderId: { in: poIds },
      },
    });

    const flattenedPOs = POs.map(({ supplier, id, ...rest }) => {
      const poItemCount = poItemCounts.find(
        ({ purchaseOrderId }) => purchaseOrderId === id
      );
      return {
        ...rest,
        id,
        supplierTaxId: supplier.taxId,
        totalItemTypes: poItemCount?._count.purchaseOrderId as number,
      };
    });

    return flattenedPOs;
  } catch (error) {
    repositoryErrorLogger({
      method: "getPOsBySupplierId",
      error,
    });
    throw error;
  }
};

export const updatePOStatusById = async (
  db: DBClientType,
  {
    status,
    poId,
  }: { status: "UNRECEIVED" | "RECEIVED" | "INACTIVE"; poId: string }
) => {
  try {
    await db.purchaseOrder.update({
      where: { id: poId },
      data: { status },
    });
  } catch (error) {
    repositoryErrorLogger({
      method: "updatePOStatusById",
      error,
    });
    throw error;
  }
};

export const updatePOById = async (
  db: DBClientType,
  {
    customerContactEmail,
    customerContactName,
    customerContactPhone,
    priceCurrency,
    supplierContactId,
    supplierId,
    discount,
    tax,
    discountTotal,
    taxTotal,
    subTotal,
    grandTotal,
    POId,
    customerName,
    supplierName,
    customerAddress,
    supplierAdress,
    supplierContactName,
    supplierContactPhone,
    supplierContactEmail,
    POItems,
  }: UpdatePOByIdType
) => {
  try {
    await db.purchaseOrder.update({
      where: { id: POId },
      data: {
        discountTotal,
        grandTotal,
        subTotal,
        taxTotal,
        priceCurrency,
        customerName,
        supplierName,
        customerAddress,
        customerContactName,
        supplierAdress,
        supplierContactId,
        supplierContactName,
        supplierContactPhone,
        supplierContactEmail,
        customerContactEmail,
        customerContactPhone,
        supplierId,
        tax,
        discount,

        POItems: {
          deleteMany: {},
          createMany: { data: POItems },
        },
      },
    });
  } catch (error) {
    repositoryErrorLogger({
      method: "updatePOById",
      error,
    });
    throw error;
  }
};
