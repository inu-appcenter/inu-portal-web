import {
  hasReactNativeWebView,
  isAndroidOfficial,
  isIOSOfficial,
} from "./appBridgeAdapter";

export type MobilePlatform =
  | "ios_webview"
  | "ios_browser"
  | "android_webview"
  | "android_browser"
  | "other";

type WindowWithOpera = Window & typeof globalThis & { opera?: string };

export type AppEnvironmentStatus = "NEW_APP" | "OLD_APP" | "BROWSER";

/**
 * 현재 접속한 환경이 신버전 공식 앱, 구버전 공식 앱, 또는 일반 브라우저(인앱 포함)인지 판별합니다.
 */
export function getAppEnvironmentStatus(): AppEnvironmentStatus {
  // 0. 신 Expo 셸: 단일 ReactNativeWebView 채널 = 항상 멀티 웹뷰 지원 신버전 앱
  if (hasReactNativeWebView()) return "NEW_APP";

  if (isAndroidOfficial()) {
    if (typeof window.AndroidBridge?.navigateTo === "function") {
      return "NEW_APP";
    } else {
      return "OLD_APP";
    }
  }

  // 2. iOS 공식 앱 판정
  // 구버전 iOS 앱도 window.webkit.messageHandlers.requestAppUpdate는 가지고 있음
  if (isIOSOfficial()) return 'NEW_APP'

  // 3. 일반 웹 브라우저 및 카카오톡/인스타 등 타사 인앱 브라우저
  return "BROWSER";
}

/**
 * 현재 접속한 환경이 iOS/Android 공식 WebView 또는 일반 브라우저인지 판별합니다.
 * (Mixpanel 로깅 등 기존 로직 호환용)
 */
export function getMobilePlatform(): MobilePlatform {
  const userAgent =
    navigator.userAgent ||
    navigator.vendor ||
    (window as WindowWithOpera).opera ||
    "";

  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const status = getAppEnvironmentStatus();

  if (isIOS) {
    // 공식 앱 환경 상태가 NEW_APP 또는 OLD_APP이면 ios_webview로 판정
    if (status === "NEW_APP" || status === "OLD_APP") {
      return "ios_webview";
    }
    return "ios_browser";
  }

  if (isAndroid) {
    if (status === "NEW_APP" || status === "OLD_APP") {
      return "android_webview";
    }
    return "android_browser";
  }

  return "other";
}
