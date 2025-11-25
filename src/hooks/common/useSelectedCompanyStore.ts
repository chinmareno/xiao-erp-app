import { Company, CompanyModules } from "@prisma/client";
import { create } from "zustand";

interface CompanyStore {
  permissions: CompanyModules[] | null;
  setPermissions: (permission: CompanyModules[]) => void;
  selectedCompany: Company | null;
  setSelectedCompany: (selectedCompany: Company) => void;
}

export const useSelectedCompanyStore = create<CompanyStore>((set) => ({
  permissions: null,
  selectedCompany: null,

  setPermissions: (permissions) => set({ permissions }),
  setSelectedCompany: (selectedCompany) => set({ selectedCompany }),
}));
