import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 뒤로가기(하드웨어/브라우저 back)로 닫혀야 하는 오버레이(드롭다운 메뉴, 바텀시트 등)의
 * 열림 상태를 관리한다.
 *
 * - open() 시 history entry를 하나 쌓아서, back 버튼으로 오버레이만 먼저 닫히게 한다.
 * - close(after)는 history.back()으로 그 entry를 되돌린 뒤에만 after를 실행한다.
 *   back()은 비동기이므로, close 직후 곧바로 다른 오버레이(BottomSheet 등)를 열어
 *   pushState하면 그 back()이 새 entry를 대신 pop해버려 오버레이가 열리자마자 닫히는
 *   레이스가 생긴다. popstate가 실제로 끝난 뒤에만 after를 실행해 방지한다.
 */
export function useHistoryBackedOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const hasHistoryEntryRef = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      if (!hasHistoryEntryRef.current) return;
      hasHistoryEntryRef.current = false;
      setIsOpen(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    window.history.pushState(
      { ...(window.history.state ?? {}), __intipOverlayOpen: true },
      "",
    );
    hasHistoryEntryRef.current = true;
  }, []);

  const close = useCallback((after?: () => void) => {
    setIsOpen(false);
    if (hasHistoryEntryRef.current) {
      hasHistoryEntryRef.current = false;
      const handlePopped = () => {
        window.removeEventListener("popstate", handlePopped);
        after?.();
      };
      window.addEventListener("popstate", handlePopped);
      window.history.back();
    } else {
      after?.();
    }
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return { isOpen, open, close, toggle };
}
