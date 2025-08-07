/*
  Warnings:

  - You are about to drop the column `contactId` on the `PurchaseOrder` table. All the data in the column will be lost.
  - Added the required column `supplierContactId` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "contactId",
ADD COLUMN     "supplierContactId" TEXT NOT NULL;
