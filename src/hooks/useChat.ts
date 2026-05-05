import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { joinChatRoom, getChatMessages } from "../apis/chat";
import { createStompClient, publishMessage as publish } from "../utils/stomp";
import useUserStore from "@/stores/useUserStore";

// 서버 수신 메시지 타입
interface ChatMessage {
  messageId: number;
  roomId: number;
  senderNickname: string;
  content: string;
  createDate: string;
}

export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const { tokenInfo } = useUserStore();

  useEffect(() => {
    const enterChatRoom = async () => {
      try {
        try {
          await joinChatRoom(roomId);
        } catch (err: any) {
          // 이미 참여 중인 경우(409) 예외 처리 후 진행
          if (err.response?.status === 409) {
            console.log(
              "이미 채팅방에 참여 중입니다. 메시지 로드를 시작합니다.",
            );
          } else {
            throw err; // 기타 에러 상위 전달
          }
        }

        const initialMessages = await getChatMessages(roomId);
        setMessages(initialMessages.data);
        connectStomp();
      } catch (err) {
        console.error("채팅방 입장 실패:", err);
        setError("채팅방 입장에 실패했습니다. 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
      }
    };

    const connectStomp = () => {
      const jwtToken = tokenInfo.accessToken;
      if (!jwtToken) {
        setError("인증 토큰을 찾을 수 없습니다.");
        return;
      }

      const client = createStompClient();
      client.connectHeaders = { Auth: `${jwtToken}` };

      client.onConnect = () => {
        client.subscribe(`/sub/room/${roomId}`, (message) => {
          const receivedMessage: ChatMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, receivedMessage]);
        });
      };

      client.onStompError = (frame) => {
        console.error("브로커 에러 발생:", frame.headers["message"]);
        console.error("상세 정보:", frame.body);
        setError("연결 오류가 발생했습니다. 페이지를 새로고침 해주세요.");
      };

      client.activate();
      clientRef.current = client;
    };

    enterChatRoom();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [roomId]);

  const sendMessage = (content: string, isAnonymous: boolean) => {
    publish(clientRef.current, roomId, content, isAnonymous);
  };

  return { messages, sendMessage, isLoading, error };
};
