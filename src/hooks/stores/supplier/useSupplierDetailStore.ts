import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SupplierDetailStore = {
  activeTab: "products" | "pos";
  setActiveTab: (tab: "products" | "pos") => void;
};

export const useSupplierDetailStore = create<SupplierDetailStore>()(
  persist(
    (set) => ({
      activeTab: "products",
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "supplier-detail-active-tab",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
