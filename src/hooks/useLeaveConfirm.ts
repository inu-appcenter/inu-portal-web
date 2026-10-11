import { useCallback, useEffect, useRef, useState } from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import { backHandler } from "@/utils/backHandler";

/**
 * 저장하지 않은 입력이 있는 채로 화면을 벗어나려 할 때 확인을 받는다.
 *
 * 웹의 뒤로가기·링크 이동은 라우터 블로커가, 앱의 뒤로가기는 backHandler가 먼저
 * 가로챈다(앱에서는 블로커가 아예 걸리지 않는다 — 학점계산기와 같은 구조).
 * 같은 경로 안의 히스토리 변화(바텀시트·모달이 쌓는 엔트리)는 이탈로 보지 않는다.
 */
export const useLeaveConfirm = (hasChanges: boolean) => {
  const navigate = useNavigate();
  const [isNativeBackPending, setIsNativeBackPending] = useState(false);
  const bypassRef = useRef(false);
  const isPendingRef = useRef(false);

  const blocker = useBlocker(
    useCallback(
      ({
        currentLocation,
        nextLocation,
      }: {
        currentLocation: { pathname: string };
        nextLocation: { pathname: string };
      }) =>
        hasChanges &&
        !bypassRef.current &&
        currentLocation.pathname !== nextLocation.pathname,
      [hasChanges],
    ),
  );

  useEffect(() => {
    isPendingRef.current = isNativeBackPending;
  }, [isNativeBackPending]);

  useEffect(() => {
    const handlePageBack = () => {
      if (bypassRef.current) return false; // 이탈 확정 → 네이티브에 넘긴다
      // 확인 창이 이미 떠 있으면 뒤로가기는 그 창만 닫는다.
      setIsNativeBackPending(!isPendingRef.current);
      return true;
    };
    backHandler.setPageUnsavedChanges(hasChanges, handlePageBack);
    return () => backHandler.setPageUnsavedChanges(false);
  }, [hasChanges]);

  const stay = () => {
    setIsNativeBackPending(false);
    if (blocker.state === "blocked") blocker.reset();
  };

  const leave = () => {
    bypassRef.current = true;
    backHandler.setPageUnsavedChanges(false);
    setIsNativeBackPending(false);
    if (blocker.state === "blocked") {
      blocker.proceed();
      return;
    }
    navigate(-1);
  };

  /** 등록 성공처럼 의도한 이동 직전에 불러 확인 없이 지나가게 한다. */
  const allowLeave = () => {
    bypassRef.current = true;
    backHandler.setPageUnsavedChanges(false);
  };

  return {
    isOpen: blocker.state === "blocked" || isNativeBackPending,
    stay,
    leave,
    allowLeave,
  };
};
