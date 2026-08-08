import type { StateCreator, StoreApi } from "zustand";
import { openMultiWebViewChannel } from "@/utils/multiWebViewChannel";

interface BroadcastSyncOptions<T> {
  /** 채널 이름. 스토어별로 고유해야 한다. */
  name: string;
  /** 다른 웹뷰로 전송할 직렬화 가능한 필드만 선택한다(액션 함수는 제외해야 함). */
  partialize: (state: T) => Partial<T>;
  /** 원격 업데이트를 반영한 직후 실행할 부수 효과(예: localStorage 갱신). */
  onReceive?: (partial: Partial<T>, state: T) => void;
}

/**
 * 같은 오리진의 다른 브라우징 컨텍스트(RN 멀티 웹뷰 환경의 다른 화면, 또는
 * 브라우저의 다른 탭)와 zustand 스토어 상태를 동기화하는 미들웨어. 전송은
 * BroadcastChannel(openMultiWebViewChannel 참고)을 쓰는데, 발신 채널 자기
 * 자신에게는 돌아오지 않으므로, 이 스토어의 액션이 쓰는 set(브로드캐스트
 * 발신용)과 원격 메시지를 반영하는 api.setState(브로드캐스트 미발신)를
 * 분리하는 것만으로 재전송 루프가 생기지 않는다.
 */
/**
 * 채널 이름 → 대기 중인 브로드캐스트를 즉시 내보내는 함수.
 *
 * 아래 broadcastingSet은 한 틱의 set()들을 마이크로태스크로 병합해 1회만 보낸다.
 * 그런데 "상태를 바꾸고 곧바로 이 웹뷰를 떠나는" 흐름(필터 저장 후 goBack)에서는
 * 그 지연이 치명적이다 — 떠나는 요청이 동기적으로 먼저 네이티브에 도착해 웹뷰가
 * pop되고, 뒤늦게 나가는 브로드캐스트는 유실된다. 그런 호출부는 이 함수로 병합을
 * 건너뛰고 즉시 내보낸 뒤 이동해야 한다(브릿지 메시지는 FIFO라 순서가 보장된다).
 */
const pendingFlushers = new Map<string, () => void>();

export function flushBroadcastSync(name: string): void {
  pendingFlushers.get(name)?.();
}

export function broadcastSync<T extends object>(options: BroadcastSyncOptions<T>) {
  return (creator: StateCreator<T, [], []>): StateCreator<T, [], []> =>
    (set, get, api: StoreApi<T>) => {
      const channel = openMultiWebViewChannel(options.name, (incomingData) => {
        const partial = incomingData as Partial<T>;
        const currentPartial = options.partialize(get());

        // Inbound Reconciliation Guard: 수신한 상태가 현재 상태와 이미 일치하면
        // api.setState 및 하위 컴포넌트 불필요한 리렌더링 스킵
        if (JSON.stringify(currentPartial) === JSON.stringify(partial)) {
          return;
        }

        api.setState(partial);
        options.onReceive?.(partial, get());
      });

      let pendingBroadcastTimer: Promise<void> | null = null;
      let lastBroadcastSerialized: string | null = null;

      const sendNow = () => {
        const nextPartial = options.partialize(get());
        const serialized = JSON.stringify(nextPartial);

        if (serialized !== lastBroadcastSerialized) {
          lastBroadcastSerialized = serialized;
          channel.postMessage(nextPartial);
        }
      };

      // 이 웹뷰를 떠나기 직전의 호출부가 병합을 건너뛰고 즉시 내보낼 수 있게 한다.
      pendingFlushers.set(options.name, () => {
        pendingBroadcastTimer = null; // 예약된 마이크로태스크는 중복 전송하지 않도록 무력화
        sendNow();
      });

      const broadcastingSet: typeof set = (...args) => {
        set(...args);

        // Microtask Event Loop Coalescing (Debounce/Batching)
        // 단일 이벤트 루프 틱 안에서 연속 호출된 set()을 하나로 병합하여 1회만 전송
        if (!pendingBroadcastTimer) {
          pendingBroadcastTimer = Promise.resolve().then(() => {
            if (!pendingBroadcastTimer) return; // flush가 이미 내보냈다
            pendingBroadcastTimer = null;
            sendNow();
          });
        }
      };

      return creator(broadcastingSet, get, api);
    };
}
