import { create } from "zustand";

interface AIChatState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const isProduction =
  import.meta.env.VITE_API_BASE_URL === "https://portal.inuappcenter.kr/";

const useAIChatStore = create<AIChatState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  openChat: () => {
    if (isProduction) {
      alert('인천대학교 학사 AI 챗봇 "챗불이"가 곧 오픈 예정이에요!');
      return;
    }
    set({ isOpen: true });
  },
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => {
    if (isProduction) {
      alert('인천대학교 학사 AI 챗봇 "챗불이"가 곧 오픈 예정이에요!');
      return;
    }
    set((state) => ({ isOpen: !state.isOpen }));
  },
}));

export default useAIChatStore;
