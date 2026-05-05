import { Client } from "@stomp/stompjs";
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
    reconnectDelay: 5000, // 재연결 시도
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => {
      console.log(new Date(), str);
    },
  });

  return client;
};

export const publishMessage = (
  client: Client | null,
  roomId: string | number,
  content: string,
  isAnonymous: boolean,
) => {
  if (!client || !client.connected) {
    console.error("STOMP 클라이언트가 연결되지 않았습니다.");
    return;
  }

  client.publish({
    destination: "/pub/message",
    body: JSON.stringify({
      roomId,
      content,
      isAnonymous,
    }),
  });
};
