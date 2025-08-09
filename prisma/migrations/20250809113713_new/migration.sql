-- CreateIndex
CREATE INDEX "PurchaseOrder_supplierId_idx" ON "PurchaseOrder"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierProduct_supplierId_itemId_idx" ON "SupplierProduct"("supplierId", "itemId");
