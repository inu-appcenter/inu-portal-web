import { useEffect } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { useToastStore, type ToastItem } from "@/stores/useToastStore";

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

function ToastElement({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const duration = toast.duration ?? 3000;
    if (duration <= 0) return;

    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <ToastCard
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      role="status"
      aria-live="polite"
    >
      <ToastMessage>{toast.message}</ToastMessage>
      {toast.action && (
        <ToastActionButton
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onDismiss(toast.id);
          }}
        >
          {toast.action.text}
        </ToastActionButton>
      )}
    </ToastCard>
  );
}

export default function ToastContainer() {
  const { toasts, hideToast } = useToastStore();

  if (typeof document === "undefined") return null;

  return createPortal(
    <ToastViewport>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastElement key={toast.id} toast={toast} onDismiss={hideToast} />
        ))}
      </AnimatePresence>
    </ToastViewport>,
    document.body,
  );
}

const ToastViewport = styled.div`
  position: fixed;
  bottom: calc(28px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: calc(100% - 32px);
  max-width: 480px;
  pointer-events: none;
  box-sizing: border-box;
`;

const ToastCard = styled(motion.div)`
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: fit-content;
  max-width: 100%;
  padding: 12px 20px;
  background: rgba(33, 37, 41, 0.92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #ffffff;
  border-radius: 9999px;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  word-break: break-word;

  /* 다중 라인일 경우 둥근 직사각형으로 자연스럽게 표시 */
  &:has(.multi-line) {
    border-radius: 16px;
    align-items: flex-start;
  }
`;

const ToastMessage = styled.div`
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #ffffff;
  white-space: pre-line;
  text-align: center;
  flex: 1;
`;

const ToastActionButton = styled.button`
  background: none;
  border: none;
  padding: 0 0 0 4px;
  margin: 0;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  color: #60a5fa;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;

  &:active {
    opacity: 0.7;
  }
`;
