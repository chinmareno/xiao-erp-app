-- AlterTable
ALTER TABLE "PurchaseOrderItem" ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'pcs';

-- CreateIndex
CREATE INDEX "Supplier_companyId_idx" ON "Supplier"("companyId");
