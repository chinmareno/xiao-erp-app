/*
  Warnings:

  - You are about to drop the column `expectedDelivery` on the `PurchaseOrder` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[companyId,PONumber]` on the table `PurchaseOrder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `PONumber` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "expectedDelivery",
ADD COLUMN     "PONumber" TEXT NOT NULL,
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "expectedFullReceivedDate" TIMESTAMP(3),
ADD COLUMN     "lastReceivedDate" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_companyId_PONumber_key" ON "PurchaseOrder"("companyId", "PONumber");

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
