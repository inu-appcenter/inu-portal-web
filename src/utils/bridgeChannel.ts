// 공유 브릿지는 packages/intip-bridge git 서브모듈로 두고 소스를 직접 컴파일한다
// (npm 패키지/레지스트리 없음). CLAUDE.md 참고.
import { createWebChannel, type WebChannel } from "../../packages/intip-bridge/src/adapters/web";
import { handleBackRequest } from "./nativeBackRequest";
import { whenCapabilities } from "./bridgeCapabilities";
import { installNavigatorSharePolyfill } from "./nativeShare";
import { flushAllBroadcastSync } from "@/stores/middleware/broadcastSync";
// readNotificationByFcmMessageId는 동적 import로 지연 로드한다(정적 import 금지).
// apis/members.ts → apis/tokenInstance.ts·refreshInstance.ts → useUserStore.ts →
// (여기) bridgeChannel.ts 로 이어지는 순환참조가 생겨, 모듈 평가 순서에 따라
// useUserStore.ts가 bridgeChannel 상수를 TDZ 상태로 참조해 "Cannot access
// 'bridgeChannel' before initialization"이 재발한다(bridgeChannel.ts/useUserStore.ts
// 하단 주석이 막으려던 것과 같은 부류의 순환이지만 다른 경로).

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

  // 뒤로가기 위임(안드로이드 시스템 백, iOS 스와이프 백 제스처 등). 네이티브는
  // 스스로 판단하지 않고 이 웹뷰에 먼저 물어본다 — 열린 모달/오버레이나 되돌릴
  // SPA 히스토리는 웹만 알기 때문. 응답이 늦으면 네이티브가 자체 타임아웃으로
  // 폴백하므로 여기서는 반드시 동기적으로 답한다.
  //
  // handled:false로 답하는 순간 네이티브가 곧바로 이 웹뷰를 pop한다 - 이 흐름은
  // appBridge.goBack/goHome/navigateTo(웹이 먼저 요청하는 아웃바운드 경로)를
  // 전혀 거치지 않으므로 그쪽에 건 flushAllBroadcastSync만으로는 못 잡는다.
  // 여기서 실제로 웹뷰를 떠나는 게 확정되는 시점에 별도로 flush해야 한다.
  bridgeChannel.on("checkBack", (_value, msg) => {
    const handled = handleBackRequest();
    if (!handled) flushAllBroadcastSync();
    bridgeChannel?.reply(msg, "backResult", { handled });
  });

  // 푸시 탭 진입: fcmMessageId를 서버에 읽음 처리로 보낸 뒤, 안읽음 뱃지를
  // 갱신하도록 알린다.
  bridgeChannel.on("notificationOpened", ({ fcmMessageId }) => {
    if (fcmMessageId === undefined) return;
    void import("@/apis/members")
      .then(({ readNotificationByFcmMessageId }) => readNotificationByFcmMessageId(fcmMessageId))
      .then(() => window.dispatchEvent(new Event("intip:notification-opened")))
      .catch((error) => console.error("Failed to mark opened notification as read", error));
  });

  // bridgeCapabilities 리스너 등록 + navigator.share polyfill 설치 착수. 반드시
  // 아래 bridgeReady 전송보다 먼저 와야 한다 — 네이티브는 bridgeReady 수신 직후
  // (우리 요청 없이) bridgeCapabilities 를 바로 회신하므로, 리스너가 늦게
  // 붙으면 그 메시지를 통째로 놓친다. whenCapabilities() 가 리스너 등록을
  // 맡고, installNavigatorSharePolyfill() 은 그 결과를 기다렸다가(비동기)
  // "share" 기능이 광고된 경우에만 polyfill 을 심는다.
  void whenCapabilities();
  installNavigatorSharePolyfill();

  // This must stay after every NativeToWeb handler registration. The native
  // shell holds one-shot notificationOpened events until it receives this ACK.
  bridgeChannel.send("bridgeReady");

  // "tokenInfoUpdated"(네이티브가 자체 리프레시한 JWT 반영)는 여기서 결선하지 않는다.
  // useUserStore.ts가 담당한다 - 여기서 useUserStore를 import하면
  // bridgeChannel.ts → useUserStore.ts → broadcastSync.ts → multiWebViewChannel.ts
  // → bridgeChannel.ts 순환참조가 생겨 TDZ 에러("Cannot access 'bridgeChannel'
  // before initialization")가 재발한다. useUserStore.ts 하단 주석 참고.
  // 네이티브가 자체 리프레시(백그라운드 FCM 토큰 등록 등)한 JWT를 store/localStorage에 반영.
}
