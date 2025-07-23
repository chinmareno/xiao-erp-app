-- DropForeignKey
ALTER TABLE "CompanyMember" DROP CONSTRAINT "CompanyMember_companyId_fkey";

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
