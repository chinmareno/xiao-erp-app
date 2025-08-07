/*
  Warnings:

  - Added the required column `customerName` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierName` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "supplierName" TEXT NOT NULL;
