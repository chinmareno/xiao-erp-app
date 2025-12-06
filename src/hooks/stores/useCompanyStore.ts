import { CompanyModules } from "@prisma/client";
import { create } from "zustand";

interface Company {
  id: string;
  name: string;
  address: string;
  desc: string | null;
  industry: string;
  modules: CompanyModules[];
  createdAt: Date;
  updatedAt: Date;
}

interface CompanyStore {
  companies: Company[];
  setCompanies: (companies: Company[]) => void;
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company) => void;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  companies: [],
  setCompanies: (companies) => set({ companies }),
  selectedCompany: null,
  setSelectedCompany: (selectedCompany) => set({ selectedCompany }),
}));
