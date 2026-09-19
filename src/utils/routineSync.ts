import { useEffect, useRef } from "react";
import { openMultiWebViewChannel, type MultiWebViewChannel } from "@/utils/multiWebViewChannel";

const ROUTINE_SYNC_CHANNEL_NAME = "intip:routine-sync";
const ROUTINE_STORAGE_KEY = "intip:routine-updated-at";

let activeSyncChannel: MultiWebViewChannel | null = null;

function getSyncChannel(): MultiWebViewChannel {
  if (!activeSyncChannel) {
    activeSyncChannel = openMultiWebViewChannel(ROUTINE_SYNC_CHANNEL_NAME, () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("intip:routine-updated"));
      }
    });
  }
  return activeSyncChannel;
}

/**
 * 루틴이 생성/수정/삭제/토글되었을 때 다중 웹뷰 및 로컬에 동기화 신호를 전송합니다.
 */
export function notifyRoutineUpdated() {
  const timestamp = Date.now();

  try {
    const channel = getSyncChannel();
    channel.postMessage({ type: "ROUTINE_UPDATED", timestamp });
  } catch (e) {
    console.warn("[routineSync] BroadcastChannel postMessage error:", e);
  }

  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(ROUTINE_STORAGE_KEY, String(timestamp));
    }
  } catch (ignored) {}

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("intip:routine-updated"));
  }
}

/**
 * 다중 웹뷰 환경에서 루틴 상태 변경(수정/삭제/토글)을 감지하여 데이터를 리프레시하는 훅
 */
export function useRoutineSync(onSync: () => void | Promise<void>) {
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  useEffect(() => {
    let isMounted = true;

    const handleSync = () => {
      if (!isMounted) return;
      onSyncRef.current();
    };

    // 1. BroadcastChannel을 통한 수신
    const channel = openMultiWebViewChannel(ROUTINE_SYNC_CHANNEL_NAME, (data) => {
      if (data && typeof data === "object" && (data as any).type === "ROUTINE_UPDATED") {
        handleSync();
      }
    });

    // 2. 윈도우 커스텀 이벤트 수신
    window.addEventListener("intip:routine-updated", handleSync);

    // 3. 다중 웹뷰 복귀 이벤트 (focus, pageshow, visibilitychange)
    const handleFocus = () => {
      handleSync();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleSync();
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === ROUTINE_STORAGE_KEY) {
        handleSync();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      isMounted = false;
      channel.close();
      window.removeEventListener("intip:routine-updated", handleSync);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);
}
