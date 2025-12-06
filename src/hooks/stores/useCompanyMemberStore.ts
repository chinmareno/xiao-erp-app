import { CompanyModules, CompanyRole } from "@prisma/client";
import { create } from "zustand";

interface CompanyMember {
  id: string;
  userId: string;
  companyId: string;
  role: CompanyRole;
  permissions: CompanyModules[];
  joinedAt: Date;
}

interface CompanyMemberStore {
  companyMember: CompanyMember | null;
  setCompanyMember: (member: CompanyMember) => void;
}

export const useCompanyMemberStore = create<CompanyMemberStore>((set) => ({
  companyMember: null,
  setCompanyMember: (companyMember) => set({ companyMember }),
}));
