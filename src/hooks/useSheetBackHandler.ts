import { useEffect, useRef } from "react";
import { backHandler } from "@/utils/backHandler";

let nextOverlayId = 0;
const openOverlayIds: number[] = [];
let isPopStateConsumed = false;
let isCleaningHistory = false;

export function useSheetBackHandler(
  open: boolean,
  onClose: () => void,
  enabled = true,
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open || !enabled) return;

    const overlayId = ++nextOverlayId;
    let hasHistoryEntry = false;
    openOverlayIds.push(overlayId);

    // Strict Mode의 effect setup → cleanup → setup 사이에서 첫 cleanup의
    // history.back()이 두 번째 setup의 엔트리를 pop하는 레이스를 피한다.
    const pushStateTimer = window.setTimeout(() => {
      window.history.pushState(
        { ...window.history.state, intipOverlayId: overlayId },
        "",
      );
      hasHistoryEntry = true;
      window.addEventListener("popstate", handlePopState);
    }, 0);

    const handleBack = () => {
      onCloseRef.current();
      return true;
    };
    const handlePopState = () => {
      if (isCleaningHistory || isPopStateConsumed) return;
      if (openOverlayIds[openOverlayIds.length - 1] !== overlayId) return;

      isPopStateConsumed = true;
      queueMicrotask(() => {
        isPopStateConsumed = false;
      });

      hasHistoryEntry = false;
      openOverlayIds.pop();
      onCloseRef.current();
    };

    backHandler.pushHandler(handleBack);

    return () => {
      window.clearTimeout(pushStateTimer);
      backHandler.popHandler(handleBack);
      window.removeEventListener("popstate", handlePopState);

      const overlayIndex = openOverlayIds.lastIndexOf(overlayId);
      if (overlayIndex !== -1) openOverlayIds.splice(overlayIndex, 1);

      if (
        hasHistoryEntry &&
        window.history.state?.intipOverlayId === overlayId
      ) {
        isCleaningHistory = true;
        const finishCleanup = () => {
          queueMicrotask(() => {
            isCleaningHistory = false;
          });
        };
        window.addEventListener("popstate", finishCleanup, { once: true });
        window.history.back();
        window.setTimeout(() => {
          isCleaningHistory = false;
          window.removeEventListener("popstate", finishCleanup);
        }, 500);
      }
    };
  }, [enabled, open]);
}
