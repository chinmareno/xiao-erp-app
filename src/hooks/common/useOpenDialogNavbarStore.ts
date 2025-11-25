import { create } from "zustand";

interface OpenDialogNavbarState {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
}

export const useOpenDialogNavbarStore = create<OpenDialogNavbarState>(
  (set) => ({
    openDialog: true,
    setOpenDialog: (openDialog) => set({ openDialog }),
  })
);
