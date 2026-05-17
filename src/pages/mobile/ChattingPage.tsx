import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate import 추가
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { Send, Users, Loader2, Image, ArrowDown } from "lucide-react";
import { useHeader } from "@/context/HeaderContext";
import { useVisualViewport } from "@/hooks/useVisualViewport";
import ImageModal from "@/components/mobile/chat/ImageModal";
import ImageUploadModal from "@/components/mobile/chat/ImageUploadModal";
import MemberListDrawer from "@/components/mobile/chat/MemberListDrawer";
import { ChatMessage } from "@/types/chat";
import { mixpanelTrack, trackPageView } from "@/utils/mixpanel";
import Skeleton from "@/components/common/Skeleton";
import UserProfileModal from "@/components/mobile/social/UserProfileModal";

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

import { updateChatRoomTitle, getChatRoomMembers } from "@/apis/chat";
import useUserStore from "@/stores/useUserStore";
import { ROUTES } from "@/constants/routes";
import EditChatRoomTitleModal from "@/components/mobile/chat/EditChatRoomTitleModal";
import { useQuery } from "@tanstack/react-query";
import { ChatRoomMemberResponseDto } from "@/types/chat";

interface UploadingMessage {
  tempId: string;
  previewUrl: string;
  progress: number;
}

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
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [activeImageMeta, setActiveImageMeta] = useState<{ senderName: string; createDate: string; senderId?: number | null } | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showNewMessageBanner, setShowNewMessageBanner] = useState(false);
  const lastMessageCountRef = useRef<number>(0);
  const [uploadingImages, setUploadingImages] = useState<UploadingMessage[]>([]);

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

  // 실시간 메시지 연동으로 이미지 업로드 완료 시 프리뷰 클린업 및 Blob URL 자원 회수
  useEffect(() => {
    if (messages.length > 0 && uploadingImages.length > 0) {
      uploadingImages.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
      setUploadingImages([]);
    }
  }, [messages]);

  // 컴포넌트 언마운트 시 메모리 누수 방지를 위한 일괄 해제
  useEffect(() => {
    return () => {
      uploadingImages.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [uploadingImages]);

  const { data: membersRes } = useQuery({
    queryKey: ["chatMembers", roomId],
    queryFn: () => getChatRoomMembers(roomId ?? ""),
    enabled: !!roomId,
  });
  const members = membersRes?.data || [];

  useVisualViewport();

  const handleUpdateTitle = () => {
    if (roomInfo?.isOfficial) {
      alert("공식 채팅방의 이름은 변경할 수 없습니다.");
      return;
    }

    // 오픈채팅인 경우 방장 또는 어드민만 가능
    if (roomInfo?.type === "OPEN" && !roomInfo.owner && !isAdmin) {
      alert("오픈채팅방 이름은 방장 또는 관리자만 변경할 수 있습니다.");
      return;
    }

    setIsTitleModalOpen(true);
  };

  const handleConfirmTitleUpdate = async (newTitle: string) => {
    try {
      mixpanelTrack.chatRoomMenuClicked("채팅방 이름 변경", roomId ?? "");
      await updateChatRoomTitle(Number(roomId), newTitle);
      refreshRoom();
    } catch (err: any) {
      const errorMsg = err.response?.data?.msg || "방 이름 변경에 실패했습니다.";
      alert(errorMsg);
      throw err;
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
    if (!el) return;

    // 사용자가 직접 최하단 근처로 스크롤하면 알림 배너를 자연스럽게 숨김
    if (Math.abs(el.scrollTop) < 30) {
      setShowNewMessageBanner(false);
    }

    if (
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

  // 데이터 업데이트 후 위치 보정 및 새 메시지 바닥 정렬 & 알림 노출
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || isFetchingPrevious) return;

    // 이전 메시지 로드 완료 후 위치 복원
    if (scrollHeightRef.current > 0) {
      scrollEl.scrollTop = lastScrollTopRef.current;
      scrollHeightRef.current = 0;
      return;
    }

    // 신규 실시간 메시지 발신/수신 타임라인 감지
    const currentCount = messages.length;
    if (currentCount > lastMessageCountRef.current && lastMessageCountRef.current > 0) {
      const isNearBottom = Math.abs(scrollEl.scrollTop) < 50;
      if (isNearBottom) {
        scrollEl.scrollTop = 0;
        requestAnimationFrame(() => {
          scrollEl.scrollTop = 0;
        });
        setShowNewMessageBanner(false);
      } else {
        // 이전 기록을 읽기 위해 스크롤을 올린 상태면
        // 스크롤 위치를 보존하고 알림 배너 노출
        setShowNewMessageBanner(true);
      }
    }

    lastMessageCountRef.current = currentCount;
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

    // 본인이 메시지를 직접 보낸 것이므로 즉시 스크롤을 최하단으로 정렬
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  const handleScrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setShowNewMessageBanner(false);
    }
  };

  const handleImageClick = (
    url: string,
    senderName: string,
    createDate: string,
    senderId?: number | null
  ) => {
    mixpanelTrack.chatRoomMenuClicked("이미지 크게 보기", roomId ?? "");
    setSelectedImageUrl(url);

    // 백엔드 소켓/조회 응답에서 senderId가 null로 올 경우, React Query 캐시의 멤버 목록에서 닉네임/별칭 매칭하여 복원
    let resolvedId = senderId;
    if (!resolvedId && senderName) {
      const matched = members.find(
        (m: ChatRoomMemberResponseDto) => m.nickname === senderName || m.friendAlias === senderName
      );
      resolvedId = matched?.memberId ?? null;
    }

    // 본인 발송 메시지의 경우, 글로벌 UserStore의 userInfo.id를 최종 폴백으로 삼아 100% 매칭 보장
    if (!resolvedId && (senderName === "나" || senderName === userInfo?.nickname)) {
      resolvedId = userInfo?.id ?? null;
    }

    setActiveImageMeta({ senderName, createDate, senderId: resolvedId });
    setIsImageModalOpen(true);
    window.history.pushState({ modal: "image" }, "");
  };

  const handleOpenProfileFromImage = (senderId: number) => {
    setSelectedMemberId(senderId);
    setIsProfileModalOpen(true);
  };

  const handleImageModalOpenChange = (open: boolean) => {
    if (!open) {
      setIsImageModalOpen(false);
      if (window.history.state?.modal === "image") {
        window.history.back();
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (isImageModalOpen) {
        setIsImageModalOpen(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isImageModalOpen]);

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

      // 1. 임시 ID 생성 및 로컬 이미지 프리뷰 URL(Blob URL) 확보
      const tempId = `upload-${Date.now()}`;
      const previewUrl = URL.createObjectURL(pendingFiles[0]);

      // 2. 프리뷰 상태 리스트에 등록
      setUploadingImages((prev) => [...prev, { tempId, previewUrl, progress: 0 }]);

      // 3. 업로드 프로그레스 콜백 연동하여 전송 시작
      sendMessage(
        "",
        roomInfo.anonymous,
        pendingFiles,
        (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadingImages((prev) =>
              prev.map((item) =>
                item.tempId === tempId ? { ...item, progress: percent } : item
              )
            );
          }
        }
      );

      setPendingFiles([]);
      setIsUploadModalOpen(false);

      // 이미지 전송 완료 시 즉시 바닥으로 스냅
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
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
    return (
      <ChatPageWrapper>
        <ChattingWrapper style={{ flexDirection: "column" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                margin: "12px 16px",
                display: "flex",
                flexDirection: i % 2 === 0 ? "row-reverse" : "row",
                gap: "12px",
              }}
            >
              <Skeleton width="36px" height="36px" circle />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  alignItems: i % 2 === 0 ? "flex-end" : "flex-start",
                }}
              >
                {i % 2 !== 0 && <Skeleton width="60px" height="14px" />}
                <Skeleton
                  width={i % 3 === 0 ? "180px" : i % 2 === 0 ? "140px" : "100px"}
                  height="36px"
                  style={{
                    borderRadius: i % 2 === 0 ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                  }}
                />
              </div>
            </div>
          ))}
        </ChattingWrapper>
      </ChatPageWrapper>
    );
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
        {/* [우아한 프리뷰 우선 배치] column-reverse 특성 상 맨 위에 선언해야 시각적 최하단(최신)에 배치됩니다. */}
        {uploadingImages.map((upload) => (
          <UploadingPreviewItem key={upload.tempId}>
            <PreviewContainer>
              <PreviewImage src={upload.previewUrl} alt="업로드 중 프리뷰" />
              <ProgressOverlay>
                <ProgressGlassRing progress={upload.progress}>
                  <span className="percentage">{upload.progress}%</span>
                </ProgressGlassRing>
              </ProgressOverlay>
            </PreviewContainer>
          </UploadingPreviewItem>
        ))}

        {/* column-reverse를 위해 메시지를 역순으로 렌더링 */}
        {reversedMessages.map((msg, index) => {
          const originalIndex = messages.length - 1 - index;
          const prevMsg =
            originalIndex > 0 ? messages[originalIndex - 1] : null;
          const nextMsg =
            originalIndex < messages.length - 1
              ? messages[originalIndex + 1]
              : null;

          const showDateLine =
            !prevMsg || !isSameDate(prevMsg.createDate, msg.createDate);

          const isMe = msg.senderHash === myHash;

          // 사용자가 같으면 연속된 메시지로 판단
          const isConsecutive =
            prevMsg && prevMsg.senderHash === msg.senderHash;

          // 상단 메시지에만 이름 표시 (연속된 경우 숨김)
          // 단, 날짜 구분선이 있으면 무조건 표시
          const showName = !isConsecutive || showDateLine;

          // 마지막 메시지에만 시간 표시 (연속된 경우 숨김)
          // 분 단위와 상관없이 묶음의 마지막에만 표시하도록 통일
          const showTime =
            !nextMsg ||
            nextMsg.senderHash !== msg.senderHash ||
            !isSameDate(msg.createDate, nextMsg.createDate);

          return (
            <React.Fragment key={msg.messageId || `msg-${originalIndex}`}>
              {isMe ? (
                <ChatItemMy
                  message={msg}
                  onImageClick={handleImageClick}
                  showTime={showTime}
                  members={members}
                />
              ) : (
                <ChatItemOtherPerson
                  message={msg}
                  onImageClick={handleImageClick}
                  userImageUrl={null}
                  showName={showName}
                  showTime={showTime}
                  members={members}
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

      {showNewMessageBanner && (
        <NewMessageBanner onClick={handleScrollToBottom}>
          <span>새로운 메시지</span>
          <ArrowDown size={14} color="#FFFFFF" strokeWidth={3} />
        </NewMessageBanner>
      )}

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
            onFocus={() => {
              // iOS 가상 키보드가 완전히 열릴 때까지 대기 후 스크롤 하단 자동 고정
              setTimeout(() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollTop = 0;
                }
              }, 200);
            }}
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
        onOpenChange={handleImageModalOpenChange}
        senderName={activeImageMeta?.senderName}
        createDate={activeImageMeta?.createDate}
        senderId={activeImageMeta?.senderId}
        onSenderClick={handleOpenProfileFromImage}
      />

      <UserProfileModal
        memberId={selectedMemberId}
        isOpen={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        roomContext={
          roomInfo
            ? {
              roomId: roomId ?? "",
              chatType: roomInfo.type,
              isOwner: roomInfo.owner,
              participantCount: roomInfo.currentParticipants,
            }
            : undefined
        }
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

      <EditChatRoomTitleModal
        isOpen={isTitleModalOpen}
        onOpenChange={setIsTitleModalOpen}
        currentTitle={roomInfo?.title || ""}
        onConfirm={handleConfirmTitleUpdate}
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

  /* iOS 하드웨어 가속 모멘텀 스크롤 활성화 */
  -webkit-overflow-scrolling: touch;
  will-change: scroll-position;
  contain: content;

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
  margin: 0 16px 8px;
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
  showName,
  showTime,
  members,
}: {
  message: ChatMessage;
  onImageClick: (
    url: string,
    senderName: string,
    createDate: string,
    senderId?: number | null
  ) => void;
  userImageUrl: string | null;
  showName: boolean;
  showTime: boolean;
  members: ChatRoomMemberResponseDto[];
}) => {
  const getDisplayName = () => {
    const matched = members.find((m: ChatRoomMemberResponseDto) => m.nickname === message.senderNickname);
    return matched?.friendAlias || message.senderAlias || message.senderNickname;
  };
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
        {showName && (
          <SenderName>
            {getDisplayName()}
          </SenderName>
        )}
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
                  originalImageUrl &&
                  onImageClick(
                    originalImageUrl,
                    getDisplayName() || "알 수 없음",
                    message.createDate,
                    message.senderId
                  )
                }
              />
            )}
            {message.content && (
              <Bubble $bgColor={bgColor}>{message.content}</Bubble>
            )}
          </div>
          {(message.unreadCount > 0 || showTime) && (
            <TimeArea>
              {message.unreadCount > 0 && (
                <UnreadCount>{message.unreadCount}</UnreadCount>
              )}
              {showTime && <Time>{time}</Time>}
            </TimeArea>
          )}
        </MessageBubble>
      </MessageContent>
    </MessageContainer>
  );
};

