/*
  Warnings:

  - Made the column `address` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `industry` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `Supplier` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "industry" SET NOT NULL;

-- AlterTable
ALTER TABLE "Supplier" ALTER COLUMN "address" SET NOT NULL;
