import { useCallback, useMemo, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { publishMessage } from "@/utils/stomp";

/** 큐에 담아둔 메시지의 유효 시간. 이보다 오래되면 재전송하지 않고 버린다. */
const OUTBOX_TTL_MS = 5 * 60 * 1000;

export type OutboxItem = {
  content: string;
  isAnonymous: boolean;
  messageType?: string;
  extraData?: string;
};

type QueuedItem = OutboxItem & { queuedAt: number };

/**
 * 소켓이 끊긴 순간의 전송을 버리지 않고 모아두었다가 재연결 시 흘려보낸다.
 */
export const useMessageOutbox = (roomId: string) => {
  const queueRef = useRef<QueuedItem[]>([]);

  const enqueue = useCallback((item: OutboxItem) => {
    queueRef.current.push({ ...item, queuedAt: Date.now() });
  }, []);

  const clear = useCallback(() => {
    queueRef.current = [];
  }, []);

  /** 큐를 비우며 전송한다. 아직 보내지 못한 항목은 큐에 다시 남는다. */
  const flush = useCallback(
    (client: Client | null) => {
      if (queueRef.current.length === 0) return;

      const now = Date.now();
      const pending = queueRef.current;
      queueRef.current = [];

      for (const item of pending) {
        if (now - item.queuedAt > OUTBOX_TTL_MS) continue;

        const sent = publishMessage(
          client,
          roomId,
          item.content,
          item.isAnonymous,
          item.messageType,
          item.extraData,
        );
        if (!sent) queueRef.current.push(item);
      }
    },
    [roomId],
  );

  // 호출부에서 의존성 배열에 그대로 넣을 수 있도록 참조를 고정한다.
  return useMemo(() => ({ enqueue, flush, clear }), [enqueue, flush, clear]);
};
