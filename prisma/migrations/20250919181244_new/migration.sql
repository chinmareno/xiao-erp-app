/*
  Warnings:

  - A unique constraint covering the columns `[name,companyId]` on the table `Item` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Item_name_companyId_key" ON "Item"("name", "companyId");
