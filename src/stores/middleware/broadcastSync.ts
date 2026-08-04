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
 * BroadcastChannel + 네이티브 브릿지 릴레이 이중 경로(openMultiWebViewChannel
 * 참고)를 쓰지만, 둘 다 발신 채널 자기 자신에게는 돌아오지 않으므로, 이 스토어의
 * 액션이 쓰는 set(브로드캐스트 발신용)과 원격 메시지를 반영하는
 * api.setState(브로드캐스트 미발신)를 분리하는 것만으로 재전송 루프가 생기지
 * 않는다.
 */
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

      const broadcastingSet: typeof set = (...args) => {
        set(...args);

        // Microtask Event Loop Coalescing (Debounce/Batching)
        // 단일 이벤트 루프 틱 안에서 연속 호출된 set()을 하나로 병합하여 1회만 전송
        if (!pendingBroadcastTimer) {
          pendingBroadcastTimer = Promise.resolve().then(() => {
            pendingBroadcastTimer = null;
            const nextPartial = options.partialize(get());
            const serialized = JSON.stringify(nextPartial);

            if (serialized !== lastBroadcastSerialized) {
              lastBroadcastSerialized = serialized;
              channel.postMessage(nextPartial);
            }
          });
        }
      };

      return creator(broadcastingSet, get, api);
    };
}
