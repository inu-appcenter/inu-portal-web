import { create } from "zustand";

interface ResetWriteStore {
  resetKey: number;
  triggerReset: () => void;
}

export const useResetWriteStore = create<ResetWriteStore>((set) => ({
  resetKey: 0, // 초기 key 값
  triggerReset: () => {
    set((state) => ({ resetKey: state.resetKey + 1 }));
  }, // key 값을 증가시켜 리셋
}));
