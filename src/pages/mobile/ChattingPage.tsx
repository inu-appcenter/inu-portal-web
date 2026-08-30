import styled from "styled-components";
import { useParams, useNavigate, useSearchParams } from "react-router-dom"; // useNavigate import 추가
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { Send, Users, Loader2, ArrowDown, Plus, X } from "lucide-react";
import { useHeader } from "@/context/HeaderContext";
import { useVisualViewport } from "@/hooks/useVisualViewport";
import ImageModal from "@/components/mobile/chat/ImageModal";
import ImageUploadModal from "@/components/mobile/chat/ImageUploadModal";
import MemberListDrawer from "@/components/mobile/chat/MemberListDrawer";
import TimetableShareCard from "@/components/mobile/chat/TimetableShareCard";
import ChatItemBot from "@/components/mobile/chat/ChatItemBot";
import ChatSlashCommandPopup from "@/components/mobile/chat/ChatSlashCommandPopup";
import ChatPlusMenu from "@/components/mobile/chat/ChatPlusMenu";
import TorchAiLogo from "@/resources/assets/ai/횃불이AI로고.svg";
import { ChatMessage } from "@/types/chat";
import { mixpanelTrack, trackPageView } from "@/utils/mixpanel";
import {
  buildProfanityAlertMessage,
  checkProfanity,
} from "@/utils/profanityFilter";
import { isChatbuliCommand } from "@/utils/hangul";
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
import useChatModeration from "@/hooks/useChatModeration";

interface UploadingMessage {
  tempId: string;
  previewUrl: string;
  progress: number;
}

const LONG_PRESS_MS = 450;

/**
 * 메시지 길게 누르기 제스처.
 *
 * 채팅 메시지의 신고/차단/숨기기 시트를 여는 진입점이다 — 말풍선에 버튼을
 * 붙이면 대화 화면이 지저분해지므로, 메신저 앱의 관례대로 롱프레스로 연다.
 * (App Store 가이드라인 1.2 대응)
 */
