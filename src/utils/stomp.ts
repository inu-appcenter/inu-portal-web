import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// STOMP 클라이언트를 생성하고 반환하는 함수
export const createStompClient = () => {
  const client = new Client({
    brokerURL: 'ws://localhost:8080/ws-chat', // 개발 환경용 URL
    // brokerURL: 'wss://[YOUR_DOMAIN]/ws-chat', // 배포 환경용 URL
    webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'), // SockJS 사용
    // webSocketFactory: () => new SockJS('https://[YOUR_DOMAIN]/ws-chat'), // 배포 환경용
    reconnectDelay: 5000, // 5초 후 재연결 시도
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => {
      console.log(new Date(), str); // 디버그 로그
    },
  });

  return client;
};

// 메시지 발행(publish) 함수
export const publishMessage = (
  client: Client | null,
  roomId: string | number,
  content: string,
  isAnonymous: boolean,
) => {
  if (!client || !client.connected) {
    console.error('STOMP client is not connected.');
    return;
  }

  client.publish({
    destination: '/pub/message',
    body: JSON.stringify({
      roomId,
      content,
      isAnonymous,
    }),
  });
};
