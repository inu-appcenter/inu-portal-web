import { useCallback, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { createStompClient, publishMessage } from "@/utils/stomp";
import { ChatMessage } from "@/types/chat";

/**
 * 백그라운드 전환 후 소켓을 끊기까지의 유예 시간.
 * 탭/앱을 잠깐 벗어날 때마다 소켓을 내리면 재연결 비용만 커지고
 * 그 사이 메시지를 놓친다. 이 시간을 넘겨 계속 백그라운드면
 * FCM 푸시 수신을 위해 소켓을 내린다.
 */
const BACKGROUND_DISCONNECT_DELAY_MS = 30_000;

/** 포그라운드 복귀 이벤트가 겹쳐 들어올 때의 중복 호출 방지 간격 */
const RESUME_THROTTLE_MS = 1_000;

/** 한 번의 복귀에 대해 겹쳐서 발생하는 이벤트들 */
const RESUME_EVENTS = ["focus", "online", "pageshow"] as const;

/**
 * `force: true`가 중요하다. 일반 `deactivate()`는 websocket의 close 이벤트를
 * 기다리는데, 백그라운드/네트워크 단절 상태에서는 그 이벤트가 영영 오지 않을 수
 * 있다. 그러면 이후 `activate()`가 그 promise에 체이닝되어 소켓이 다시는 붙지
 * 않는다.
 */
const forceDisconnect = (client: Client | null) => {
  void client?.deactivate({ force: true });
};

type ChatSocketHandlers = {
  /** 새 메시지 수신 */
  onMessage: (message: ChatMessage) => void;
  /** 읽음 상태가 갱신됐다는 알림 */
  onReadUpdate: () => void;
  /** 연결 성립. 끊겨 있던 동안의 공백을 메울 기회 */
  onConnected: (client: Client) => void;
  /** 포그라운드 복귀 (스로틀 적용됨) */
  onResume: () => void;
  onError: (message: string) => void;
};

type UseChatSocketOptions = ChatSocketHandlers & {
  roomId: string;
  accessToken?: string;
  /** 방 입장과 초기 로드가 끝난 뒤에만 연결한다. */
  enabled: boolean;
};

/**
 * 채팅방 STOMP 소켓의 수명을 관리한다.
 * 구독, 백그라운드 전환 시 연결 해제, 포그라운드 복귀 시 재연결까지 담당한다.
 *
 * 핸들러는 최신 참조로 호출되므로, 콜백이 매 렌더 새로 만들어져도 재연결되지 않는다.
 */
export const useChatSocket = ({
  roomId,
  accessToken,
  enabled,
  ...handlers
}: UseChatSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  const handlersRef = useRef<ChatSocketHandlers>(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  /** 끊겨 있으면 즉시 재연결을 시도한다. 이미 살아 있으면 아무 일도 하지 않는다. */
  const reconnect = useCallback(() => {
    const client = clientRef.current;
    if (client && !client.active) client.activate();
  }, []);

  const publish = useCallback(
    (
      content: string,
      isAnonymous: boolean,
      messageType?: string,
      extraData?: string,
    ) =>
      publishMessage(
        clientRef.current,
        roomId,
        content,
        isAnonymous,
        messageType,
        extraData,
      ),
    [roomId],
  );

  useEffect(() => {
    if (!enabled || !roomId) return;

    if (!accessToken) {
      handlersRef.current.onError("인증 토큰을 찾을 수 없습니다.");
      return;
    }

    let cancelled = false;
    let backgroundTimer: ReturnType<typeof setTimeout> | null = null;
    let lastResumeAt = 0;

    const client = createStompClient();
    clientRef.current = client;
    client.connectHeaders = { Auth: `${accessToken}` };

    client.onConnect = () => {
      if (cancelled) return;
      setIsConnected(true);

      client.subscribe(`/sub/room/${roomId}`, (frame) => {
        if (!frame.body) return;
        try {
          handlersRef.current.onMessage(JSON.parse(frame.body) as ChatMessage);
        } catch {
          // non-JSON 메시지는 안전하게 건너뜀
        }
      });

      client.subscribe(`/sub/room/${roomId}/read`, (frame) => {
        if (frame.body === "updated") handlersRef.current.onReadUpdate();
      });

      handlersRef.current.onConnected(client);
    };

    client.onWebSocketClose = () => {
      if (!cancelled) setIsConnected(false);
    };

    client.onStompError = (frame) => {
      if (cancelled) return;
      setIsConnected(false);
      console.error("STOMP 브로커 연결 오류:", frame.headers["message"]);
      console.error("STOMP 상세 오류 정보:", frame.body);
      handlersRef.current.onError(
        "연결 오류가 발생했습니다. 페이지를 새로고침 해주세요.",
      );
    };

    client.activate();

    const clearBackgroundTimer = () => {
      if (backgroundTimer === null) return;
      clearTimeout(backgroundTimer);
      backgroundTimer = null;
    };

    /** 백그라운드가 충분히 길어지면 소켓을 내리고 FCM 푸시에 맡긴다. */
    const suspend = () => {
      clearBackgroundTimer();
      backgroundTimer = setTimeout(() => {
        backgroundTimer = null;
        forceDisconnect(client);
        setIsConnected(false);
      }, BACKGROUND_DISCONNECT_DELAY_MS);
    };

    /**
     * 포그라운드 복귀 처리.
     * - 소켓이 내려가 있으면 다시 올린다. (연결되면 onConnected로 이어진다)
     * - 소켓이 살아 있어 보여도 onResume을 부른다. 모바일에서 프로세스가 잠들면
     *   readyState는 OPEN인데 실제로는 죽어 있는 "좀비 소켓"이 흔하고, 이때 놓친
     *   메시지는 하트비트가 끊김을 감지할 때까지 화면에 뜨지 않는다.
     */
    const resume = () => {
      clearBackgroundTimer();
      reconnect();

      const now = Date.now();
      if (now - lastResumeAt < RESUME_THROTTLE_MS) return;
      lastResumeAt = now;

      handlersRef.current.onResume();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") suspend();
      else resume();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    RESUME_EVENTS.forEach((event) => window.addEventListener(event, resume));

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      RESUME_EVENTS.forEach((event) =>
        window.removeEventListener(event, resume),
      );
      clearBackgroundTimer();
      forceDisconnect(client);
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [roomId, accessToken, enabled, reconnect]);

  return { isConnected, publish, reconnect };
};
