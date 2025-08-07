/*
  Warnings:

  - You are about to drop the column `costIdr` on the `SupplierProduct` table. All the data in the column will be lost.
  - You are about to drop the column `costYuan` on the `SupplierProduct` table. All the data in the column will be lost.
  - Added the required column `contactId` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerAddress` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerContactName` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierAdress` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierContactName` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `SupplierProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceCurrency` to the `SupplierProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "contactId" TEXT NOT NULL,
ADD COLUMN     "customerAddress" TEXT NOT NULL,
ADD COLUMN     "customerContactEmail" TEXT,
ADD COLUMN     "customerContactName" TEXT NOT NULL,
ADD COLUMN     "customerContactPhone" TEXT,
ADD COLUMN     "supplierAdress" TEXT NOT NULL,
ADD COLUMN     "supplierContactEmail" TEXT,
ADD COLUMN     "supplierContactName" TEXT NOT NULL,
ADD COLUMN     "supplierContactPhone" TEXT;

-- AlterTable
ALTER TABLE "SupplierProduct" DROP COLUMN "costIdr",
DROP COLUMN "costYuan",
ADD COLUMN     "price" TEXT NOT NULL,
ADD COLUMN     "priceCurrency" TEXT NOT NULL;
