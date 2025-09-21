/*
  Warnings:

  - The `priceCurrency` column on the `PurchaseOrder` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `priceCurrency` on the `SupplierProduct` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PriceCurrency" AS ENUM ('IDR', 'YUAN');

-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "priceCurrency",
ADD COLUMN     "priceCurrency" "PriceCurrency" NOT NULL DEFAULT 'IDR';

-- AlterTable
ALTER TABLE "SupplierProduct" DROP COLUMN "priceCurrency",
ADD COLUMN     "priceCurrency" "PriceCurrency" NOT NULL;