const ChatItemMy = ({
  message,
  onImageClick,
  showTime,
  members,
}: {
  message: ChatMessage;
  onImageClick: (
    url: string,
    senderName: string,
    createDate: string,
    senderId?: number | null
  ) => void;
  showTime: boolean;
  members: ChatRoomMemberResponseDto[];
}) => {
  const getDisplayName = () => {
    const matched = members.find((m: ChatRoomMemberResponseDto) => m.nickname === message.senderNickname);
    return matched?.friendAlias || message.senderAlias || message.senderNickname;
  };
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
        <MessageBubble>
          {(message.unreadCount > 0 || showTime) && (
            <TimeArea style={{ alignItems: "flex-end" }}>
              {message.unreadCount > 0 && (
                <UnreadCount>{message.unreadCount}</UnreadCount>
              )}
              {showTime && <Time>{time}</Time>}
            </TimeArea>
          )}
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
                  originalImageUrl &&
                  onImageClick(
                    originalImageUrl,
                    getDisplayName() || "나",
                    message.createDate,
                    message.senderId
                  )
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

const NewMessageBanner = styled.div`
  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, 8px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }

  position: absolute;
  bottom: 80px; /* FixedInputArea 위에 부드럽게 플로팅 */
  left: 50%;
  transform: translateX(-50%);
  z-index: 99;
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #5e92f0;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(94, 146, 240, 0.3);
  cursor: pointer;
  animation: fadeIn 200ms ease-out forwards;
  
  &:active {
    background-color: #4b81e0;
  }
`;

const UploadingPreviewItem = styled.div`
  @keyframes previewFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  display: flex;
  justify-content: flex-end; /* 내가 보낸 메시지이므로 우측 정렬 */
  padding: 8px 16px;
  box-sizing: border-box;
  animation: previewFadeIn 200ms ease-out forwards;
`;

const PreviewContainer = styled.div`
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f0f0f0;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.6) blur(1px); /* 전송 중 느낌을 주기 위한 차분한 어두움과 블러 */
  transition: filter 300ms ease;
`;

const ProgressOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
`;

const ProgressGlassRing = styled.div<{ progress: number }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;

  /* padding-box(내부)와 border-box(테두리)를 분리하여 테두리에 실제 진행률 conic-gradient 적용 */
  background: 
    linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.15)) padding-box,
    conic-gradient(#5e92f0 0% ${props => props.progress}%, rgba(255, 255, 255, 0.35) ${props => props.progress}% 100%) border-box;

  border: 3px solid transparent; /* 테두리 두께 설정 */
  backdrop-filter: blur(8px); /* 고급스러운 글래스모피즘 효과 */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  position: relative;
  transition: background 150ms linear;
  
  .percentage {
    color: #ffffff;
    font-size: 13px;
    font-weight: 800;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  }
`;
