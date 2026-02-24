// src/stores/useScrollStore.ts
import { create } from "zustand";

interface ScrollState {
  scrollPositions: Record<string, number>;
  setScrollPosition: (path: string, position: number) => void;
}

const useScrollStore = create<ScrollState>((set) => ({
  scrollPositions: {},
  setScrollPosition: (path, position) =>
    set((state) => ({
      scrollPositions: { ...state.scrollPositions, [path]: position },
    })),
}));

export default useScrollStore;
