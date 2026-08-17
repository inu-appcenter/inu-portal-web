// 공유 브릿지는 packages/intip-bridge git 서브모듈로 두고 소스를 직접 컴파일한다
// (npm 패키지/레지스트리 없음). CLAUDE.md 참고.
import { createWebChannel, type WebChannel } from "../../packages/intip-bridge/src/adapters/web";
import { handleBackRequest } from "./nativeBackRequest";

/**
 * 신 Expo 셸(intip-mobile-app)과의 단일 PlatformChannel.
 *
 * `ReactNativeWebView` 가 있을 때만 생성된다(신 앱). 브라우저 또는 구 네이티브
 * 앱에서는 `null` 이며, 그 경우 기존 `appBridgeAdapter` 의 레거시 fallback
 * (AndroidBridge / webkit.messageHandlers) 이 사용된다.
 *
 * 메시지 스키마/봉투는 `packages/intip-bridge` 가 단일 소스로 강제한다.
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

  // 뒤로가기 위임(안드로이드 시스템 백). 네이티브는 스스로 판단하지 않고 이
  // 웹뷰에 먼저 물어본다 — 열린 모달/오버레이나 되돌릴 SPA 히스토리는 웹만
  // 알기 때문. 응답이 늦으면 네이티브가 자체 타임아웃으로 폴백하므로 여기서는
  // 반드시 동기적으로 답한다.
  bridgeChannel.on("checkBack", (_value, msg) => {
    bridgeChannel?.reply(msg, "backResult", { handled: handleBackRequest() });
  });

  // "tokenInfoUpdated"(네이티브가 자체 리프레시한 JWT 반영)는 여기서 결선하지 않는다.
  // useUserStore.ts가 담당한다 - 여기서 useUserStore를 import하면
  // bridgeChannel.ts → useUserStore.ts → broadcastSync.ts → multiWebViewChannel.ts
  // → bridgeChannel.ts 순환참조가 생겨 TDZ 에러("Cannot access 'bridgeChannel'
  // before initialization")가 재발한다. useUserStore.ts 하단 주석 참고.
  // 네이티브가 자체 리프레시(백그라운드 FCM 토큰 등록 등)한 JWT를 store/localStorage에 반영.
}
