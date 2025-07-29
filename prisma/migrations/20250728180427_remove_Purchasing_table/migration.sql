/*
  Warnings:

  - You are about to drop the column `purchasingId` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the `Purchasing` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `companyId` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Purchasing" DROP CONSTRAINT "Purchasing_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_purchasingId_fkey";

-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "purchasingId",
ADD COLUMN     "companyId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Purchasing";

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
