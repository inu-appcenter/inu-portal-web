import { useNavigate } from "react-router-dom";
import { appBridge, supportsMultiWebView } from "../utils/appBridgeAdapter";

const MAIN_TAB_PATHS = new Set([
  "/",
  "/home",
  "/bus",
  "/chat/list",
  "/save",
  "/mypage",
  "/timetable",
  "/m",
  "/m/home",
  "/m/bus",
  "/m/chat/list",
  "/m/save",
  "/m/mypage",
  "/m/timetable"
]);

/**
 * 경로를 정규화하여 쿼리나 해시를 제거하고 비교합니다.
 */
function isMainTabPath(path: string): boolean {
  const cleanPath = path.split("?")[0].split("#")[0];
  return MAIN_TAB_PATHS.has(cleanPath);
}

/**
 * 일반 웹 환경에서는 SPA 라우팅을 수행하고,
 * 공식 앱 환경(신버전)에서는 멀티 웹뷰 액티비티를 생성해 쌓는 커스텀 네비게이션 훅입니다.
 */
export function useCustomNavigate() {
  const reactNavigate = useNavigate();

  const navigateCustom = (
    path: string | number,
    options?: { replace?: boolean; state?: any }
  ) => {
    // 1. 숫자가 전달된 경우 (예: -1) 뒤로가기 동작으로 간주
    if (typeof path === "number") {
      if (path === -1 && supportsMultiWebView()) {
        appBridge.goBack();
      } else {
        reactNavigate(path);
      }
      return;
    }

    // 2. 신규 멀티 웹뷰를 지원하는 앱 환경이고, 메인 탭이 아니며, 단순 교체(replace)가 아닌 경우
    if (supportsMultiWebView() && !isMainTabPath(path) && !options?.replace) {
      appBridge.navigateTo(path);
    } else {
      // 3. 브라우저 환경이거나 기존 앱, 또는 메인 탭 전환인 경우 SPA 라우팅 적용
      reactNavigate(path, options);
    }
  };

  return navigateCustom;
}
