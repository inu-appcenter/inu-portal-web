export type MobilePlatform =
  | "ios_webview"
  | "ios_browser"
  | "android_webview"
  | "android_browser"
  | "other";

type WindowWithOpera = Window & typeof globalThis & { opera?: string };

/**
 * 현재 접속한 환경이 iOS/Android WebView 또는 일반 브라우저인지 판별합니다.
 */
export function getMobilePlatform(): MobilePlatform {
  const userAgent =
    navigator.userAgent ||
    navigator.vendor ||
    (window as WindowWithOpera).opera ||
    "";

  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isSafari = /Safari/i.test(userAgent);
  const isWKWebView =
    /(Version\/[\d.]+).*Mobile.*Safari/.test(userAgent) === false;

  if (isIOS) {
    if (!isSafari || isWKWebView) {
      return "ios_webview";
    }

    return "ios_browser";
  }

  const isAndroid = /Android/i.test(userAgent);
  const isWebView = /wv/i.test(userAgent) || /Version\/[\d.]+/i.test(userAgent);

  if (isAndroid) {
    if (isWebView) {
      return "android_webview";
    }

    return "android_browser";
  }

  return "other";
}
