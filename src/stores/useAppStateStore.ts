import { create } from "zustand";

interface AppState {
  isAppUrl: string;
  setIsAppUrl: (isApp: string) => void;
}

const useAppStateStore = create<AppState>((set) => ({
  isAppUrl: "/m",
  setIsAppUrl: (isAppUrl) => {
    set(() => ({ isAppUrl }));
  },
}));

export default useAppStateStore;
