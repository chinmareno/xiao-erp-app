import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type POStatus = "unreceived" | "received" | "inactive";

type POStatusFilterStore = {
  selectedStatus: POStatus;
  setSelectedStatus: (selectedStatus: POStatus) => void;
};

export const usePOStatusFilterStore = create<POStatusFilterStore>()(
  persist(
    (set) => ({
      selectedStatus: "unreceived",
      setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
    }),
    {
      name: "PO-status-filter",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
