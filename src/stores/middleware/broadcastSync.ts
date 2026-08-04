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
      const channel = openMultiWebViewChannel(options.name, (data) => {
        const partial = data as Partial<T>;
        api.setState(partial);
        options.onReceive?.(partial, get());
      });

      const broadcastingSet: typeof set = (...args) => {
        set(...args);
        channel.postMessage(options.partialize(get()));
      };

      return creator(broadcastingSet, get, api);
    };
}
