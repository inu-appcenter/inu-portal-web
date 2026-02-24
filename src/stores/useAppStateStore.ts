import { ROUTES } from "@/constants/routes";
import { create } from "zustand";

interface AppState {
  isAppUrl: string;
  setIsAppUrl: (isApp: string) => void;
}

const useAppStateStore = create<AppState>((set) => ({
  isAppUrl: ROUTES.ROOT,
  setIsAppUrl: (isAppUrl) => {
    set(() => ({ isAppUrl }));
  },
}));

export default useAppStateStore;
