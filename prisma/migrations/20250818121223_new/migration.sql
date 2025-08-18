-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('SUPPLIER', 'SALES', 'INVENTORY');

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "type" "ContactType" NOT NULL DEFAULT 'SUPPLIER';

-- AlterTable
ALTER TABLE "Warehouse" ADD COLUMN     "pic" TEXT;
