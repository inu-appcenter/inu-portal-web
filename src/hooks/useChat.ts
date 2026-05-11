import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import {
  joinChatRoom,
  getChatMessages,
  getPreviousMessages,
  sendImageMessage,
} from "../apis/chat";
import { createStompClient, publishMessage as publish } from "../utils/stomp";
import useUserStore from "@/stores/useUserStore";
import { ChatMessage, ChatRoom } from "@/types/chat";

export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomInfo, setRoomInfo] = useState<ChatRoom | null>(null);
  const [myHash, setMyHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingPrevious, setIsFetchingPrevious] = useState(false);
  const [hasMore, setHasMore] = useState(true);
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
      } catch (err: any) {
        console.error("채팅방 입장에 실패했습니다:", err);
        const serverMsg = err.response?.data?.msg;
        setError(serverMsg || "채팅방 입장에 실패했습니다. 다시 시도해주세요.");
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
        console.error("STOMP 브로커 연결 오류:", frame.headers["message"]);
        console.error("STOMP 상세 오류 정보:", frame.body);
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

  const sendMessage = (
    content: string,
    isAnonymous: boolean,
    imageFiles: File[] = [],
  ) => {
    if (imageFiles.length > 0 && roomInfo?.id) {
      sendImageMessage(roomInfo.id, content, isAnonymous, imageFiles) // 변경: 파일 배열 전달
        .then((response) => {
          console.log("이미지 메시지 전송 완료:", response);
        })
        .catch((error) => {
          console.error("이미지 메시지 전송 실패:", error);
          window.alert("이미지 메시지 전송에 실패했습니다.");
        });
    } else {
      publish(clientRef.current, roomId, content, isAnonymous);
    }
  };

  const fetchPreviousMessages = useCallback(async () => {
    console.log("무한스크롤 시도:", {
      isFetchingPrevious,
      hasMore,
      msgLength: messages.length,
    });
    console.log("전체 메시지 배열:", messages);
    console.log("첫 번째 메시지 상세:", messages[0]);

    const firstMsg = messages[0];
    const lastId = firstMsg ? firstMsg.messageId : null;
    console.log("추출된 lastId:", lastId);

    // lastId가 없으면 요청을 보내지 않음 (초기 로딩 전 방지)
    if (isFetchingPrevious || !hasMore || lastId === null) return;

    setIsFetchingPrevious(true);
    try {
      const response: any = await getPreviousMessages(roomId, lastId);
      const actualMessages = response.data || response;

      if (!actualMessages || actualMessages.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => [...actualMessages, ...prev]);
        if (actualMessages.length < 20) {
          // 페이지 당 개수가 20개 미만이면 더 이상 없음
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("이전 메시지 로드 실패:", err);
      // 2. 에러 발생 시 무한 루프 방지를 위해 잠시 중단하거나 hasMore를 false로 처리
      setHasMore(false);
    } finally {
      setIsFetchingPrevious(false);
    }
  }, [roomId, messages, isFetchingPrevious, hasMore]);

  return {
    messages,
    sendMessage,
    isLoading,
    isFetchingPrevious,
    hasMore,
    error,
    myHash,
    roomInfo,
    fetchPreviousMessages,
  };
};
