import { getAppEnvironmentStatus } from "./getMobilePlatform";
import { bridgeChannel } from "./bridgeChannel";

/**
 * 단일 브릿지 채널.
 *
 * 신버전 공식 앱(Expo 셸)은 iOS/Android 구분 없이 `@inu-appcenter/intip-bridge`
 * 의 PlatformChannel(react-native-webview 단일 채널) 로 통신합니다. 따라서 가능한
 * 한 이 채널을 우선 사용하고, 이것이 없는 구버전 네이티브 앱에서만 기존
 * `window.AndroidBridge.*` / `window.webkit.messageHandlers.*` 프로토콜로
 * 폴백합니다. (구앱이 소멸하면 폴백 분기를 제거할 수 있습니다.)
 */

/** 신 Expo 셸의 단일 채널이 존재하는지 확인합니다. */
export function hasReactNativeWebView(): boolean {
  return typeof window.ReactNativeWebView?.postMessage === "function";
}

/**
 * 공식 Android 앱인지 확인합니다.
 */
export function isAndroidOfficial(): boolean {
  const userAgent = navigator.userAgent || "";
  return (
    userAgent.includes("INTIPApp") ||
    typeof window.AndroidBridge !== "undefined"
  );
}

/**
 * 공식 iOS 앱인지 확인합니다.
 */
export function isIOSOfficial(): boolean {
  const userAgent = navigator.userAgent || "";

  return (
    userAgent.includes("INTIPApp") &&
    typeof window.webkit?.messageHandlers?.requestAppUpdate !== "undefined"
  );
}

/**
 * 공식 앱 환경인지 확인합니다. (신 Expo 셸 또는 구 Android/iOS 앱)
 */
export function isOfficialApp(): boolean {
  return hasReactNativeWebView() || isAndroidOfficial() || isIOSOfficial();
}

/**
 * 신규 멀티 웹뷰 및 새로운 브릿지 기능 지원 여부를 확인합니다.
 */
export function supportsMultiWebView(): boolean {
  return getAppEnvironmentStatus() === "NEW_APP";
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

    // 신버전 앱: PlatformChannel 우선
    if (bridgeChannel) {
      bridgeChannel.send("navigateTo", { path, url: fullUrl });
      return;
    }

    // 구버전 Android
    if (typeof window.AndroidBridge?.navigateTo === "function") {
      window.AndroidBridge.navigateTo(path, fullUrl);
      return;
    }

    // 구버전 iOS
    if (window.webkit?.messageHandlers?.navigateTo) {
      window.webkit.messageHandlers.navigateTo.postMessage({
        path,
        url: fullUrl,
      });
      return;
    }

    console.warn("navigateTo called in browser environment.");
  },

  /**
   * 현재 웹뷰 액티비티/뷰컨트롤러를 닫고 이전 화면으로 복귀합니다.
   */
  goBack(): void {
    // 신버전 앱: PlatformChannel 우선
    if (bridgeChannel) {
      bridgeChannel.send("goBack");
      return;
    }

    // 구버전 Android
    if (typeof window.AndroidBridge?.goBack === "function") {
      window.AndroidBridge.goBack();
      return;
    }

    // 구버전 iOS
    if (window.webkit?.messageHandlers?.goBack) {
      window.webkit.messageHandlers.goBack.postMessage(null);
      return;
    }

    console.warn("goBack called in browser environment.");
  },
};
