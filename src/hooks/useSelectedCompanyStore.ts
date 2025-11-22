import { Company, CompanyModules } from "@prisma/client";
import { create } from "zustand";

interface CompanyStore {
  permissions: CompanyModules[] | null;
  setPermissions: (permission: CompanyModules[]) => void;
  company: Company | null;
  setCompany: (company: Company) => void;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  permissions: null,
  company: null,

  setPermissions: (permissions) => set({ permissions: permissions }),
  setCompany: (company) => set({ company: company }),
}));
