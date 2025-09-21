import { z } from "zod";
import { repositoryErrorLogger } from "~/lib/logger/repositoryErrorLogger";
import { editPOSchema } from "~/schemas/purchasing/PO";
import { DBClientType } from "~/types/DBClientType";

type CreatePOWithItemsType = {
  PONumber: string;
  discountTotal: string;
  grandTotal: string;
  subTotal: string;
  taxTotal: string;
  priceCurrency: "IDR" | "YUAN";
  customerName: string;
  supplierName: string;
  customerAddress: string;
  customerContactName: string;
  supplierAdress: string;
  supplierContactId: string;
  supplierContactName: string;
  supplierContactPhone: string | null;
  supplierContactEmail: string | null;
  customerContactEmail: string;
  customerContactPhone: string;
  supplierId: string;
  tax: number;
  discount: number;
  companyId: string;

  items: {
    itemId: string;
    quantity: number;
    costYuan: number;
    costIdr: number;
    unit: string;
  }[];
};

type UpdatePOByIdType = Omit<
  z.infer<typeof editPOSchema>,
  "items" | "tax" | "discount"
> & {
  customerName: string;
  supplierName: string;
  customerAddress: string;
  supplierAdress: string;
  supplierContactName: string;
  supplierContactPhone: string | null;
  supplierContactEmail: string | null;
  tax: number;
  discount: number;
  items: {
    itemId: string;
    quantity: number;
    costYuan: number;
    costIdr: number;
    unit: string;
  }[];
};

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
    items,
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
        items: {
          createMany: { data: items },
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
        items: { include: { item: true } },
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
    items,
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
        tax: Number(tax),
        discount: Number(discount),

        items: {
          deleteMany: {},
          createMany: { data: items },
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
