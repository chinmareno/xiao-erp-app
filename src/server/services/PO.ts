import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { createPOSchema, editPOSchema } from "~/schemas/purchasing/PO";
import { TRPCError } from "@trpc/server";
import { findYuanIdrRate } from "./yuanIdrRate";
import {
  updatePONumberFormatCurrentNumberByCompanyId,
  updatePONumberFormatPrefixByCompanyId,
} from "../repositories/PONumberFormat";
import { PONumberFormatter } from "~/lib/PONumberFormatter";
import { findSupplierBySupplierId } from "./supplier";
import { findContactByContactId } from "./contact";
import { findCompanyByCompanyId } from "./company";
import { serviceErrorLogger } from "~/lib/logger/serviceErrorLogger";
import {
  createPOWithItems,
  getLastPOCustomerContactByCompanyId,
  getPOById,
  getPOsByCompanyId,
  updatePOById,
  updatePOStatusById,
} from "../repositories/PO";
import { getPurchasingOrderItemCountsByPOIds } from "../repositories/purchaseOrderItem";
import { findPONumberFormatByCompanyId } from "./PONumberFormat";
import { getItemsByIds } from "../repositories/item";

type makePOType = z.infer<typeof createPOSchema> & { companyId: string };

type editPOByPOIdType = z.infer<typeof editPOSchema> & { companyId: string };

export const makePO = async (
  db: PrismaClient,
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
    companyId,
    POItems,
  }: makePOType
) => {
  const supplier = await findSupplierBySupplierId(db, supplierId);
  const customer = await findCompanyByCompanyId(db, companyId);
  const supplierContact = await findContactByContactId(db, supplierContactId);

  if (!supplier || !customer || !supplierContact) {
    if (!supplier) {
      serviceErrorLogger({
        method: "makePO",
        error: `Supplier with ID ${supplierId} not found`,
      });
    }
    if (!customer) {
      serviceErrorLogger({
        method: "makePO",
        error: `Company with ID ${companyId} not found`,
      });
    }
    if (!supplierContact) {
      serviceErrorLogger({
        method: "makePO",
        error: `Contact with ID ${supplierContactId} not found`,
      });
    }
    throw new TRPCError({ code: "BAD_REQUEST" });
  }

  const yuanIdrRate = await findYuanIdrRate(db);
  const { idrToYuanRate, yuanToIdrRate } = yuanIdrRate;
  const PONumberFormat = await findPONumberFormatByCompanyId(db, companyId);

  const itemIds = POItems.map((POItem) => POItem.itemId);
  const items = await getItemsByIds(db, itemIds);

  const updatedPOItems = POItems.map((POItem) => {
    const item = items.find((i) => i.id === POItem.itemId)!;

    const isIdr = priceCurrency === "IDR";
    const POItemCostIdr = isIdr
      ? POItem.itemCost
      : POItem.itemCost * yuanToIdrRate;
    const POItemCostYuan = isIdr
      ? POItem.itemCost * idrToYuanRate
      : POItem.itemCost;

    return {
      itemId: POItem.itemId,
      itemName: item.name,
      itemCategory: item.category,
      quantity: POItem.quantity,
      costYuan: POItemCostYuan,
      costIdr: POItemCostIdr,
      unit: POItem.unit,
    };
  });

  await db.$transaction(async (tx) => {
    await updatePONumberFormatCurrentNumberByCompanyId(tx, {
      companyId,
      currentNumber: PONumberFormat.currentNumber + 1,
    });
    await createPOWithItems(tx, {
      PONumber: PONumberFormat.formattedPONumber,
      discountTotal,
      grandTotal,
      subTotal,
      taxTotal,
      priceCurrency,
      customerName: customer.name,
      supplierName: supplier.name,
      customerAddress: customer.address,
      customerContactName,
      supplierAdress: supplier.address,
      supplierContactId,
      supplierContactName: supplierContact.name,
      supplierContactPhone: supplierContact.phone,
      supplierContactEmail: supplierContact.email,
      customerContactEmail,
      customerContactPhone,
      supplierId,
      tax,
      discount,
      companyId,
      POItems: updatedPOItems,
    });
  });
};

