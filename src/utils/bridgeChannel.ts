import { createWebChannel, type WebChannel } from "@inu-appcenter/intip-bridge/web";
import { resumeApp, suspendApp } from "./suspendable";

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

  // Tier 3 웜 웹뷰 풀: parked 인스턴스 suspend(false)/resume(true).
  bridgeChannel.on("setActive", (active) => {
    if (active) resumeApp();
    else suspendApp();
  });

  // Tier 3 웜 웹뷰 풀: 링크 touchstart 시점에 목표 path 를 미리 알려 네이티브가
  // warm 슬롯을 그 path 로 SPA 프리내비할 수 있게 한다. 현재 이 SPA 는
  // <a href> 대신 프로그래매틱 navigate(router.tsx 의 patched router.navigate)를
  // 쓰기 때문에 실제 커버리지는 낮지만, 스펙대로 앵커 기반으로 구현해 두면
  // 앵커가 늘어날 때 그대로 확장된다.
  document.addEventListener(
    "touchstart",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      const path = `${url.pathname}${url.search}${url.hash}`;
      bridgeChannel.send("prewarm", { path, url: url.href });
    },
    { passive: true },
  );
}
