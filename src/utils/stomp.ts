import { Client, ReconnectionTimeMode } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const createStompClient = () => {
  // baseURL 끝에 /가 있을 경우를 대비
  const normalizedBaseURL = API_BASE_URL.replace(/\/$/, "");

  // baseURL이 http/https로 시작하는 경우 ws/wss로 변환
  const brokerURL = normalizedBaseURL.replace(/^http/, "ws") + "/ws-chat";

  const client = new Client({
    brokerURL: brokerURL,
    webSocketFactory: () => new SockJS(`${normalizedBaseURL}/ws-chat`), // SockJS 사용
    // 복귀 직후 빠르게 붙되, 서버가 죽어 있을 때 무한 폭주하지 않도록 지수 백오프
    reconnectDelay: 1000,
    reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
    maxReconnectDelay: 30000,
    // 핸드셰이크가 응답 없이 매달리면(모바일 네트워크 전환 등) 재연결 루프 자체가
    // 멈춰버리므로 타임아웃을 두고 다시 시도하게 한다.
    connectionTimeout: 10000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    // 하트비트가 끊겼는데 close 이벤트가 오지 않는 좀비 소켓을 즉시 버린다.
    discardWebsocketOnCommFailure: true,
  });

  return client;
};

export const publishMessage = (
  client: Client | null,
  roomId: string | number,
  content: string,
  isAnonymous: boolean,
  messageType?: string,
  extraData?: string,
): boolean => {
  if (!client || !client.connected) {
    console.error("STOMP 클라이언트가 연결되지 않았습니다.");
    return false;
  }

  client.publish({
    destination: "/pub/message",
    body: JSON.stringify({
      roomId,
      content,
      isAnonymous,
      messageType: messageType || "TEXT",
      extraData,
    }),
  });
  return true;
};