export const changePONumberFormatPrefix = async (
  db: PrismaClient,
  { prefix, companyId }: { prefix: string; companyId: string }
) => {
  const PONumberFormat = await updatePONumberFormatPrefixByCompanyId(db, {
    prefix,
    companyId,
  });
  const formattedPONumberFormat = PONumberFormatter({
    prefix: PONumberFormat.prefix,
    currentNumber: PONumberFormat.currentNumber,
  });

  return formattedPONumberFormat;
};

export const findLastPOCustomerContactByCompanyId = async (
  db: PrismaClient,
  companyId: string
) => {
  const lastPOCustomerContact = await getLastPOCustomerContactByCompanyId(
    db,
    companyId
  );

  return lastPOCustomerContact;
};

export const findPOsByCompanyId = async (
  db: PrismaClient,
  companyId: string
) => {
  const POs = await getPOsByCompanyId(db, companyId);
  const POIds = POs.map((po) => po.id);

  const poItemCounts = await getPurchasingOrderItemCountsByPOIds(db, POIds);
  const poItemsCountsObj = Object.fromEntries(
    poItemCounts.map((po) => [po.purchaseOrderId, po._count.purchaseOrderId])
  );

  const POsWithTotalItemTypes = POs.map(({ ...PO }) => ({
    ...PO,
    totalItemTypes: poItemsCountsObj[PO.id] ?? 0,
  }));

  return POsWithTotalItemTypes;
};

export const findPOByPOId = async (
  db: PrismaClient,
  { poId, companyId }: { poId: string; companyId: string }
) => {
  const PO = await getPOById(db, { poId, companyId });

  if (!PO) {
    serviceErrorLogger({
      method: "findPOByPOId",
      error: `PO with ID ${poId} not found`,
    });
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }

  return PO;
};

export const changePOStatusByPOId = async (
  db: PrismaClient,
  {
    status,
    poId,
  }: { status: "UNRECEIVED" | "RECEIVED" | "INACTIVE"; poId: string }
) => {
  await updatePOStatusById(db, { status, poId });
};

export const editPOByPOId = async (
  db: PrismaClient,
  {
    customerContactEmail,
    customerContactName,
    customerContactPhone,
    POItems,
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
    companyId,
  }: editPOByPOIdType
) => {
  const supplier = await findSupplierBySupplierId(db, supplierId);
  const customer = await findCompanyByCompanyId(db, companyId);
  const supplierContact = await findContactByContactId(db, supplierContactId);

  if (!supplier || !customer || !supplierContact) {
    if (!supplier) {
      serviceErrorLogger({
        method: "editPOByPOId",
        error: `Supplier with ID ${supplierId} not found`,
      });
    }
    if (!customer) {
      serviceErrorLogger({
        method: "editPOByPOId",
        error: `Company with ID ${companyId} not found`,
      });
    }
    if (!supplierContact) {
      serviceErrorLogger({
        method: "editPOByPOId",
        error: `Contact with ID ${supplierContactId} not found`,
      });
    }
    throw new TRPCError({ code: "BAD_REQUEST" });
  }

  const yuanIdrRate = await findYuanIdrRate(db);
  const { idrToYuanRate, yuanToIdrRate } = yuanIdrRate;
  const itemIds = POItems.map((POItem) => POItem.itemId);
  const items = await getItemsByIds(db, itemIds);

  const updatedPOItems = POItems.map((POItem) => {
    const item = items.find((i) => i.id === POItem.itemId)!;

    const isIdr = priceCurrency === "IDR";
    const POItemCostIdr = isIdr
      ? POItem.itemCost
      : POItem.itemCost * yuanToIdrRate;
    const POItemCostYuan = isIdr
      ? POItem.itemCost * idrToYuanRate
      : POItem.itemCost;

    return {
      itemId: POItem.itemId,
      itemName: item.name,
      itemCategory: item.category,
      quantity: POItem.quantity,
      costYuan: POItemCostYuan,
      costIdr: POItemCostIdr,
      unit: POItem.unit,
    };
  });

  await updatePOById(db, {
    POId,
    discountTotal,
    grandTotal,
    subTotal,
    taxTotal,
    priceCurrency,
    customerName: customer.name,
    supplierName: supplier.name,
    customerAddress: customer.address,
    customerContactName,
    supplierAdress: supplier.address,
    supplierContactId,
    supplierContactName: supplierContact.name,
    supplierContactPhone: supplierContact.phone,
    supplierContactEmail: supplierContact.email,
    customerContactEmail,
    customerContactPhone,
    supplierId,
    tax,
    discount,
    POItems: updatedPOItems,
  });
};