function useLongPress(onLongPress: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  const clear = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clear, [clear]);

  return {
    onPointerDown: () => {
      firedRef.current = false;
      clear();
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        onLongPress();
      }, LONG_PRESS_MS);
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    // 롱프레스로 시트를 연 뒤 따라오는 click(이미지 확대 등)은 삼킨다.
    onClickCapture: (event: React.MouseEvent) => {
      if (firedRef.current) {
        event.preventDefault();
        event.stopPropagation();
        firedRef.current = false;
      }
    },
    // iOS WebView의 기본 길게누르기 메뉴(복사/공유)가 시트를 가리지 않게 한다.
    onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
  };
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
  const [activeImageMeta, setActiveImageMeta] = useState<{
    senderName: string;
    createDate: string;
    senderChatRoomMemberId?: number | null;
  } | null>(null);
  const [selectedChatRoomMemberId, setSelectedChatRoomMemberId] = useState<
    number | null
  >(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showNewMessageBanner, setShowNewMessageBanner] = useState(false);
  const lastMessageCountRef = useRef<number>(0);
  const [uploadingImages, setUploadingImages] = useState<UploadingMessage[]>(
    [],
  );
  const [isChatbuliMode, setIsChatbuliMode] = useState<boolean>(false);
  const [isSlashPopupOpen, setIsSlashPopupOpen] = useState<boolean>(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    trackPageView("채팅방", { room_id: roomId });
  }, [roomId]);

  const {
    messages,
    setMessages,
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
  } = useChat(roomId ?? "");

  // 채팅 메시지 신고/차단/숨기기 (App Store 가이드라인 1.2 — UGC).
  // 메시지를 길게 누르면 시트가 열린다.
  const chatModeration = useChatModeration();

  const handleMessageLongPress = React.useCallback(
    (message: ChatMessage, isMine: boolean) => {
      if (!roomId || !message.messageId) return;
      chatModeration.openFor({
        roomId,
        messageId: message.messageId,
        senderNickname:
          message.senderAlias || message.senderNickname || "알 수 없음",
        senderChatRoomMemberId: message.senderChatRoomMemberId,
        content: message.content,
        isMine,
      });
    },
    [roomId, chatModeration.openFor],
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const sharePayloadParam = searchParams.get("sharePayload");
  const hasAutoSentShare = useRef(false);

  useEffect(() => {
    if (
      sharePayloadParam &&
      roomInfo &&
      isStompConnected &&
      !hasAutoSentShare.current
    ) {
      try {
        const decodedPayload = decodeURIComponent(sharePayloadParam);
        const isSent = sendMessage(
          "시간표 겹쳐보기 & 공강 공유",
          roomInfo.anonymous,
          [],
          undefined,
          "TIMETABLE_SHARE",
          decodedPayload,
        );
        if (isSent) {
          hasAutoSentShare.current = true;
          const newParams = new URLSearchParams(searchParams);
          newParams.delete("sharePayload");
          setSearchParams(newParams, { replace: true });
        }
      } catch (e) {
        console.error("공유 메시지 자동 발송 실패:", e);
      }
    }
  }, [
    sharePayloadParam,
    roomInfo,
    isStompConnected,
    sendMessage,
    searchParams,
    setSearchParams,
  ]);

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

  const handleFindFreeTime = () => {
    mixpanelTrack.chatRoomMenuClicked("공강 맞추기", roomId ?? "");
    const params = new URLSearchParams();
    params.set("tab", "free");
    if (roomId) params.set("roomId", roomId);
    navigate(`${ROUTES.TIMETABLE.COMPARE}?${params.toString()}`);
  };

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
      const errorMsg =
        err.response?.data?.msg || "방 이름 변경에 실패했습니다.";
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

  const isGroupChat = roomInfo
    ? roomInfo.type === "OPEN" || roomInfo.currentParticipants > 2
    : false;

  const headerTitle = React.useMemo(() => {
    if (!roomInfo) return "채팅방";
    const titleText = roomInfo.friendAlias || roomInfo.title;
    const countText = isGroupChat ? ` (${roomInfo.currentParticipants})` : "";
    return (
      <TitleWrapper>
        <span className="text">
          {titleText}
          {countText}
        </span>
        {roomInfo.isOfficial && <OfficialTag>공식</OfficialTag>}
      </TitleWrapper>
    );
  }, [roomInfo, isGroupChat]);

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

    if (roomInfo?.type === "PERSONAL" && !roomInfo.anonymous) {
      items.push({
        label: "공강 맞추기",
        onClick: handleFindFreeTime,
      });
    }

    // App Store 가이드라인 1.2 — 신고 수단은 항상 보이는 곳에 있어야 한다.
    // 개별 메시지는 길게 눌러 신고하고, 방 전체는 여기서 신고한다.
    items.push({
      label: "채팅방 신고하기",
      onClick: () =>
        chatModeration.openRoomReport(roomId ?? "", roomInfo?.title ?? "채팅방"),
    });

    return items;
  }, [roomInfo, isAdmin, members, roomId, chatModeration.openRoomReport]);

  useHeader({
    title: headerTitle,
    rightArea: headerRight,
    menuItems: menuItems,
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollHeightRef = useRef<number>(0);
  const lastScrollTopRef = useRef<number>(0);

  // 신고/차단/숨김 처리한 메시지는 서버 검토를 기다리지 않고 즉시 화면에서 뺀다
  // (App Store 가이드라인 1.2 — UGC). 페이지네이션·스크롤 계산은 원본 messages를
  // 그대로 쓰고, 렌더 목록만 걸러낸다.
  const visibleMessages = React.useMemo(
    () => chatModeration.filterHidden(messages),
    [messages, chatModeration.filterHidden],
  );

  // 메시지 역순 메모이제이션
  const reversedMessages = React.useMemo(
    () => [...visibleMessages].reverse(),
    [visibleMessages],
  );

  // 스크롤 이벤트로 이전 메시지 트리거 감지
  const handleScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    // 사용자가 직접 최하단 근처로 스크롤하면 알림 배너를 자연스럽게 숨김
    if (Math.abs(el.scrollTop) < 30) {
      setShowNewMessageBanner(false);
    }

    if (isLoading || isFetchingPrevious || !hasMore || messages.length === 0)
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
    if (
      currentCount > lastMessageCountRef.current &&
      lastMessageCountRef.current > 0
    ) {
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

  const isMobile = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }, []);

  const handleInput = () => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (!isChatbuliMode) {
      if (isChatbuliCommand(val)) {
        setIsSlashPopupOpen(true);
      } else {
        setIsSlashPopupOpen(false);
      }
    }
  };

  const handleEnterChatbuliMode = () => {
    setIsChatbuliMode(true);
    setInputValue("");
    setIsSlashPopupOpen(false);
    setIsPlusMenuOpen(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleExitChatbuliMode = () => {
    setIsChatbuliMode(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 1. 슬래시 명령어 입력 중 공백/엔터 입력 시 챗불이 모드로 확정 전환
    if (!isChatbuliMode && isChatbuliCommand(inputValue)) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleEnterChatbuliMode();
        return;
      }
    }

    // 2. 챗불이 모드에서 빈 입력창일 때 백스페이스 누르면 모드 해제
    if (isChatbuliMode && inputValue === "" && e.key === "Backspace") {
      e.preventDefault();
      handleExitChatbuliMode();
      return;
    }

    // 3. 엔터 키 처리
    if (e.key === "Enter" && !e.shiftKey) {
      if (isMobile) {
        // 모바일 가상 키보드에서는 엔터 누르면 줄바꿈(개행) 유지, 전송은 전송 버튼으로
        return;
      }

      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !roomInfo) return;

    // 욕설·혐오·성적 표현은 전송 전에 차단한다 (커뮤니티 무관용 정책)
    const profanity = checkProfanity(trimmed);
    if (profanity.hasProfanity) {
      alert(buildProfanityAlertMessage(profanity.matched));
      return;
    }

    const isFestivalChat = roomId === "1";
    mixpanelTrack.chatMessageSent(
      roomId ?? "",
      roomInfo.anonymous,
      false,
      isFestivalChat,
    );

    if (isChatbuliMode) {
      const formattedQuestion = `[챗불이에게 질문] ${trimmed}\n[CHATBULI_QUESTION]`;
      const tempQId = `temp-q-${Date.now()}`;
      const tempBotId = `temp-bot-${Date.now()}`;
      const nowIso = new Date().toISOString();

      const questionMsg: ChatMessage = {
        messageId: tempQId,
        roomId: roomId ?? "",
        senderNickname: userInfo?.nickname || "나",
        senderAlias: null,
        senderChatRoomMemberId: 0,
        senderHash: myHash || "",
        content: formattedQuestion,
        imageCount: 0,
        unreadCount: 0,
        messageType: "BOT_QUESTION",
        extraData: null,
        createDate: nowIso,
      };

      const pendingBotMsg: ChatMessage = {
        messageId: tempBotId,
        roomId: roomId ?? "",
        senderNickname: "챗불이",
        senderAlias: null,
        senderChatRoomMemberId: 0,
        senderHash: "BOT_CHATBULI",
        content: "",
        imageCount: 0,
        unreadCount: 0,
        messageType: "BOT_ANSWER",
        extraData: "PENDING",
        createDate: nowIso,
      };

      setMessages((prev) => [...prev, questionMsg, pendingBotMsg]);
      sendMessage(
        formattedQuestion,
        roomInfo.anonymous,
        [],
        undefined,
        "BOT_QUESTION",
      );

      setInputValue("");
      setIsChatbuliMode(false);
      setIsSlashPopupOpen(false);
    } else {
      sendMessage(trimmed, roomInfo.anonymous);
      setInputValue("");
    }

    if (inputRef.current) inputRef.current.style.height = "auto";

    // 본인이 메시지를 직접 보낸 것이므로 즉시 스크롤을 최하단으로 정렬
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
      });
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
    senderChatRoomMemberId?: number | null,
  ) => {
    mixpanelTrack.chatRoomMenuClicked("이미지 크게 보기", roomId ?? "");
    setSelectedImageUrl(url);

    // 백엔드 소켓/조회 응답에서 senderChatRoomMemberId가 null로 올 경우, React Query 캐시의 멤버 목록에서 닉네임/별칭 매칭하여 복원
    let resolvedId = senderChatRoomMemberId;
    if (!resolvedId && senderName) {
      const matched = members.find(
        (m: ChatRoomMemberResponseDto) =>
          m.nickname === senderName || m.friendAlias === senderName,
      );
      resolvedId = matched?.chatRoomMemberId ?? null;
    }

    // 본인 발송 메시지의 경우, 글로벌 UserStore의 userInfo.id를 최종 폴백으로 삼아 100% 매칭 보장
    if (
      !resolvedId &&
      (senderName === "나" || senderName === userInfo?.nickname)
    ) {
      resolvedId = userInfo?.id ?? null;
    }

    setActiveImageMeta({
      senderName,
      createDate,
      senderChatRoomMemberId: resolvedId,
    });
    setIsImageModalOpen(true);
  };

  const handleOpenProfileFromImage = (chatRoomMemberId: number) => {
    setSelectedChatRoomMemberId(chatRoomMemberId);
    setIsProfileModalOpen(true);
  };

  const handleImageModalOpenChange = (open: boolean) => {
    setIsImageModalOpen(open);
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

      // 1. 임시 ID 생성 및 로컬 이미지 프리뷰 URL(Blob URL) 확보
      const tempId = `upload-${Date.now()}`;
      const previewUrl = URL.createObjectURL(pendingFiles[0]);

      // 2. 프리뷰 상태 리스트에 등록
      setUploadingImages((prev) => [
        ...prev,
        { tempId, previewUrl, progress: 0 },
      ]);

      // 3. 업로드 프로그레스 콜백 연동하여 전송 시작
      sendMessage("", roomInfo.anonymous, pendingFiles, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadingImages((prev) =>
            prev.map((item) =>
              item.tempId === tempId ? { ...item, progress: percent } : item,
            ),
          );
        }
      });

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
                  width={
                    i % 3 === 0 ? "180px" : i % 2 === 0 ? "140px" : "100px"
                  }
                  height="36px"
                  style={{
                    borderRadius:
                      i % 2 === 0 ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
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
      <ChattingWrapper ref={scrollRef}>
        {/* [우아한 프리뷰 우선 배치] column-reverse 특성 상 맨 위에 선언해야 시각적 최하단(최신)에 배치됩니다. */}
        {uploadingImages.map((upload) => (
          <UploadingPreviewItem key={upload.tempId}>
            <PreviewContainer>
              <PreviewImage src={upload.previewUrl} alt="업로드 중 프리뷰" />
              <ProgressOverlay>
                <ProgressGlassRing>
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    {/* 어두운 반투명 원형 배경 (블러 없이 선명하게 투명화) */}
                    <circle
                      cx="30"
                      cy="30"
                      r="27"
                      fill="rgba(0, 0, 0, 0.18)"
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeWidth="3"
                    />
                    {/* 진행도에 따라 테두리 바깥둘레만 정밀하게 채워지는 서클 */}
                    <circle
                      cx="30"
                      cy="30"
                      r="27"
                      fill="none"
                      stroke="#5e92f0"
                      strokeWidth="3"
                      strokeDasharray={169.646}
                      strokeDashoffset={169.646 * (1 - upload.progress / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 30 30)"
                      style={{ transition: "stroke-dashoffset 150ms linear" }}
                    />
                  </svg>
                  <span className="percentage">{upload.progress}%</span>
                </ProgressGlassRing>
              </ProgressOverlay>
            </PreviewContainer>
          </UploadingPreviewItem>
        ))}

        {/* column-reverse를 위해 메시지를 역순으로 렌더링 */}
        {reversedMessages.map((msg, index) => {
          const originalIndex = visibleMessages.length - 1 - index;
          const prevMsg =
            originalIndex > 0 ? visibleMessages[originalIndex - 1] : null;
          const nextMsg =
            originalIndex < visibleMessages.length - 1
              ? visibleMessages[originalIndex + 1]
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

          const isSystemMessage = msg.senderNickname === "알림";

          const isBotMessage =
            msg.senderNickname === "챗불이" ||
            msg.messageType === "BOT_ANSWER" ||
            (msg.content && msg.content.includes("[CHATBULI_ANSWER]"));

          const isPending =
            msg.extraData === "PENDING" ||
            msg.messageId?.startsWith("temp-bot-");

          return (
            <React.Fragment key={msg.messageId || `msg-${originalIndex}`}>
              {isBotMessage ? (
                <ChatItemBot
                  message={msg}
                  showTime={showTime}
                  isLoading={isPending}
                  onAskHere={handleEnterChatbuliMode}
                />
              ) : isSystemMessage ? (
                <SystemMessage>
                  <div className="bubble">{msg.content}</div>
                </SystemMessage>
              ) : isMe ? (
                <ChatItemMy
                  message={msg}
                  onImageClick={handleImageClick}
                  showTime={showTime}
                  members={members}
                  onLongPress={() => handleMessageLongPress(msg, true)}
                />
              ) : (
                <ChatItemOtherPerson
                  message={msg}
                  onImageClick={handleImageClick}
                  userImageUrl={null}
                  showName={showName}
                  showTime={showTime}
                  members={members}
                  onLongPress={() => handleMessageLongPress(msg, false)}
                  onSenderClick={handleOpenProfileFromImage}
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
        <ChatSlashCommandPopup
          isOpen={isSlashPopupOpen}
          onSelect={handleEnterChatbuliMode}
        />

        <ChatPlusMenu
          isOpen={isPlusMenuOpen}
          onClose={() => setIsPlusMenuOpen(false)}
          onSelectChatbuli={handleEnterChatbuliMode}
          onSelectImage={() => {
            fileInputRef.current?.click();
          }}
        />

        <div className="input-wrapper">
          <input
            ref={fileInputRef}
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
          <IconButton
            type="button"
            onClick={() => setIsPlusMenuOpen((prev) => !prev)}
            onMouseDown={(e) => e.preventDefault()}
            aria-label="추가 기능 메뉴"
          >
            <Plus size={24} color="#0066FF" />
          </IconButton>

          <InputContainer>
            {isChatbuliMode && (
              <InputBadge>
                <img src={TorchAiLogo} alt="챗불이" width={16} height={16} />
                <span className="badge-text">/챗불이</span>
                <button
                  type="button"
                  className="badge-close"
                  onClick={handleExitChatbuliMode}
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label="챗불이 모드 해제"
                >
                  <X size={12} />
                </button>
              </InputBadge>
            )}

            <Input
              $isChatbuli={isChatbuliMode}
              placeholder={
                isChatbuliMode
                  ? "질문할 내용을 입력하세요"
                  : "메시지 입력 또는 '/챗불이'"
              }
              ref={inputRef}
              onInput={handleInput}
              rows={1}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => {
                // iOS 가상 키보드가 완전히 열릴 때까지 대기 후 스크롤 하단 자동 고정
                setTimeout(() => {
                  if (scrollRef.current) {
                    scrollRef.current.scrollTop = 0;
                  }
                }, 200);
              }}
              onKeyDown={handleKeyDown}
            />
          </InputContainer>

          <SendButton
            type="button"
            onClick={handleSendMessage}
            onMouseDown={(e) => {
              e.preventDefault();
              inputRef.current?.focus();
            }}
            aria-label="전송"
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
        senderId={activeImageMeta?.senderChatRoomMemberId}
        onSenderClick={handleOpenProfileFromImage}
      />

      {/* 메시지 롱프레스 → 신고 / 작성자 차단 / 숨기기 (App Store 가이드라인 1.2) */}
      {chatModeration.sheets}

      <UserProfileModal
        chatRoomMemberId={selectedChatRoomMemberId}
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
  height: calc(var(--visual-viewport-height, 100dvh));
  overflow: hidden;
  position: fixed;
  /* iOS에서 뷰포트가 밀릴 경우 offset-top만큼 보정하여 헤더 위치 사수 */
  top: calc(var(--visual-viewport-offset-top, 0px));
  left: 0;
  right: 0;
  overscroll-behavior: none;
  background-color: var(--bg-base, #ffffff);
  z-index: 60;
`;

const HeaderRightArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ChattingWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column-reverse;
  overflow-y: auto;
  padding-top: 76px;
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
  position: relative;
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

const InputContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
`;

const InputBadge = styled.div`
  position: absolute;
  left: 8px;
  top: 7px;
  height: 26px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #ffffff;
  border: 1px solid #ffd8bf;
  border-radius: 13px;
  padding: 0 6px;
  box-shadow: 0 1px 3px rgba(255, 107, 0, 0.12);
  z-index: 2;
  user-select: none;
  pointer-events: auto;

  img {
    border-radius: 50%;
    object-fit: contain;
  }

  .badge-text {
    font-size: 12px;
    font-weight: 700;
    color: #ff6b00;
    line-height: 1;
    white-space: nowrap;
  }

  .badge-close {
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8e8e93;
    margin-left: 2px;

    &:hover {
      color: #1c1c1e;
    }
  }
`;

const Input = styled.textarea<{ $isChatbuli?: boolean }>`
  flex: 1;
  min-width: 0;
  padding: 8px 14px;
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
  text-indent: ${(props) => (props.$isChatbuli ? "92px" : "0px")};

  &::placeholder {
    color: #8e8e93;
    text-indent: ${(props) => (props.$isChatbuli ? "92px" : "0px")};
  }

  &::-webkit-input-placeholder {
    color: #8e8e93;
    text-indent: ${(props) => (props.$isChatbuli ? "92px" : "0px")};
  }
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

const SystemMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 12px 16px;

  .bubble {
    background-color: #f2f2f7;
    color: #8e8e93;
    font-size: 12px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 20px;
    text-align: center;
    max-width: 85%;
    line-height: 1.4;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  }
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
  cursor: pointer;
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
  /* 눌러서 프로필(→ 차단)을 열 수 있다는 걸 드러낸다. */
  cursor: pointer;
  width: fit-content;
`;

const MessageBubble = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  /* 길게 누르면 신고/차단 시트가 뜬다 — iOS WebView의 기본 텍스트 선택·복사
     말풍선이 대신 뜨면 시트를 가리므로 막는다. */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
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
  onLongPress,
  onSenderClick,
}: {
  message: ChatMessage;
  onImageClick: (
    url: string,
    senderName: string,
    createDate: string,
    senderId?: number | null,
  ) => void;
  userImageUrl: string | null;
  showName: boolean;
  showTime: boolean;
  members: ChatRoomMemberResponseDto[];
  onLongPress: () => void;
  onSenderClick: (chatRoomMemberId: number) => void;
}) => {
  const longPress = useLongPress(onLongPress);
  const getDisplayName = () => {
    const matched = members.find(
      (m: ChatRoomMemberResponseDto) => m.nickname === message.senderNickname,
    );
    return (
      matched?.friendAlias || message.senderAlias || message.senderNickname
    );
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

  const isTimetableShare =
    message.messageType === "TIMETABLE_SHARE" ||
    (message.extraData && message.extraData.includes("topFreeTimes"));

  return (
    <MessageContainer>
      {userImageUrl && (
        <ProfileImage
          src={userImageUrl}
          alt="profile"
          onClick={() => onSenderClick(message.senderChatRoomMemberId)}
        />
      )}
      <MessageContent>
        {showName && (
          // 보낸 사람 이름을 누르면 프로필이 열리고, 거기서 차단할 수 있다.
          <SenderName
            role="button"
            tabIndex={0}
            onClick={() => onSenderClick(message.senderChatRoomMemberId)}
          >
            {getDisplayName()}
          </SenderName>
        )}
        <MessageBubble {...longPress}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            {isTimetableShare ? (
              <TimetableShareCard
                extraData={message.extraData}
                content={message.content}
                isMe={false}
              />
            ) : (
              <>
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
                        message.senderChatRoomMemberId,
                      )
                    }
                  />
                )}
                {message.content && (
                  <Bubble $bgColor={bgColor}>{message.content}</Bubble>
                )}
              </>
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
  onLongPress,
}: {
  message: ChatMessage;
  onImageClick: (
    url: string,
    senderName: string,
    createDate: string,
    senderId?: number | null,
  ) => void;
  showTime: boolean;
  members: ChatRoomMemberResponseDto[];
  onLongPress: () => void;
}) => {
  const longPress = useLongPress(onLongPress);
  const getDisplayName = () => {
    const matched = members.find(
      (m: ChatRoomMemberResponseDto) => m.nickname === message.senderNickname,
    );
    return (
      matched?.friendAlias || message.senderAlias || message.senderNickname
    );
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
  const isTimetableShare =
    message.messageType === "TIMETABLE_SHARE" ||
    (message.extraData && message.extraData.includes("topFreeTimes"));

  return (
    <MyMessageContainer>
      <MyMessageContent>
        <MessageBubble {...longPress}>
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
            {isTimetableShare ? (
              <TimetableShareCard
                extraData={message.extraData}
                content={message.content}
                isMe={true}
              />
            ) : (
              <>
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
                        message.senderChatRoomMemberId,
                      )
                    }
                  />
                )}
                {message.content && (
                  <Bubble $bgColor={bgColor}>{message.content}</Bubble>
                )}
              </>
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
    from {
      opacity: 0;
      transform: translate(-50%, 8px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
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
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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
  filter: brightness(
    0.7
  ); /* 전송 중 느낌을 주기 위한 차분한 어두움만 적용 (블러 제거) */
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

const ProgressGlassRing = styled.div`
  width: 60px;
  height: 60px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;

  svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .percentage {
    position: relative;
    color: #ffffff;
    font-size: 12px;
    z-index: 1;
  }
`;
