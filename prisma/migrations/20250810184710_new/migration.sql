/*
  Warnings:

  - Added the required column `discount` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "tax" DOUBLE PRECISION NOT NULL;
