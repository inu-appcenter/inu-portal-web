import * as Turbo from "@hotwired/turbo";
import { useNavigate, useLocation } from "react-router-dom";
import { useCallback, useEffect } from "react";

export const useAppNavigation = () => {
  const navigate = useNavigate();

  // Turbo Native 앱 환경인지 확인
  const isTurboApp =
    window.navigator.userAgent.includes("Turbo") ||
    window.navigator.userAgent.includes("INTIPApp") ||
    !!(window as any).TurboNative;

  const appNavigate = useCallback((path: string, options?: { replace?: boolean }) => {
    if (isTurboApp) {
      // 앱 환경일 경우 SPA 내부 이동 대신 Turbo.visit을 호출하여 네이티브 Push 유도
      Turbo.visit(path, { action: options?.replace ? "replace" : "advance" });
    } else {
      // 웹 환경일 경우 React Router 사용
      navigate(path, options);
    }
  }, [isTurboApp, navigate]);

  return { appNavigate, isTurboApp };
};

/**
 * 전역 내비게이션 싱크 핸들러
 * React Router와 Turbo Native 간의 내비게이션 주도권을 조정함
 */
export const TurboNavigationHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isTurboApp } = useAppNavigation();

  useEffect(() => {
    if (!isTurboApp) return;

    // 1. 모든 클릭 가로채기 (React Router의 Link 포함)
    const handleLinkClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest("a");
      if (target && target.href && target.origin === window.location.origin) {
        const path = target.pathname + target.search + target.hash;
        
        // 터보가 처리하도록 함 (네이티브에서 새 프래그먼트 생성)
        event.preventDefault();
        event.stopPropagation();
        Turbo.visit(path);
      }
    };

    // 2. 터보가 새로운 프래그먼트를 띄우고 로드했을 때 React Router 상태 동기화
    const handleTurboLoad = () => {
      const currentPath = window.location.pathname + window.location.search;
      // 현재 리액트 라우터의 경로와 실제 브라우저 주소가 다르면 동기화
      if (location.pathname + location.search !== currentPath) {
        navigate(currentPath, { replace: true });
      }
    };

    document.addEventListener("click", handleLinkClick, true);
    document.addEventListener("turbo:load", handleTurboLoad);

    return () => {
      document.removeEventListener("click", handleLinkClick, true);
      document.removeEventListener("turbo:load", handleTurboLoad);
    };
  }, [isTurboApp, location, navigate]);

  return null;
};
