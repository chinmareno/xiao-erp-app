-- CreateEnum
CREATE TYPE "CompanyModules" AS ENUM ('SALES', 'INVENTORY', 'PURCHASING');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "modules" "CompanyModules"[] DEFAULT ARRAY['PURCHASING', 'INVENTORY', 'SALES']::"CompanyModules"[];
