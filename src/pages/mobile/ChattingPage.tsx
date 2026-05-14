import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate import 추가
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { Send, Users, Loader2, Image } from "lucide-react";
import { useHeader } from "@/context/HeaderContext";
import { useVisualViewport } from "@/hooks/useVisualViewport";
import ImageModal from "@/components/mobile/chat/ImageModal";
import ImageUploadModal from "@/components/mobile/chat/ImageUploadModal";
import MemberListDrawer from "@/components/mobile/chat/MemberListDrawer";
import { ChatMessage } from "@/types/chat";
import { mixpanelTrack, trackPageView } from "@/utils/mixpanel";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MESSAGE_COLORS = [
  "#FFF4BD",
  "#E2F0D9",
  "#FFD9D9",
  "#D9EFFF",
  "#EADBFF",
  "#FFE5D0",
];

const getMessageColor = (identifier: string) => {
  if (!identifier) return MESSAGE_COLORS[0];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash);
  return MESSAGE_COLORS[index % MESSAGE_COLORS.length];
};

import { updateChatRoomTitle } from "@/apis/chat";
import useUserStore from "@/stores/useUserStore";
import { ROUTES } from "@/constants/routes";

export default function ChattingPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { userInfo } = useUserStore();
  const isAdmin = userInfo?.role?.toLowerCase() === "admin";

  const [inputValue, setInputValue] = useState<string>("");
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);

  useEffect(() => {
    trackPageView("채팅방", { room_id: roomId });
  }, [roomId]);

  const {
    messages,
    sendMessage,
    isLoading,
    isFetchingPrevious,
    hasMore,
    error,
    myHash,
    roomInfo,
    fetchPreviousMessages,
    refreshRoom,
  } = useChat(roomId ?? "");

  useVisualViewport();

  const handleUpdateTitle = async () => {
    if (roomInfo?.isOfficial) {
      alert("공식 채팅방의 이름은 변경할 수 없습니다.");
      return;
    }

    // 오픈채팅인 경우 방장 또는 어드민만 가능
    if (roomInfo?.type === "OPEN" && !roomInfo.owner && !isAdmin) {
      alert("오픈채팅방 이름은 방장 또는 관리자만 변경할 수 있습니다.");
      return;
    }

    const newTitle = prompt(
      "새로운 채팅방 이름을 입력하세요. 참여자 모두에게 적용됩니다.",
      roomInfo?.title || "",
    );
    if (newTitle === null) return;
    if (!newTitle.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    try {
      mixpanelTrack.chatRoomMenuClicked("채팅방 이름 변경", roomId ?? "");
      await updateChatRoomTitle(Number(roomId), newTitle.trim());
      refreshRoom();
    } catch (err: any) {
      alert(err.response?.data?.msg || "방 이름 변경에 실패했습니다.");
    }
  };

  // 에러 처리 useEffect 추가
  useEffect(() => {
    if (error) {
      alert(error); // 에러 메시지 표시
      navigate(ROUTES.CHAT.LIST, { replace: true }); // 채팅 목록 페이지로 이동
    }
  }, [error, navigate]);

  const headerRight = React.useMemo(
    () => (
      <HeaderRightArea>
        <IconButton
          onClick={() => {
            mixpanelTrack.chatRoomMenuClicked("멤버 목록 열기", roomId ?? "");
            setIsMemberListOpen(true);
          }}
        >
          <Users size={24} color="#1C1C1E" />
        </IconButton>
      </HeaderRightArea>
    ),
    [roomId],
  );

  const headerTitle = React.useMemo(
    () =>
      roomInfo ? (
        <TitleWrapper>
          <span className="text">{roomInfo.friendAlias || roomInfo.title}</span>
          {roomInfo.isOfficial && <OfficialTag>공식</OfficialTag>}
        </TitleWrapper>
      ) : (
        "채팅방"
      ),
    [roomInfo],
  );

  const menuItems = React.useMemo(() => {
    const items = [];

    let canChangeTitle = false;
    
    if (roomInfo) {
      if (roomInfo.type === "OPEN") {
        // 오픈 채팅방: 방장 또는 시스템 관리자만
        canChangeTitle = !!(roomInfo.owner || isAdmin);
      } else if (roomInfo.type === "PERSONAL") {
        // 개인 채팅방
        if (roomInfo.maxCapacity > 2) {
          // 그룹 개인 채팅방 (3명 이상): 누구나 자유롭게
          canChangeTitle = true;
        } else {
          // 1:1 채팅방 (2명): 변경 불가
          canChangeTitle = false;
        }
      }
    }

    if (canChangeTitle) {
      items.push({
        label: "채팅방 이름 변경",
        onClick: handleUpdateTitle,
      });
    }

    return items;
  }, [roomInfo, isAdmin]);

  useHeader({
    title: headerTitle,
    rightArea: headerRight,
    menuItems: menuItems,
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollHeightRef = useRef<number>(0);
  const lastScrollTopRef = useRef<number>(0);

  // 메시지 역순 메모이제이션
  const reversedMessages = React.useMemo(
    () => [...messages].reverse(),
    [messages],
  );

  // 스크롤 이벤트로 이전 메시지 트리거 감지
  const handleScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (
      !el ||
      isLoading ||
      isFetchingPrevious ||
      !hasMore ||
      messages.length === 0
    )
      return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const absScrollTop = Math.abs(scrollTop);

    // 시각적 상단(물리적 하단) 도달 확인
    if (absScrollTop + clientHeight >= scrollHeight - 100) {
      // 위치 기억
      lastScrollTopRef.current = scrollTop;
      fetchPreviousMessages();
    }
  }, [
    isLoading,
    isFetchingPrevious,
    hasMore,
    messages.length,
    fetchPreviousMessages,
  ]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // 데이터 업데이트 직전 높이 저장
  useLayoutEffect(() => {
    if (isFetchingPrevious && scrollRef.current) {
      scrollHeightRef.current = scrollRef.current.scrollHeight;
    }
  }, [isFetchingPrevious]);

  // 데이터 업데이트 후 위치 보정
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || isFetchingPrevious) return;

    // 이전 메시지 로드 완료 후
    if (scrollHeightRef.current > 0) {
      // 튀는 현상 방지를 위해 기억해둔 scrollTop으로 강제 복원
      scrollEl.scrollTop = lastScrollTopRef.current;
      scrollHeightRef.current = 0;
    }
  }, [messages, isFetchingPrevious]);

  const handleInput = () => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !roomInfo) return;

    const isFestivalChat = roomId === "1";
    mixpanelTrack.chatMessageSent(
      roomId ?? "",
      roomInfo.anonymous,
      false,
      isFestivalChat,
    );

    sendMessage(inputValue.trim(), roomInfo.anonymous);
    setInputValue("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const handleImageClick = (url: string) => {
    mixpanelTrack.chatRoomMenuClicked("이미지 크게 보기", roomId ?? "");
    setSelectedImageUrl(url);
    setIsImageModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setPendingFiles(files);
      setIsUploadModalOpen(true);
      e.target.value = "";
    }
  };

  const handleConfirmUpload = () => {
    if (pendingFiles.length > 0 && roomInfo) {
      const isFestivalChat = roomId === "1";
      mixpanelTrack.chatMessageSent(
        roomId ?? "",
        roomInfo.anonymous,
        true,
        isFestivalChat,
      );

      sendMessage("", roomInfo.anonymous, pendingFiles);
      setPendingFiles([]);
      setIsUploadModalOpen(false);
    }
  };

  const handleCancelUpload = () => {
    setPendingFiles([]);
    setIsUploadModalOpen(false);
  };

  const formatDateLine = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });

  const isSameDate = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  if (isLoading) {
    return <div>채팅 내역을 가져오고 있습니다...</div>;
  }

  // if (error) {
  //   return <div>{error}</div>; // 이 부분은 위의 useEffect로 대체
  // }

  return (
    <ChatPageWrapper>
      {roomInfo && (
        <RoomInfoBanner>
          <Users size={16} color="#767676" />
          <span>
            참여 인원 {roomInfo.currentParticipants}명 / 최대{" "}
            {roomInfo.maxCapacity}명
          </span>
        </RoomInfoBanner>
      )}

      <ChattingWrapper ref={scrollRef}>
        {/* column-reverse를 위해 메시지를 역순으로 렌더링 */}
        {reversedMessages.map((msg, index) => {
          const originalIndex = messages.length - 1 - index;
          const showDateLine =
            originalIndex === 0 ||
            !isSameDate(messages[originalIndex - 1].createDate, msg.createDate);
          const isMe = msg.senderHash === myHash;

          return (
            <React.Fragment key={msg.messageId || `msg-${originalIndex}`}>
              {isMe ? (
                <ChatItemMy message={msg} onImageClick={handleImageClick} />
              ) : (
                <ChatItemOtherPerson
                  message={msg}
                  onImageClick={handleImageClick}
                  userImageUrl={null}
                />
              )}
              {showDateLine && (
                <DateDivider>{formatDateLine(msg.createDate)}</DateDivider>
              )}
            </React.Fragment>
          );
        })}
        {isFetchingPrevious && (
          <LoadingWrapper>
            <Loader2 size={20} color="#5E92F0" />
          </LoadingWrapper>
        )}
      </ChattingWrapper>

      <FixedInputArea>
        <div className="input-wrapper">
          <label htmlFor="image-upload">
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            <IconButton as="span">
              <Image size={24} color="#767676" />
            </IconButton>
          </label>

          <Input
            placeholder="메시지 입력"
            ref={inputRef}
            onInput={handleInput}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                if (e.nativeEvent.isComposing) return;
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <SendButton
            onClick={handleSendMessage}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Send size={24} color="#5E92F0" />
          </SendButton>
        </div>
      </FixedInputArea>

      <ImageModal
        imageUrl={selectedImageUrl}
        isOpen={isImageModalOpen}
        onOpenChange={setIsImageModalOpen}
      />

      <ImageUploadModal
        files={pendingFiles}
        isOpen={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onSend={handleConfirmUpload}
        onCancel={handleCancelUpload}
      />

      <MemberListDrawer
        roomId={roomId ?? ""}
        isOpen={isMemberListOpen}
        onOpenChange={setIsMemberListOpen}
        roomInfo={roomInfo} // roomInfo 전달
        refreshRoom={refreshRoom}
      />
    </ChatPageWrapper>
  );
}

const ChatPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  /* 헤더 높이(약 76px)를 제외한 나머지 영역이 Visual Viewport 내에 들어오도록 설정 */
  height: calc(var(--visual-viewport-height, 100dvh) - 76px);
  overflow: hidden;
  position: fixed;
  /* iOS에서 뷰포트가 밀릴 경우 offset-top만큼 보정하여 헤더 위치 사수 */
  top: calc(76px + var(--visual-viewport-offset-top, 0px));
  left: 0;
  right: 0;
  background-color: #ffffff;
  overscroll-behavior: none;
`;

const HeaderRightArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RoomInfoBanner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 12px;
  //background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  font-size: 13px;
  font-weight: 500;
  color: #767676;
  flex-shrink: 0;
`;

const ChattingWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column-reverse;
  overflow-y: auto;
  //padding-bottom: 64px;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #d1d1d1;
    border-radius: 2px;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  svg {
    animation: spin 1s linear infinite;
  }
`;

const FixedInputArea = styled.div`
  background-color: #ffffff;
  border-top: 1px solid #eaeaea;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
  flex-shrink: 0;

  .input-wrapper {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    gap: 8px;
    min-height: 64px;
    box-sizing: border-box;
  }
`;

const Input = styled.textarea`
  flex: 1;
  min-width: 0;
  padding: 8px 16px;
  box-sizing: border-box;
  background: #eff2f9;
  border-radius: 20px;
  border: none;
  font-size: 16px;
  line-height: 24px;
  color: #1c1c1e;
  resize: none;
  outline: none;
  max-height: 96px;
