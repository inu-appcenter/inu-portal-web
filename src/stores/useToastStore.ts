import { create } from "zustand";
import type { ReactNode } from "react";

export interface ToastAction {
  text: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  message: string | ReactNode;
  duration?: number;
  action?: ToastAction;
  bottomOffset?: number | string;
}

interface ToastStore {
  toasts: ToastItem[];
  showToast: (
    message: string | ReactNode,
    options?: {
      duration?: number;
      action?: ToastAction;
      bottomOffset?: number | string;
    },
  ) => string;
  hideToast: (id: string) => void;
  clearToasts: () => void;
}

let toastIdCounter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (message, options) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: ToastItem = {
      id,
      message,
      duration: options?.duration ?? 3000,
      action: options?.action,
      bottomOffset: options?.bottomOffset,
    };

    set((state) => ({
      // 최신 토스트 1개를 주로 노출 (안드로이드 스타일)
      toasts: [...state.toasts.slice(-2), newToast],
    }));

    return id;
  },
  hideToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));

export const showToast = (
  message: string | ReactNode,
  options?: {
    duration?: number;
    action?: ToastAction;
    bottomOffset?: number | string;
  },
) => useToastStore.getState().showToast(message, options);
