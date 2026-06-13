import { getAppEnvironmentStatus } from "./getMobilePlatform";

/**
 * 공식 Android 앱인지 확인합니다.
 */
export function isAndroidOfficial(): boolean {
  const userAgent = navigator.userAgent || "";
  return userAgent.includes("INTIPApp") || typeof window.AndroidBridge !== "undefined";
}

/**
 * 공식 iOS 앱인지 확인합니다.
 */
export function isIOSOfficial(): boolean {
  return typeof window.webkit?.messageHandlers?.requestAppUpdate !== "undefined";
}

/**
 * 공식 앱 환경인지 확인합니다. (Android 또는 iOS)
 */
export function isOfficialApp(): boolean {
  return isAndroidOfficial() || isIOSOfficial();
}

/**
 * 신규 멀티 웹뷰 및 새로운 브릿지 기능 지원 여부를 확인합니다.
 */
export function supportsMultiWebView(): boolean {
  const status = getAppEnvironmentStatus();
  return status === "NEW_APP";
}

/**
 * 앱 또는 브라우저 환경에 맞는 웹뷰 스택 이동 처리를 정의하는 어댑터 객체입니다.
 */
export const appBridge = {
  /**
   * 새로운 웹뷰 액티비티/뷰컨트롤러를 위에 쌓습니다.
   * @param path 라우팅 경로 (예: "/board/tips/12")
   */
  navigateTo(path: string): void {
    const fullUrl = `${window.location.origin}${path}`;
    
    if (isAndroidOfficial()) {
      if (typeof window.AndroidBridge?.navigateTo === "function") {
        window.AndroidBridge.navigateTo(path, fullUrl);
      } else {
        console.warn("AndroidBridge.navigateTo is not defined in this app version.");
      }
    } else if (isIOSOfficial()) {
      // iOS WebKit message handler 호출
      if (window.webkit?.messageHandlers?.navigateTo) {
        window.webkit.messageHandlers.navigateTo.postMessage({ path, url: fullUrl });
      } else {
        console.warn("iOS navigateTo handler is not defined in this app version.");
      }
    } else {
      console.warn("navigateTo called in browser environment.");
    }
  },

  /**
   * 현재 웹뷰 액티비티/뷰컨트롤러를 닫고 이전 화면으로 복귀합니다.
   */
  goBack(): void {
    if (isAndroidOfficial()) {
      if (typeof window.AndroidBridge?.goBack === "function") {
        window.AndroidBridge.goBack();
      } else {
        console.warn("AndroidBridge.goBack is not defined in this app version.");
      }
    } else if (isIOSOfficial()) {
      if (window.webkit?.messageHandlers?.goBack) {
        window.webkit.messageHandlers.goBack.postMessage(null);
      } else {
        console.warn("iOS goBack handler is not defined in this app version.");
      }
    } else {
      console.warn("goBack called in browser environment.");
    }
  }
};


