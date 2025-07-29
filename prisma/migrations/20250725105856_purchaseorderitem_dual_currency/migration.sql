/*
  Warnings:

  - You are about to drop the column `cost` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - Added the required column `costIdr` to the `PurchaseOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costYuan` to the `PurchaseOrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseOrderItem" DROP COLUMN "cost",
ADD COLUMN     "costIdr" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "costYuan" DOUBLE PRECISION NOT NULL;
