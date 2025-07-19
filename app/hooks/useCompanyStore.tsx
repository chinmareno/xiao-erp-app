import { create } from "zustand";

type CompanyModule = "ACCOUNTING" | "SALES" | "INVENTORY" | "PURCHASING";

type Company = {
  id: string;
  name: string;
  desc?: string | null;
  address?: string | null;
  industry?: string | null;
  modules: CompanyModule[];
  createdAt?: Date;
  updatedAt?: Date;
};

type CompanyStore = {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company) => void;
  permissions: CompanyModule[] | null;
  setPermissions: (companyModules: CompanyModule[]) => void;
};

export const useCompanyStore = create<CompanyStore>((set) => ({
  selectedCompany: null,
  setSelectedCompany: (company) => set({ selectedCompany: company }),
  permissions: null,
  setPermissions: (companyModules) => set({ permissions: companyModules }),
}));
