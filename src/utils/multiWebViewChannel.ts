import { createSafeBroadcastChannel } from "@/utils/broadcastChannel";

export interface MultiWebViewChannel {
  postMessage: (data: unknown) => void;
  close: () => void;
}

/** 윈도우(JS 런타임/웹뷰) 고유 식별자 — 셀프 에코 및 브릿지 순환 차단용 */
const WINDOW_CONTEXT_ID =
  typeof window !== "undefined"
    ? `${Math.random().toString(36).substring(2, 9)}-${Date.now().toString(36)}`
    : "ssr";

export interface SyncMessageEnvelope {
  senderId: string;
  updatedAt: number;
  payload: unknown;
}

/**
 * 같은 오리진의 다른 웹뷰/탭에 상태 스냅샷을 전달하는 통합 채널.
 *
 * BroadcastChannel API 하나로 전달한다. 이전에는 iOS 15.4 미만 WKWebView(전역
 * 자체 없음) 대응으로 네이티브 브릿지 릴레이(relayBroadcastSync →
 * broadcastSyncMessage)를 이중 경로로 병행했으나, intip-mobile-app이 Expo
 * SDK 56로 최소 iOS를 16.4로 올리면서(2026-08) 그 바닥이 사라졌고, "지원
 * 버전에서도 WebKit 인스턴스 간 전달이 불안정하다"는 우려도 재현 가능한
 * 사례로 뒷받침되지 않아 네이티브 릴레이 자체를 걷어냈다.
 *
 * 상용 분산 하이브리드 어플리케이션 방법론 적용:
 *  - Self-Echo Guard: 발신 웹뷰 식별자(senderId) 검증으로 자가 릴레이 원천 차단
 *  - Stale State Drop: 단조 증가 타임스탬프(updatedAt) 비교로 네트워크/메시지 순서 역전 덮어쓰기 차단
 */
export function openMultiWebViewChannel(
  name: string,
  onMessage: (data: unknown) => void,
): MultiWebViewChannel {
  let lastUpdatedAt = 0;

  const handleIncomingMessage = (raw: unknown) => {
    if (!raw || typeof raw !== "object") return;
    const env = raw as Partial<SyncMessageEnvelope>;

    // 1. Self-Echo Guard: 자기 자신에게 반사된 메시지 무시
    if (env.senderId && env.senderId === WINDOW_CONTEXT_ID) {
      return;
    }

    // 2. Stale State Drop: 타임스탬프 순서 역전 메시지 무시
    if (typeof env.updatedAt === "number") {
      if (env.updatedAt < lastUpdatedAt) return;
      lastUpdatedAt = env.updatedAt;
    }

    const payload = "payload" in env ? env.payload : raw;
    onMessage(payload);
  };

  const broadcastChannel = createSafeBroadcastChannel(name);
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event: MessageEvent) =>
      handleIncomingMessage(event.data);
  }

  return {
    postMessage: (data) => {
      const envelope: SyncMessageEnvelope = {
        senderId: WINDOW_CONTEXT_ID,
        updatedAt: Date.now(),
        payload: data,
      };
      broadcastChannel?.postMessage(envelope);
    },
    close: () => {
      broadcastChannel?.close();
    },
  };
}
