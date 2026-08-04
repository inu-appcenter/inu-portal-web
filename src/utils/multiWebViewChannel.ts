import { bridgeChannel } from "@/utils/bridgeChannel";
import { createSafeBroadcastChannel } from "@/utils/broadcastChannel";

export interface MultiWebViewChannel {
  postMessage: (data: unknown) => void;
  close: () => void;
}

/**
 * 같은 오리진의 다른 웹뷰/탭에 상태 스냅샷을 전달하는 통합 채널.
 *
 * 두 경로를 동시에 쓴다:
 *  1) BroadcastChannel API — 지원 환경에서 지연 없이 도달한다.
 *  2) 네이티브 브릿지 릴레이(relayBroadcastSync → broadcastSyncMessage,
 *     packages/intip-bridge) — BroadcastChannel 전역 자체가 없는 iOS 15.4
 *     미만 WKWebView, 그리고 지원 버전에서도 WebKit의 웹뷰 인스턴스 간 전달이
 *     알려진 대로 불안정한 경우를 위한 폴백. RN 셸 밖(일반 브라우저)에서는
 *     `bridgeChannel`이 null이라 이 경로는 자동으로 빠진다.
 *
 * 페이로드는 매번 전체 스냅샷이라 두 경로로 중복 도착해도 멱등하게 반영되므로
 * (수신측이 최신 값으로 그대로 덮어씀) 별도 dedup 없이 안전하다. 두 경로 모두
 * 발신 채널 자기 자신에게는 되돌아오지 않는다(BroadcastChannel 스펙, 네이티브
 * 릴레이는 발신 웹뷰를 제외하고 중계).
 */
export function openMultiWebViewChannel(
  name: string,
  onMessage: (data: unknown) => void,
): MultiWebViewChannel {
  const broadcastChannel = createSafeBroadcastChannel(name);
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event: MessageEvent) => onMessage(event.data);
  }

  const offBridge = bridgeChannel?.on("broadcastSyncMessage", (message) => {
    if (message.channel === name) onMessage(message.payload);
  });

  return {
    postMessage: (data) => {
      broadcastChannel?.postMessage(data);
      bridgeChannel?.send("relayBroadcastSync", { channel: name, payload: data });
    },
    close: () => {
      broadcastChannel?.close();
      offBridge?.();
    },
  };
}
