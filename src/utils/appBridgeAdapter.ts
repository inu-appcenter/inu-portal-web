import { getAppEnvironmentStatus } from "./getMobilePlatform";
import { bridgeChannel } from "./bridgeChannel";
import { handleBackRequest } from "./nativeBackRequest";

/**
 * 단일 브릿지 채널.
 *
 * 신버전 공식 앱(Expo 셸)은 iOS/Android 구분 없이 `packages/intip-bridge`
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
  navigateTo(pathOrUrl: string): void {
    const isAbsoluteUrl = /^https?:\/\//i.test(pathOrUrl);
    const fullUrl = isAbsoluteUrl ? pathOrUrl : `${window.location.origin}${pathOrUrl}`;
    const path = isAbsoluteUrl ? new URL(pathOrUrl).pathname + new URL(pathOrUrl).search + new URL(pathOrUrl).hash : pathOrUrl;

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
   * 웹 안의 뒤로가기(헤더 백버튼, `navigate(-1)`) 요청입니다.
   *
   * 이 웹뷰 안에 되돌릴 것(오버레이/모달, SPA 히스토리)이 있으면 웹에서 처리하고,
   * 없을 때만 네이티브에 웹뷰 pop 을 요청합니다. 예전에는 조건 없이 pop 을
   * 요청해서, 모달을 열어둔 채 백버튼을 누르면 화면 자체가 닫혔습니다
   * (intip-mobile-app#15). 안드로이드 시스템 백도 네이티브의 `checkBack` 을 거쳐
   * 같은 판단(`handleBackRequest`)을 탑니다.
   */
  requestBack(): void {
    if (handleBackRequest()) return;
    this.goBack();
  },

  /**
   * 현재 웹뷰 액티비티/뷰컨트롤러를 닫고 이전 화면으로 복귀합니다.
   * 웹 안의 상태와 무관하게 화면을 닫으므로, 사용자의 뒤로가기에는
   * `requestBack()` 을 쓰세요.
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

  /**
   * 홈 탭 경로로 이동합니다. 서브페이지(pushed 웹뷰) 안에서 호출되면 그
   * 서브페이지 자신의 웹뷰 안에서 렌더링되는 대신, 네이티브 스택 전체를
   * root 로 collapse 하고 root 를 이 path 로 SPA 이동시킵니다.
   *
   * 구버전 앱은 이 메시지를 모른다 — 폴백 없이 그냥 무시(호출부가
   * appBridge.goHome 을 못 쓰면 기존처럼 일반 SPA navigate 로 대체해야 함).
   */
  goHome(path: string): void {
    if (bridgeChannel) {
      bridgeChannel.send("goHome", { path });
      return;
    }

    this.goBack();
  },
};
