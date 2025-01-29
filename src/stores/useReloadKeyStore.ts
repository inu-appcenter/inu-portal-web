import { create } from "zustand";

interface ReloadKeyStore {
  reloadKey: number;
  triggerReload: () => void;
}

const useReloadKeyStore = create<ReloadKeyStore>((set) => ({
  reloadKey: 0,
  triggerReload: () =>
    set((state) => ({
      reloadKey: state.reloadKey + 1,
    })),
}));

export default useReloadKeyStore;
