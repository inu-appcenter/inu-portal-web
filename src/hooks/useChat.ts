import { useCallback, useEffect, useRef, useState } from "react";
import {
  getPreviousMessages,
  joinChatRoom,
  sendImageMessage,
} from "@/apis/chat";
import useUserStore from "@/stores/useUserStore";
import { ChatMessage, ChatRoom } from "@/types/chat";
import {
  PAGE_SIZE,
  fetchRoomSnapshot,
  mergeMessages,
  newestMessageId,
  unwrapResponse,
} from "./chat/messageSync";
import { useChatSocket } from "./chat/useChatSocket";
import { useMessageOutbox } from "./chat/useMessageOutbox";

/** 읽음 상태 갱신 알림이 몰릴 때의 디바운스 */
const READ_SYNC_DEBOUNCE_MS = 400;

/**
 * 채팅방 하나의 메시지 목록과 실시간 연결을 관리한다.
 *
 * 목록은 항상 messageId 오름차순으로 유지되며, 서버에서 받아온 내용은
 * 덮어쓰지 않고 병합한다. 소켓이 끊겨 있던 동안 놓친 메시지는 재연결 시점과
 * 포그라운드 복귀 시점에 동기화로 메운다. (`./chat/messageSync` 참고)
 */
export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomInfo, setRoomInfo] = useState<ChatRoom | null>(null);
  const [myHash, setMyHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingPrevious, setIsFetchingPrevious] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** 입장(join + 초기 로드)을 마친 방. 소켓은 이 방에 대해서만 연결한다. */
  const [enteredRoomId, setEnteredRoomId] = useState<string | null>(null);

  const { tokenInfo } = useUserStore();
  const outbox = useMessageOutbox(roomId);

  /** setMessages 콜백 밖(소켓 핸들러, 동기화 루프)에서 최신 목록을 읽기 위한 미러 */
  const messagesRef = useRef<ChatMessage[]>([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const applyMessages = useCallback(
    (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
      setMessages((prev) => {
        const next = updater(prev);
        messagesRef.current = next;
        return next;
      });
    },
    [],
  );

  // ---------------------------------------------------------------- 동기화

  /** 서버 최신 상태를 가져와 로컬 목록에 병합한다. */
  const pullRoomSnapshot = useCallback(async () => {
    try {
      const snapshot = await fetchRoomSnapshot(
        roomId,
        newestMessageId(messagesRef.current),
        () => !isMountedRef.current,
      );
      if (!snapshot) return;

      if (snapshot.room) {
        setRoomInfo(snapshot.room);
        if (snapshot.room.myHash) setMyHash(snapshot.room.myHash);
      }
      applyMessages((prev) => mergeMessages(prev, snapshot.messages));
    } catch (err) {
      console.error("메시지 동기화 실패:", err);
    }
  }, [roomId, applyMessages]);

  const isSyncingRef = useRef(false);
  const hasPendingSyncRef = useRef(false);

  /**
   * 여러 경로(재연결, 복귀, 읽음 갱신, 이미지 업로드)에서 호출되므로
   * 동시에 여러 번 돌지 않도록 합친다. 진행 중에 들어온 요청은 예약해두었다가
   * 끝난 뒤 한 번만 다시 실행한다.
   */
  const syncMessages = useCallback(async () => {
    if (!roomId) return;

    if (isSyncingRef.current) {
      hasPendingSyncRef.current = true;
      return;
    }

    isSyncingRef.current = true;
    try {
      await pullRoomSnapshot();
    } finally {
      isSyncingRef.current = false;
      if (hasPendingSyncRef.current && isMountedRef.current) {
        hasPendingSyncRef.current = false;
        void syncMessages();
      }
    }
  }, [roomId, pullRoomSnapshot]);

  const readSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 읽음 갱신 알림은 몰려서 오므로 한 박자 모아서 처리한다. */
  const scheduleReadSync = useCallback(() => {
    if (readSyncTimerRef.current) return;
    readSyncTimerRef.current = setTimeout(() => {
      readSyncTimerRef.current = null;
      void syncMessages();
    }, READ_SYNC_DEBOUNCE_MS);
  }, [syncMessages]);

  useEffect(
    () => () => {
      if (readSyncTimerRef.current) clearTimeout(readSyncTimerRef.current);
    },
    [],
  );

  // ------------------------------------------------------------ 실시간 연결

  const { isConnected, publish, reconnect } = useChatSocket({
    roomId,
    accessToken: tokenInfo.accessToken,
    enabled: enteredRoomId === roomId,
    onMessage: (message) =>
      applyMessages((prev) => mergeMessages(prev, [message])),
    onReadUpdate: scheduleReadSync,
    onConnected: (client) => {
      // 끊겨 있던 동안 놓친 메시지를 메우고, 밀린 전송을 흘려보낸다.
      // 최초 연결 때도 한 번 도는데 이미 받아둔 목록과 병합되므로 비용은 요청 1회뿐이다.
      void syncMessages();
      outbox.flush(client);
    },
    onResume: () => void syncMessages(),
    onError: setError,
  });

  // -------------------------------------------------------------- 방 전환

  // roomId가 바뀌면 이전 방의 상태가 남지 않도록 초기화한다.
  useEffect(() => {
    messagesRef.current = [];
    outbox.clear();
    setMessages([]);
    setRoomInfo(null);
    setMyHash(null);
    setHasMore(true);
    setError(null);
    setIsLoading(true);
  }, [roomId, outbox]);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;

    const enterRoom = async () => {
      try {
        try {
          const joined = unwrapResponse<ChatRoom>(await joinChatRoom(roomId));
          if (joined?.myHash) setMyHash(joined.myHash);
        } catch (err: any) {
          // 409 = 이미 참여 중. 응답에 담긴 myHash만 챙기고 정상 진행한다.
          if (err.response?.status !== 409) throw err;
          const hash = err.response?.data?.data?.myHash;
          if (hash) setMyHash(hash);
        }

        await syncMessages();
        if (cancelled) return;
        setEnteredRoomId(roomId);
      } catch (err: any) {
        if (cancelled) return;
        console.error("채팅방 입장에 실패했습니다:", err);
        setError(
          err.response?.data?.msg ||
            "채팅방 입장에 실패했습니다. 다시 시도해주세요.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void enterRoom();
    return () => {
      cancelled = true;
    };
  }, [roomId, syncMessages]);

  // ---------------------------------------------------------------- 전송

  const sendImages = useCallback(
    async (
      targetRoomId: number,
      content: string,
      isAnonymous: boolean,
      imageFiles: File[],
      onProgress?: (progressEvent: any) => void,
    ) => {
      try {
        await sendImageMessage(
          targetRoomId,
          content,
          isAnonymous,
          imageFiles,
          onProgress,
        );
        // 업로드 응답이 소켓 echo보다 먼저 도착할 수 있어 한 번 당겨온다.
        void syncMessages();
      } catch (err) {
        console.error("이미지 메시지 전송 실패:", err);
        window.alert("이미지 메시지 전송에 실패했습니다.");
      }
    },
    [syncMessages],
  );

  const sendMessage = useCallback(
    (
      content: string,
      isAnonymous: boolean,
      imageFiles: File[] = [],
      onProgress?: (progressEvent: any) => void,
      messageType?: string,
      extraData?: string,
    ): boolean => {
      if (imageFiles.length > 0 && roomInfo?.id) {
        void sendImages(
          roomInfo.id,
          content,
          isAnonymous,
          imageFiles,
          onProgress,
        );
        return true;
      }

      if (!publish(content, isAnonymous, messageType, extraData)) {
        // 연결이 끊긴 순간의 전송을 버리지 않고 재연결 후 흘려보낸다.
        outbox.enqueue({ content, isAnonymous, messageType, extraData });
        reconnect();
      }

      return true;
    },
    [roomInfo?.id, sendImages, publish, outbox, reconnect],
  );

  // ------------------------------------------------------------ 이전 메시지

  /** 스크롤 이벤트가 연달아 들어와도 한 번만 요청하도록 막는다. */
  const isFetchingPreviousRef = useRef(false);

  const fetchPreviousMessages = useCallback(async () => {
    const oldestLoaded = messagesRef.current[0];
    // 초기 로딩 전에는 기준점이 없으므로 요청하지 않는다.
    if (!oldestLoaded || isFetchingPreviousRef.current || !hasMore) {
      return;
    }

    isFetchingPreviousRef.current = true;
    setIsFetchingPrevious(true);
    try {
      const older =
        unwrapResponse<ChatMessage[]>(
          await getPreviousMessages(roomId, oldestLoaded.messageId),
        ) ?? [];

      if (older.length === 0) {
        setHasMore(false);
        return;
      }

      applyMessages((prev) => mergeMessages(prev, older));
      // 페이지가 덜 찼으면 마지막 페이지다.
      if (older.length < PAGE_SIZE) setHasMore(false);
    } catch (err) {
      console.error("이전 메시지 로드 실패:", err);
      // 무한 루프 방지를 위해 더 이상 요청하지 않는다.
      setHasMore(false);
    } finally {
      isFetchingPreviousRef.current = false;
      setIsFetchingPrevious(false);
    }
  }, [roomId, hasMore, applyMessages]);

  return {
    messages,
    sendMessage,
    isLoading,
    isFetchingPrevious,
    hasMore,
    error,
    myHash,
    roomInfo,
    isStompConnected: isConnected,
    fetchPreviousMessages,
    refreshRoom: syncMessages,
  };
};
