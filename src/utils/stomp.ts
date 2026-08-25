import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const createStompClient = () => {
  // baseURL 끝에 /가 있을 경우를 대비
  const normalizedBaseURL = API_BASE_URL.replace(/\/$/, "");

  const client = new Client({
    // SockJS 폴백을 쓰므로 접속 주소는 webSocketFactory가 결정한다.
    // (webSocketFactory가 있으면 stompjs는 brokerURL을 보지 않는다)
    webSocketFactory: () => new SockJS(`${normalizedBaseURL}/ws-chat`),
    reconnectDelay: 5000, // 재연결 시도
    connectionTimeout: 10000, // 핸드셰이크가 멈춰 있으면 버리고 재시도한다
    // 하트비트 타이머는 백그라운드 탭에서 스로틀링되므로, 탭이 내려가면
    // 양쪽 모두 비교적 빨리 끊긴 것으로 판단한다.
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  return client;
};

/**
 * 소켓을 기다리지 않고 즉시 닫는다.
 *
 * stompjs의 기본 `deactivate()`는 DISCONNECT 프레임을 보낸 뒤 서버의 RECEIPT가
 * 돌아와야 소켓을 닫는다. 탭이 백그라운드로 내려가거나 WebView가 정지되면 그 왕복이
 * 끝나지 않아 소켓이 서버 쪽에 그대로 살아 있고, 서버는 사용자가 여전히 채팅방을
 * 보고 있다고 판단해 FCM 푸시를 보내지 않는다.
 *
 * `force: true`는 RECEIPT를 기다리지 않고 소켓을 곧바로 close 하므로,
 * 서버가 즉시 끊김을 인지하고 푸시 발송으로 전환한다.
 */
export const closeStompClientImmediately = (client: Client | null) => {
  if (!client) return;
  void client.deactivate({ force: true });
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
