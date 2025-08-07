/*
  Warnings:

  - You are about to drop the column `supplierProductId` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - Added the required column `itemId` to the `PurchaseOrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PurchaseOrderItem" DROP CONSTRAINT "PurchaseOrderItem_supplierProductId_fkey";

-- AlterTable
ALTER TABLE "PurchaseOrderItem" DROP COLUMN "supplierProductId",
ADD COLUMN     "itemId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
