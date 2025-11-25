import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type InviteLinkTokenStore = {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
};

export const useInviteLinkTokenStore = create<InviteLinkTokenStore>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
    }),
    {
      name: "invite-link-token",
      // Session storage to persist invite link token when user reload the page
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
