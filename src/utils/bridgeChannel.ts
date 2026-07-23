import { createWebChannel, type WebChannel } from "@inu-appcenter/intip-bridge/web";

/**
 * 신 Expo 셸(intip-mobile-app)과의 단일 PlatformChannel.
 *
 * `ReactNativeWebView` 가 있을 때만 생성된다(신 앱). 브라우저 또는 구 네이티브
 * 앱에서는 `null` 이며, 그 경우 기존 `appBridgeAdapter` 의 레거시 fallback
 * (AndroidBridge / webkit.messageHandlers) 이 사용된다.
 *
 * 메시지 스키마/봉투는 `@inu-appcenter/intip-bridge` 가 단일 소스로 강제한다.
 */
export const bridgeChannel: WebChannel | null = createWebChannel({
  // 다른 출처의 'message' 이벤트(iframe 등)는 스키마 검증에서 걸러져 여기로 온다. 무시.
  onError: () => {},
});

// --- Native -> Web 수신 결선 ----------------------------------------------
if (bridgeChannel) {
  // FCM 토큰: 기존 index.html 파이프라인(onReceiveFcmToken → CustomEvent)에 그대로 위임.
  bridgeChannel.on("receiveFcmToken", (token) => {
    window.onReceiveFcmToken?.(token);
  });

  // 푸시 탭 딥링크: 기존 window.__intipNavigate 과 동일한 SPA 이동.
  bridgeChannel.on("navigate", (path) => {
    if (!path || window.location.pathname === path) return;
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
}
