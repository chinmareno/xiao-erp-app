import { create } from "zustand";

type CompanyModules = "ACCOUNTING" | "SALES" | "INVENTORY" | "PURCHASING";

type Company = {
  id: string;
  name: string;
  desc?: string | null;
  address?: string | null;
  industry?: string | null;
  modules: CompanyModules[];
  createdAt?: Date;
  updatedAt?: Date;
};

type CompanyStore = {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company) => void;
};

export const useCompanyStore = create<CompanyStore>((set) => ({
  selectedCompany: null,
  setSelectedCompany: (company) => set({ selectedCompany: company }),
}));
