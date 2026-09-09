import { create } from "zustand";

interface AIChatState {
  isOpen: boolean;
  isAgentOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  openAgent: () => void;
  closeAgent: () => void;
  toggleAgent: () => void;
}

const useAIChatStore = create<AIChatState>((set) => ({
  isOpen: false,
  isAgentOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  openChat: () => set({ isOpen: true, isAgentOpen: false }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen, isAgentOpen: false })),
  openAgent: () => set({ isAgentOpen: true, isOpen: false }),
  closeAgent: () => set({ isAgentOpen: false }),
  toggleAgent: () => set((state) => ({ isAgentOpen: !state.isAgentOpen, isOpen: false })),
}));

export default useAIChatStore;
