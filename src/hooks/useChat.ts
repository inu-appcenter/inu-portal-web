import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import {
  joinChatRoom,
  getChatMessages,
  getPreviousMessages,
  sendImageMessage,
} from "../apis/chat";
import {
  createStompClient,
  closeStompClientImmediately,
  publishMessage as publish,
} from "../utils/stomp";
import useUserStore from "@/stores/useUserStore";
import { ChatMessage, ChatRoom } from "@/types/chat";

/** 읽음 상태 브로드캐스트로 인한 재동기화의 최소 간격(ms) */
const READ_SYNC_MIN_INTERVAL = 1000;

import { mergeMessages, oldestMessageId, compareMessageIds } from "./chat/messageSync";

export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomInfo, setRoomInfo] = useState<ChatRoom | null>(null);
  const [myHash, setMyHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingPrevious, setIsFetchingPrevious] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStompConnected, setIsStompConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const { tokenInfo } = useUserStore();

  const isSyncingRef = useRef(false);
  const pendingSyncRef = useRef(false);
  const lastSyncAtRef = useRef(0);

  // 동기화는 setMessages 바깥(비동기 콜백)에서 끊김 여부를 판단해야 하므로
  // 현재 가진 마지막 messageId를 따로 들고 있는다.
  const newestMessageIdRef = useRef<string | null>(null);
  useEffect(() => {
    newestMessageIdRef.current =
      messages.length > 0 ? messages[messages.length - 1].messageId : null;
  }, [messages]);

  // roomId가 바뀌어도 컴포넌트는 그대로 유지되므로, 이전 방의 메시지가
  // 병합되어 섞이지 않도록 여기서 명시적으로 비운다.
  const prevRoomIdRef = useRef(roomId);
  useEffect(() => {
    if (prevRoomIdRef.current === roomId) return;
    prevRoomIdRef.current = roomId;
    setMessages([]);
    setRoomInfo(null);
    setMyHash(null);
    setHasMore(true);
    setError(null);
    setIsLoading(true);
  }, [roomId]);

  /**
   * 방 정보와 최근 메시지를 서버 상태에 다시 맞춘다.
   *
   * `throttle`은 읽음 상태 브로드캐스트처럼 연달아 들어오는 트리거에만 쓴다.
   * GET /api/chat-rooms/{roomId}가 읽음 처리를 하고 그 결과가 다시 `/read`로
   * 브로드캐스트되기 때문에, 제한이 없으면 서로를 호출하는 루프가 된다.
   */
  const syncRoom = useCallback(
    async (options: { throttle?: boolean } = {}) => {
      if (
        options.throttle &&
        Date.now() - lastSyncAtRef.current < READ_SYNC_MIN_INTERVAL
      ) {
        return;
      }

      if (isSyncingRef.current) {
        // 진행 중인 요청은 지금보다 오래된 스냅샷일 수 있으니 끝난 뒤 한 번 더 돌린다.
        if (!options.throttle) pendingSyncRef.current = true;
        return;
      }

      isSyncingRef.current = true;
      try {
        do {
          pendingSyncRef.current = false;

          const roomResponse: any = await getChatMessages(roomId);
          const actualRoomData = roomResponse.data || roomResponse;

          const incoming: ChatMessage[] = Array.isArray(actualRoomData)
            ? actualRoomData
            : Array.isArray(actualRoomData.messages)
              ? actualRoomData.messages
              : [];

          if (!Array.isArray(actualRoomData)) {
            setRoomInfo(actualRoomData);
            if (actualRoomData.myHash) setMyHash(actualRoomData.myHash);
          }

          // 자리를 비운 사이 50개 넘게 쌓이면 스냅샷이 기존 목록과 겹치지 않는다.
          // 그대로 이어붙이면 중간이 빈 채로 남고 무한스크롤로도 메울 수 없으므로,
          // 스냅샷만 남기고 과거 로딩을 다시 연다.
          const newestKnownId = newestMessageIdRef.current;
          const oldestIncomingId = oldestMessageId(incoming);
          const hasGap =
            incoming.length > 0 &&
            newestKnownId !== null &&
            oldestIncomingId !== null &&
            compareMessageIds(oldestIncomingId, newestKnownId) > 0;

          if (hasGap) setHasMore(true);
          setMessages((prev) =>
            hasGap ? incoming : mergeMessages(prev, incoming),
          );
        } while (pendingSyncRef.current);
      } catch (err) {
        console.error("메시지 동기화 실패:", err);
      } finally {
        lastSyncAtRef.current = Date.now();
        pendingSyncRef.current = false;
        isSyncingRef.current = false;
      }
    },
    [roomId],
  );

  useEffect(() => {
    // 이 effect가 만든 클라이언트만 이 effect가 정리한다. clientRef는 전송용
    // 최신 참조일 뿐이라, 비동기 입장 도중 effect가 교체되면 서로 어긋날 수 있다.
    let client: Client | null = null;
    let disposed = false;

    const connectStomp = () => {
      const jwtToken = tokenInfo.accessToken;
      if (!jwtToken) {
        setError("인증 토큰을 찾을 수 없습니다.");
        return;
      }
      // 입장 처리를 기다리는 사이 언마운트/roomId 변경이 일어났다면 연결하지 않는다.
      // (연결해 버리면 정리 대상에서 빠져 소켓이 영원히 남고, 서버는 계속
      //  접속 중으로 보아 푸시를 보내지 않는다)
      if (disposed) return;

      const stompClient = createStompClient();
      stompClient.connectHeaders = { Auth: `${jwtToken}` };

      stompClient.onConnect = () => {
        setIsStompConnected(true);

        // 새 메시지 구독
        stompClient.subscribe(`/sub/room/${roomId}`, (message) => {
          if (!message.body) return;

          // 서버는 이 토픽으로 메시지 JSON 말고 "updated" 문자열도 보낸다.
          // (다른 참여자의 입장으로 읽음 상태가 바뀌었을 때, 강퇴가 일어났을 때)
          // JSON.parse가 실패해 조용히 버려지면 안 읽음 표시가 그대로 남는다.
          let parsed: unknown;
          try {
            parsed = JSON.parse(message.body);
          } catch (err) {
            parsed = message.body;
          }

          if (typeof parsed !== "object" || parsed === null) {
            if (parsed === "updated") void syncRoom({ throttle: true });
            return;
          }

          const receivedMessage = parsed as ChatMessage;
          setMessages((prev) => {
            // 중복 메시지 방지 로직 추가
            const isDuplicate = prev.some(
              (m) => m.messageId === receivedMessage.messageId,
            );
            if (isDuplicate) return prev;
            return [...prev, receivedMessage];
          });
        });

        // 읽음 상태 업데이트 구독
        stompClient.subscribe(`/sub/room/${roomId}/read`, (message) => {
          if (message.body === "updated") {
            void syncRoom({ throttle: true });
          }
        });

        // 구독이 붙은 직후 서버 상태를 다시 읽어, 소켓이 끊겨 있던 동안
        // 도착한 메시지를 채운다. 최초 입장·네트워크 재연결·포그라운드 복귀가
        // 모두 이 경로를 지난다.
        void syncRoom();
      };

      // 연결이 끊긴 사실을 상태에 반영해야 전송/자동 발송 로직이 오판하지 않는다.
      stompClient.onWebSocketClose = () => setIsStompConnected(false);
      stompClient.onDisconnect = () => setIsStompConnected(false);

      stompClient.onStompError = (frame) => {
        setIsStompConnected(false);
        console.error("STOMP 브로커 연결 오류:", frame.headers["message"]);
        console.error("STOMP 상세 오류 정보:", frame.body);
        setError("연결 오류가 발생했습니다. 페이지를 새로고침 해주세요.");
      };

      stompClient.activate();
      client = stompClient;
      clientRef.current = stompClient;
    };

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

        await syncRoom();
        connectStomp();
      } catch (err: any) {
        console.error("채팅방 입장에 실패했습니다:", err);
        const serverMsg = err.response?.data?.msg;
        setError(serverMsg || "채팅방 입장에 실패했습니다. 다시 시도해주세요.");
      } finally {
        if (!disposed) setIsLoading(false);
      }
    };

    // 입장과 초기 동기화가 끝난 뒤 enterChatRoom 내부에서 한 번만 연결한다.
    // 두 클라이언트가 경쟁하면 연결 상태와 sendMessage의 참조가 어긋날 수 있다.
    enterChatRoom();

    const handleHidden = () => {
      if (!client) return;
      // 소켓이 살아 있는 동안 서버는 사용자가 채팅방을 보고 있다고 판단해
      // FCM 푸시를 보내지 않는다. 탭이 얼어붙기 전에 즉시 끊어야 한다.
      closeStompClientImmediately(client);
      setIsStompConnected(false);
    };

    const handleVisible = () => {
      if (!client || disposed) return;
      // 소켓 재연결을 기다리지 않고 먼저 화면을 맞춘 뒤,
      // 재연결이 끝나면 onConnect에서 한 번 더 맞춘다.
      void syncRoom();
      client.activate();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleHidden();
      } else {
        handleVisible();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    // iOS 사파리/WebView는 앱이 백그라운드로 갈 때나 페이지가 bfcache로 들어갈 때
    // visibilitychange 없이 pagehide만 주는 경우가 있어 함께 건다.
    window.addEventListener("pagehide", handleHidden);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleHidden);
      closeStompClientImmediately(client);
      if (clientRef.current === client) {
        clientRef.current = null;
      }
      setIsStompConnected(false);
    };
  }, [roomId, syncRoom, tokenInfo.accessToken]);

  const sendMessage = (
    content: string,
    isAnonymous: boolean,
    imageFiles: File[] = [],
    onProgress?: (progressEvent: any) => void,
    messageType?: string,
    extraData?: string,
  ): boolean => {
    if (imageFiles.length > 0 && roomInfo?.id) {
      sendImageMessage(
        roomInfo.id,
        content,
        isAnonymous,
        imageFiles,
        onProgress,
      ) // 변경: 파일 배열 및 프로그레스 전달
        .then((response) => {
          console.log("이미지 메시지 전송 완료:", response);
        })
        .catch((error) => {
          console.error("이미지 메시지 전송 실패:", error);
          window.alert("이미지 메시지 전송에 실패했습니다.");
        });
      return true;
    } else {
      return publish(
        clientRef.current,
        roomId,
        content,
        isAnonymous,
        messageType,
        extraData,
      );
    }
  };

  const fetchPreviousMessages = useCallback(async () => {
    const firstMsg = messages[0];
    const lastId = firstMsg ? firstMsg.messageId : null;

    // lastId가 없으면 요청을 보내지 않음 (초기 로딩 전 방지)
    if (isFetchingPrevious || !hasMore || lastId === null) return;

    setIsFetchingPrevious(true);
    try {
      const response: any = await getPreviousMessages(roomId, lastId);
      const actualMessages = response.data || response;

      if (!actualMessages || actualMessages.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => mergeMessages(prev, actualMessages));
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

  const refreshRoom = useCallback(() => {
    void syncRoom();
  }, [syncRoom]);

  return {
    messages,
    sendMessage,
    isLoading,
    isFetchingPrevious,
    hasMore,
    error,
    myHash,
    roomInfo,
    isStompConnected,
    fetchPreviousMessages,
    refreshRoom,
  };
};
