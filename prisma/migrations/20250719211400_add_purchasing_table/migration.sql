/*
  Warnings:

  - Added the required column `purchasingId` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CompanyMember" ADD COLUMN     "permissions" "CompanyModules"[] DEFAULT ARRAY['PURCHASING', 'INVENTORY', 'SALES']::"CompanyModules"[];

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "purchasingId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Purchasing" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "Purchasing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Purchasing_companyId_key" ON "Purchasing"("companyId");

-- AddForeignKey
ALTER TABLE "Purchasing" ADD CONSTRAINT "Purchasing_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_purchasingId_fkey" FOREIGN KEY ("purchasingId") REFERENCES "Purchasing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
