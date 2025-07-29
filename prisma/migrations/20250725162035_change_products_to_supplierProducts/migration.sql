/*
  Warnings:

  - You are about to drop the column `productId` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `cost` on the `StockItem` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `StockItem` table. All the data in the column will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `supplierProductId` to the `PurchaseOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costIdr` to the `StockItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costYuan` to the `StockItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierProductId` to the `StockItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_itemId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrderItem" DROP CONSTRAINT "PurchaseOrderItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "StockItem" DROP CONSTRAINT "StockItem_productId_fkey";

-- AlterTable
ALTER TABLE "PurchaseOrderItem" DROP COLUMN "productId",
ADD COLUMN     "supplierProductId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StockItem" DROP COLUMN "cost",
DROP COLUMN "productId",
ADD COLUMN     "costIdr" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "costYuan" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "supplierProductId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Product";

-- CreateTable
CREATE TABLE "SupplierProduct" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "costIdr" DOUBLE PRECISION NOT NULL,
    "costYuan" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierProduct_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SupplierProduct" ADD CONSTRAINT "SupplierProduct_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierProduct" ADD CONSTRAINT "SupplierProduct_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_supplierProductId_fkey" FOREIGN KEY ("supplierProductId") REFERENCES "SupplierProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_supplierProductId_fkey" FOREIGN KEY ("supplierProductId") REFERENCES "SupplierProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
