import { create } from "zustand";

interface ResetTipsStore {
  resetKey: number;
  triggerReset: () => void;
}

export const useResetTipsStore = create<ResetTipsStore>((set) => ({
  resetKey: 0, // 초기 key 값
  triggerReset: () => {
    console.log("reset");
    set((state) => ({ resetKey: state.resetKey + 1 }));
  }, // key 값을 증가시켜 리셋
}));
