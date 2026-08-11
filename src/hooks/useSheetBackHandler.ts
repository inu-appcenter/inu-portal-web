import { useEffect, useRef } from "react";
import { backHandler } from "@/utils/backHandler";

export function useSheetBackHandler(
  open: boolean,
  onClose: () => void,
  enabled = true,
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open || !enabled) return;

    let hasHistoryEntry = true;
    window.history.pushState({ sheetOpen: true }, "");

    const handleBack = () => {
      onCloseRef.current();
      return true;
    };
    const handlePopState = () => {
      hasHistoryEntry = false;
      onCloseRef.current();
    };

    backHandler.pushHandler(handleBack);
    window.addEventListener("popstate", handlePopState);

    return () => {
      backHandler.popHandler(handleBack);
      window.removeEventListener("popstate", handlePopState);
      if (hasHistoryEntry) window.history.back();
    };
  }, [enabled, open]);
}
