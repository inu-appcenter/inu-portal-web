import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { joinChatRoom, getChatMessages } from "../apis/chat";
import { createStompClient, publishMessage as publish } from "../utils/stomp";
import useUserStore from "@/stores/useUserStore";
import { ChatMessage, ChatRoom } from "@/types/chat";

export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomInfo, setRoomInfo] = useState<ChatRoom | null>(null);
  const [myHash, setMyHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const { tokenInfo } = useUserStore();

  useEffect(() => {
    const enterChatRoom = async () => {
      try {
        try {
          const joinResponse: any = await joinChatRoom(roomId);
          const joinData = joinResponse.data || joinResponse;
          if (joinData.myHash) {
            setMyHash(joinData.myHash);
          }
        } catch (err: any) {
          // 상태 코드 409 예외 처리
          if (err.response?.status === 409) {
            if (err.response?.data?.data?.myHash) {
              setMyHash(err.response.data.data.myHash);
            }
          } else {
            throw err;
          }
        }

        const roomResponse: any = await getChatMessages(roomId);
        const actualRoomData = roomResponse.data || roomResponse;

        // 채팅방 정보 저장
        setRoomInfo(actualRoomData);

        // 초기 메시지 저장
        if (actualRoomData.messages && Array.isArray(actualRoomData.messages)) {
          setMessages(actualRoomData.messages);
        } else if (Array.isArray(actualRoomData)) {
          setMessages(actualRoomData);
        } else {
          setMessages([]);
        }

        // 사용자 해시값 갱신
        if (actualRoomData.myHash) {
          setMyHash(actualRoomData.myHash);
        }

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
        console.error("브로커 에러:", frame.headers["message"]);
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

  return { messages, sendMessage, isLoading, error, myHash, roomInfo };
};
