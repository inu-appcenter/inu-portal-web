import styled from "styled-components";
import { useParams } from "react-router-dom";
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { Send, Users, Loader2, Image } from "lucide-react";
import { useHeader } from "@/context/HeaderContext";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import ImageModal from "@/components/mobile/chat/ImageModal";
import { ChatMessage } from "@/types/chat";
import { mixpanelTrack, trackPageView } from "@/utils/mixpanel";

// 이미지 리소스 임포트
import checkedCheckbox from "@/resources/assets/posts/checked-checkbox.svg";
import uncheckedCheckbox from "@/resources/assets/posts/unchecked-checkbox.svg";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 축제 로고에서 추출한 파스텔 팔레트
const PASTEL_COLORS = [
  "#FFF4BD", // 파스텔 노랑
  "#E2F0D9", // 파스텔 초록
  "#FFD9D9", // 파스텔 빨강
  "#D9EFFF", // 파스텔 파랑
  "#EADBFF", // 파스텔 보라
  "#FFE5D0", // 파스텔 주황
];

// 메시지 ID를 기반으로 고유 색상을 반환하는 함수
const getMessageColor = (messageId: number | string) => {
  const idStr = String(messageId);
  const lastChar = idStr.charAt(idStr.length - 1);
  const index = isNaN(parseInt(lastChar)) ? 0 : parseInt(lastChar);
  return PASTEL_COLORS[index % PASTEL_COLORS.length];
};

export default function ChattingPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [inputValue, setInputValue] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

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
  } = useChat(roomId ?? "");

  useHeader({
    title: roomInfo ? roomInfo.title : "채팅방",
  });

  useEffect(() => {
    if (roomInfo) {
      if (!roomInfo.anonymous) {
        setIsAnonymous(false);
      }
    }
  }, [roomInfo]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollHeightRef = useRef<number>(0);
  const [intersectionRoot, setIntersectionRoot] = useState<Element | null>(
    null,
  );

  useEffect(() => {
    if (scrollRef.current) {
      setIntersectionRoot(scrollRef.current);
    }
  }, []);

  const entry = useIntersectionObserver(sentinelRef, {
    threshold: 0,
    root: intersectionRoot,
    freezeOnceVisible: false,
  });

  useEffect(() => {
    if (
      !isLoading &&
      entry?.isIntersecting &&
      hasMore &&
      !isFetchingPrevious &&
      messages.length > 0
    ) {
      fetchPreviousMessages();
    }
  }, [
    entry?.isIntersecting,
    hasMore,
    isFetchingPrevious,
    fetchPreviousMessages,
    messages.length,
    isLoading,
  ]);

  useLayoutEffect(() => {
    if (isFetchingPrevious && scrollRef.current) {
      scrollHeightRef.current = scrollRef.current.scrollHeight;
    }
  }, [isFetchingPrevious]);

  useEffect(() => {
    if (!scrollRef.current) return;

    if (!isFetchingPrevious && scrollHeightRef.current > 0) {
      const delta = scrollRef.current.scrollHeight - scrollHeightRef.current;
      if (delta > 0) {
        scrollRef.current.scrollTop = delta;
      }
      scrollHeightRef.current = 0;
      return;
    }

    if (!isFetchingPrevious) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
    if (!inputValue.trim()) return;

    const isFestivalChat = roomId === "1";
    mixpanelTrack.chatMessageSent(
      roomId ?? "",
      isAnonymous,
      false,
      isFestivalChat,
    );

    sendMessage(inputValue.trim(), isAnonymous);
    setInputValue("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const handleImageClick = (url: string) => {
    setSelectedImageUrl(url);
    setIsImageModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      const isFestivalChat = roomId === "1";
      mixpanelTrack.chatMessageSent(
        roomId ?? "",
        isAnonymous,
        true,
        isFestivalChat,
      );

      sendMessage("", isAnonymous, files);
      e.target.value = "";
    }
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

  if (error) {
    return <div>{error}</div>;
  }

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
        <Sentinel ref={sentinelRef} />
        {isFetchingPrevious && (
          <LoadingWrapper>
            <Loader2 size={20} color="#5844E4" />
          </LoadingWrapper>
        )}
        {messages.map((msg, index) => {
          const showDateLine =
            index === 0 ||
            !isSameDate(messages[index - 1].createDate, msg.createDate);
          const isMe = msg.senderHash === myHash;

          return (
            <React.Fragment key={msg.messageId || `msg-${index}`}>
              {showDateLine && (
                <DateDivider>{formatDateLine(msg.createDate)}</DateDivider>
              )}
              {isMe ? (
                <ChatItemMy message={msg} onImageClick={handleImageClick} />
              ) : (
                <ChatItemOtherPerson
                  message={msg}
                  onImageClick={handleImageClick}
                  userImageUrl={null}
                />
              )}
            </React.Fragment>
          );
        })}
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

          <AnonymousToggle
            $disabled={!roomInfo?.anonymous}
            onClick={() => {
              if (roomInfo?.anonymous) {
                setIsAnonymous(!isAnonymous);
              }
            }}
          >
            <img
              src={isAnonymous ? checkedCheckbox : uncheckedCheckbox}
              alt="익명 체크박스"
            />
            <span>익명</span>
          </AnonymousToggle>

          <Input
            placeholder="메시지 입력"
            ref={inputRef}
            onInput={handleInput}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <SendButton onClick={handleSendMessage}>
            <Send size={24} color="#5844E4" />
          </SendButton>
        </div>
      </FixedInputArea>

      <ImageModal
        imageUrl={selectedImageUrl}
        isOpen={isImageModalOpen}
        onOpenChange={setIsImageModalOpen}
      />
    </ChatPageWrapper>
  );
}

const ChatPageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const RoomInfoBanner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  font-size: 13px;
  font-weight: 500;
  color: #767676;
  flex-shrink: 0;
`;

const ChattingWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 64px;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #d1d1d1;
    border-radius: 2px;
  }
`;

const Sentinel = styled.div`
  height: 1px;
  width: 100%;
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
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border-top: 1px solid #eaeaea;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);

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

const AnonymousToggle = styled.div<{ $disabled?: boolean }>`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  user-select: none;
  img {
    width: 18px;
    height: 18px;
  }
  span {
    font-size: 13px;
    color: #9fa3a6;
  }
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

// 파스텔톤 배경색과 그림자가 적용된 말풍선
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

  const bgColor = getMessageColor(message.messageId);

  return (
    <MessageContainer>
      {userImageUrl && <ProfileImage src={userImageUrl} alt="profile" />}
      <MessageContent>
        <SenderName>{message.senderNickname}</SenderName>
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
          <Time>{time}</Time>
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

  const bgColor = getMessageColor(message.messageId);

  return (
    <MyMessageContainer>
      <MessageBubble>
        <Time>{time}</Time>
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
              onClick={() => originalImageUrl && onImageClick(originalImageUrl)}
            />
          )}
          {message.content && (
            <Bubble $bgColor={bgColor}>{message.content}</Bubble>
          )}
        </div>
      </MessageBubble>
    </MyMessageContainer>
  );
};

const MyMessageContainer = styled(MessageContainer)`
  justify-content: flex-end;
`;
