/*
  Warnings:

  - Added the required column `discountTotal` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grandTotal` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subTotal` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxTotal` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "discountTotal" TEXT NOT NULL,
ADD COLUMN     "grandTotal" TEXT NOT NULL,
ADD COLUMN     "subTotal" TEXT NOT NULL,
ADD COLUMN     "taxTotal" TEXT NOT NULL;
