import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SupplierPOStore = {
  selectedSupplierPO: string | null;
  setSelectedSupplierPO: (selectedSupplier: string | null) => void;
};

export const useSupplierPOStore = create<SupplierPOStore>()(
  persist(
    (set) => ({
      selectedSupplierPO: null,
      setSelectedSupplierPO: (selectedSupplierPO) =>
        set({ selectedSupplierPO }),
    }),
    {
      name: "selected-supplier-PO",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