`;

const SendButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 4px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 4px;
`;

const DateDivider = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 24px 0 16px 0;
  font-size: 12px;
  font-weight: 500;
  color: #767676;
`;

const MessageContainer = styled.div`
  display: flex;
  margin: 0 16px 12px;
`;

const ProfileImage = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const SenderName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #1c1c1e;
  margin-bottom: 4px;
`;

const MessageBubble = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
`;

const Bubble = styled.div<{ $bgColor: string }>`
  padding: 10px 14px;
  border-radius: 20px;
  font-size: 16px;
  line-height: 22px;
  max-width: 240px;
  word-break: break-word;
  background-color: ${(props) => props.$bgColor};
  color: #1c1c1e;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  white-space: pre-wrap;
`;

const ImageThumbnail = styled.img`
  width: 50vw;
  height: auto;
  min-width: 100px;
  min-height: 150px;
  background: gray;
  border-radius: 12px;
  cursor: pointer;
  object-fit: cover;
  margin-bottom: 4px;

  @media (min-width: 1024px) {
    width: 30vw;
  }
`;

const Time = styled.span`
  font-size: 12px;
  color: #767676;
  white-space: nowrap;
`;

const ChatItemOtherPerson = ({
  message,
  onImageClick,
  userImageUrl,
}: {
  message: ChatMessage;
  onImageClick: (url: string) => void;
  userImageUrl: string | null;
}) => {
  const thumbnailUrl =
    message.imageCount > 0
      ? `${BASE_URL}images/chat/${message.roomId}/thumbnail/${message.messageId}`
      : undefined;
  const originalImageUrl =
    message.imageCount > 0
      ? `${BASE_URL}images/chat/${message.roomId}/${message.messageId}-1`
      : undefined;

  const time = new Date(message.createDate).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const bgColor = getMessageColor(message.senderHash);

  return (
    <MessageContainer>
      {userImageUrl && <ProfileImage src={userImageUrl} alt="profile" />}
      <MessageContent>
        <SenderName>{message.senderAlias || message.senderNickname}</SenderName>
        <MessageBubble>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            {thumbnailUrl && (
              <ImageThumbnail
                src={thumbnailUrl}
                alt="이미지"
                onClick={() =>
                  originalImageUrl && onImageClick(originalImageUrl)
                }
              />
            )}
            {message.content && (
              <Bubble $bgColor={bgColor}>{message.content}</Bubble>
            )}
          </div>
          <TimeArea>
            {message.unreadCount > 0 && (
              <UnreadCount>{message.unreadCount}</UnreadCount>
            )}
            <Time>{time}</Time>
          </TimeArea>
        </MessageBubble>
      </MessageContent>
    </MessageContainer>
  );
};

const ChatItemMy = ({
  message,
  onImageClick,
}: {
  message: ChatMessage;
  onImageClick: (url: string) => void;
}) => {
  const thumbnailUrl =
    message.imageCount > 0
      ? `${BASE_URL}images/chat/${message.roomId}/thumbnail/${message.messageId}`
      : undefined;
  const originalImageUrl =
    message.imageCount > 0
      ? `${BASE_URL}images/chat/${message.roomId}/${message.messageId}-1`
      : undefined;

  const time = new Date(message.createDate).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const bgColor = getMessageColor(message.senderHash);

  return (
    <MyMessageContainer>
      <MyMessageContent>
        <MySenderName>{message.senderAlias || message.senderNickname}</MySenderName>
        <MessageBubble>
          <TimeArea style={{ alignItems: "flex-end" }}>
            {message.unreadCount > 0 && (
              <UnreadCount>{message.unreadCount}</UnreadCount>
            )}
            <Time>{time}</Time>
          </TimeArea>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            {thumbnailUrl && (
              <ImageThumbnail
                src={thumbnailUrl}
                alt="이미지"
                onClick={() =>
                  originalImageUrl && onImageClick(originalImageUrl)
                }
              />
            )}
            {message.content && (
              <Bubble $bgColor={bgColor}>{message.content}</Bubble>
            )}
          </div>
        </MessageBubble>
      </MyMessageContent>
    </MyMessageContainer>
  );
};

const TimeArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UnreadCount = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #5e92f0;
`;

const MyMessageContent = styled(MessageContent)`
  align-items: flex-end;
`;

const MySenderName = styled(SenderName)`
  text-align: right;
  //margin-right: 4px;
`;

const MyMessageContainer = styled(MessageContainer)`
  flex-direction: row-reverse;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  width: 100%;

  .text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const OfficialTag = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: #ffffff;
  background: #1c1c1e;
  padding: 1px 4px;
  border-radius: 4px;
  flex-shrink: 0;
`;
