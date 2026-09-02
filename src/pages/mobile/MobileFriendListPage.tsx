import styled from "styled-components";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPersonalChatRoom, getMyChatRooms } from "@/apis/chat";
import { ROUTES } from "@/constants/routes";
import { useHeader } from "@/context/HeaderContext";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import FriendManagementView from "@/components/mobile/chat/FriendManagementView";
import AddFriendModal from "@/components/mobile/chat/AddFriendModal";
import AddFriendMenuCard from "@/components/mobile/social/AddFriendMenuCard";
import TabUpper from "@/components/common/TabUpper";
import { MyChatRoomResponseDto } from "@/types/chat";
import { FriendResponseDto } from "@/types/friends";
import FloatingSearchBar from "@/components/mobile/common/FloatingSearchBar";
import ChatRoomListItem from "@/components/mobile/chat/ChatRoomListItem";
import { Plus } from "lucide-react";
import Icon from "@/components/common/Icon";
import NearbyFriendInfoSheet from "@/components/mobile/social/NearbyFriendInfoSheet";
import { useHistoryBackedOverlay } from "@/hooks/useHistoryBackedOverlay";
import BlockedUsersModal from "@/components/mobile/chat/BlockedUsersModal";
import SentRequestsModal from "@/components/mobile/chat/SentRequestsModal";

export default function MobileFriendListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const modeParam = searchParams.get("mode");
  const isShareMode = modeParam === "share";
  const sharePayloadParam = searchParams.get("sharePayload");

  const [shareTab, setShareTab] = useState<"friends" | "rooms">("friends");
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  // States
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTop, setIsTop] = useState(true);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsTop(window.scrollY === 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const isSelectionModeRef = useRef(false);
  const hasSelectionHistoryEntryRef = useRef(false);
  const isSyncingSelectionHistoryRef = useRef(false);

  useEffect(() => {
    if (isShareMode && shareTab === "friends") {
      setIsSelectionMode(true);
    }
  }, [isShareMode, shareTab]);

  useEffect(() => {
    isSelectionModeRef.current = isSelectionMode;
  }, [isSelectionMode]);

  useEffect(() => {
    const handlePopStateForSelection = () => {
      if (isSyncingSelectionHistoryRef.current) {
        isSyncingSelectionHistoryRef.current = false;
        hasSelectionHistoryEntryRef.current = false;
        return;
      }

      if (!isSelectionModeRef.current) return;

      if (window.history.state?.__intipFriendSelectionOpen) return;

      hasSelectionHistoryEntryRef.current = false;
      setIsSelectionMode(false);
    };

    window.addEventListener("popstate", handlePopStateForSelection);
    return () =>
      window.removeEventListener("popstate", handlePopStateForSelection);
  }, []);

  useEffect(() => {
    if (isSelectionMode) {
      if (!hasSelectionHistoryEntryRef.current) {
        window.history.pushState(
          {
            ...(window.history.state ?? {}),
            __intipFriendSelectionOpen: true,
          },
          "",
        );
        hasSelectionHistoryEntryRef.current = true;
      }
      return;
    }

    if (
      hasSelectionHistoryEntryRef.current &&
      window.history.state?.__intipFriendSelectionOpen
    ) {
      isSyncingSelectionHistoryRef.current = true;
      window.history.back();
    }
  }, [isSelectionMode]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<FriendResponseDto[]>([]);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [isNearbyInfoOpen, setIsNearbyInfoOpen] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [isSentRequestsModalOpen, setIsSentRequestsModalOpen] = useState(false);

  // Add-friend FAB 드롭다운 메뉴 (닉네임 검색 / 주변 친구 찾기 / 링크·QR 초대)
  const {
    isOpen: isAddMenuOpen,
    close: closeAddMenu,
    toggle: toggleAddMenu,
  } = useHistoryBackedOverlay();

  // Query my chat rooms when in share mode and rooms tab
  const { data: myChatRoomsRes } = useQuery({
    queryKey: ["myChatRooms"],
    queryFn: getMyChatRooms,
    enabled: isShareMode && shareTab === "rooms",
  });
  const myChatRooms = useMemo(() => myChatRoomsRes?.data || [], [myChatRoomsRes]);

  // Handle friend 1:1 or group chat room creation
  const chatMutation = useMutation({
    mutationFn: async (targetFriendIds: number[]) =>
      createPersonalChatRoom(targetFriendIds),
    onSuccess: (res: any) => {
      const roomData = res.data || res;
      const roomId = roomData.id || roomData.roomId;
      if (roomId) {
        if (isShareMode && sharePayloadParam) {
          navigate(
            `${ROUTES.CHAT.ROOT}/${roomId}?sharePayload=${sharePayloadParam}`,
          );
        } else {
          navigate(`${ROUTES.CHAT.ROOT}/${roomId}`);
        }
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "채팅방 생성에 실패했습니다.");
    },
  });

  // Init selections from query param 'ids' if any
  useEffect(() => {
    const idsParam = searchParams.get("ids");
    if (idsParam) {
      const ids = idsParam.split(",").map(Number).filter(Boolean);
      if (ids.length > 0) {
        setSelectedIds(ids);
        setIsSelectionMode(true);
      }
    }
  }, [searchParams]);

  // Clear selectedIds when exiting selection mode
  useEffect(() => {
    if (!isSelectionMode) {
      setSelectedIds([]);
    }
  }, [isSelectionMode]);

  // Selection handlers
  const handleToggleSelect = useCallback((friendId: number) => {
    setSelectedIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
  }, []);

  const handleLongPress = useCallback((friendId: number) => {
    if (!isSelectionModeRef.current) {
      setIsSelectionMode(true);
      setSelectedIds([friendId]);
    }
  }, []);

  const handleSelectToggle = useCallback(() => {
    if (isSelectionMode) {
      setIsSelectionMode(false);
    } else {
      setIsSelectionMode(true);
      closeAddMenu();
    }
  }, [isSelectionMode, closeAddMenu]);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredFriends.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFriends.map((f) => f.friendId));
    }
  }, [selectedIds, filteredFriends]);

  const headerRight = useMemo(() => {
    if (isShareMode) {
      if (shareTab === "friends") {
        return (
          <HeaderActionsContainer>
            <HeaderActionButton onClick={handleSelectAll}>
              {selectedIds.length === filteredFriends.length
                ? "전체 해제"
                : "전체 선택"}
            </HeaderActionButton>
          </HeaderActionsContainer>
        );
      }
      return undefined;
    }
    if (isSelectionMode) {
      return (
        <HeaderActionsContainer>
          <HeaderActionButton onClick={handleSelectAll}>
            {selectedIds.length === filteredFriends.length
              ? "전체 해제"
              : "전체 선택"}
          </HeaderActionButton>
          <HeaderActionButton onClick={handleSelectToggle} className="cancel">
            취소
          </HeaderActionButton>
        </HeaderActionsContainer>
      );
    }
    return (
      <HeaderRightSingle>
        <HeaderActionButton onClick={handleSelectToggle}>
          시간표 비교
        </HeaderActionButton>
      </HeaderRightSingle>
    );
  }, [
    isShareMode,
    shareTab,
    isSelectionMode,
    selectedIds.length,
    filteredFriends.length,
    handleSelectAll,
    handleSelectToggle,
  ]);

  const subHeader = useMemo(() => {
    if (!isShareMode) return undefined;
    return (
      <TabUpper
        tabs={[
          { id: "friends", label: "친구 목록" },
          { id: "rooms", label: "채팅방 목록" },
        ]}
        activeTabId={shareTab}
        onChange={(id) => setShareTab(id as "friends" | "rooms")}
      />
    );
  }, [isShareMode, shareTab]);

  const menuItems = useMemo(() => {
    if (isSelectionMode || isShareMode) return undefined;
    return [
      {
        label: "알림 설정",
        onClick: () => {
          navigate(ROUTES.MYPAGE.NOTIFICATION);
        },
      },
      {
        label: "보낸 친구 요청 목록",
        onClick: () => {
          setIsSentRequestsModalOpen(true);
        },
      },
      {
        label: "차단 친구 관리",
        onClick: () => {
          setIsBlockedModalOpen(true);
        },
      },
    ];
  }, [isSelectionMode, isShareMode, navigate]);

  useHeader({
    title: isShareMode ? "시간표 공유 대상 선택" : "친구",
    hasback: true,
    immersive: true,
    pageBgColor: "#f8f9fb",
    rightAreaNotCircle: true,
    rightArea: headerRight,
    subHeader: subHeader,
    menuItems: menuItems,
  });

  const handleCompareClick = () => {
    if (isShareMode) {
      if (shareTab === "friends") {
        if (selectedIds.length === 0) return;
        chatMutation.mutate(selectedIds);
      } else if (shareTab === "rooms") {
        if (!selectedRoomId) return;
        navigate(
          `${ROUTES.CHAT.ROOT}/${selectedRoomId}?sharePayload=${sharePayloadParam}`,
        );
      }
    } else {
      if (selectedIds.length === 0) return;
      navigate(`${ROUTES.TIMETABLE.COMPARE}?ids=${selectedIds.join(",")}`);
    }
  };

  const handleSearchActiveChange = useCallback(
    (active: boolean) => {
      setIsSearchActive(active);
      if (!active) {
        setSearchTerm("");
      } else {
        closeAddMenu();
      }
    },
    [closeAddMenu],
  );

  return (
    <PageWrapper $isShareMode={isShareMode}>
      <AddFriendModal
        isOpen={isAddFriendOpen}
        onOpenChange={(open) => {
          setIsAddFriendOpen(open);
          if (!open) {
            queryClient.invalidateQueries({ queryKey: ["friends"] });
          }
        }}
      />
      <NearbyFriendInfoSheet
        open={isNearbyInfoOpen}
        onOpenChange={setIsNearbyInfoOpen}
      />
      <BlockedUsersModal
        isOpen={isBlockedModalOpen}
        onOpenChange={setIsBlockedModalOpen}
      />
      <SentRequestsModal
        isOpen={isSentRequestsModalOpen}
        onOpenChange={setIsSentRequestsModalOpen}
      />

      {isShareMode && shareTab === "rooms" ? (
        <FriendListContainer style={{ marginTop: "12px", marginBottom: "32px" }}>
          {myChatRooms.length > 0 ? (
            myChatRooms.map((room: MyChatRoomResponseDto) => {
              const isSelected = selectedRoomId === room.roomId;
              return (
                <SelectableRoomItemWrapper
                  key={room.roomId}
                  $isSelected={isSelected}
                  onClick={() => setSelectedRoomId(room.roomId)}
                >
                  <RoomItemCheckOverlay $isSelected={isSelected}>
                    {isSelected && <Icon name="check" size={14} color="#ffffff" />}
                  </RoomItemCheckOverlay>
                  <ChatRoomListItemWrapper>
                    <ChatRoomListItem
                      room={room}
                      onClick={() => setSelectedRoomId(room.roomId)}
                    />
                  </ChatRoomListItemWrapper>
                </SelectableRoomItemWrapper>
              );
            })
          ) : (
            <EmptyContainer>
              <EmptyTitle>참여 중인 채팅방이 없어요</EmptyTitle>
            </EmptyContainer>
          )}
        </FriendListContainer>
      ) : (
        <FriendManagementView
          searchTerm={searchTerm}
          isSelectionMode={isSelectionMode}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onLongPress={handleLongPress}
          isShareMode={isShareMode}
          sharePayload={sharePayloadParam || undefined}
          onFilteredFriendsChange={setFilteredFriends}
        />
      )}

      {/* Floating Area (always rendered for animation) */}
      <FloatingActionsOuter>
        <FloatingActionsWrapper>
          {/* Plus button - scale out when selection mode is active */}
          <PlusButtonWrapper
            $visible={!isSelectionMode && !isSearchActive && !isShareMode}
          >
            <AddFriendMenuCard
              open={isAddMenuOpen}
              onScrimClick={() => closeAddMenu()}
              onSearchClick={() => {
                closeAddMenu(() => setIsAddFriendOpen(true));
              }}
              onNearbyClick={() => {
                closeAddMenu(() => setIsNearbyInfoOpen(true));
              }}
              onInviteClick={() => {
                closeAddMenu(() => navigate(ROUTES.FRIEND.QR));
              }}
            />
            <FloatingActionButton
              onClick={toggleAddMenu}
              $isTop={isTop}
            >
              <Plus
                size={20}
                color="white"
                style={{
                  transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: isAddMenuOpen ? "rotate(45deg)" : "rotate(0deg)",
                }}
              />
              <ButtonLabel $isTop={isTop}>친구 추가</ButtonLabel>
            </FloatingActionButton>
          </PlusButtonWrapper>

          {/* Search bar */}
          {(!isShareMode || shareTab === "friends") && (
            <SearchBarContainer $isSearchActive={isSearchActive}>
              <FloatingSearchBar
                placeholder="친구 이름 또는 학번 검색"
                onSearch={setSearchTerm}
                onActiveChange={handleSearchActiveChange}
                searchParamKey="q"
                size={56}
              />
            </SearchBarContainer>
          )}

          {/* Compare / Share button - slides up from bottom */}
          <CompareButtonArea $visible={isShareMode || isSelectionMode}>
            <CompareFloatingButton
              onClick={handleCompareClick}
              disabled={
                isShareMode
                  ? shareTab === "friends"
                    ? selectedIds.length === 0 || chatMutation.isPending
                    : !selectedRoomId
                  : selectedIds.length === 0
              }
              className={
                (
                  isShareMode
                    ? shareTab === "friends"
                      ? selectedIds.length === 0
                      : !selectedRoomId
                    : selectedIds.length === 0
                )
                  ? "disabled"
                  : ""
              }
            >
              {isShareMode
                ? shareTab === "friends"
                  ? selectedIds.length > 0
                    ? `선택한 ${selectedIds.length}명과 채팅방 생성 및 공유`
                    : "시간표 공유할 친구 선택"
                  : selectedRoomId
                  ? "이 채팅방에 공유하기"
                  : "공유할 채팅방 선택"
                : "시간표 비교하기"}
            </CompareFloatingButton>
          </CompareButtonArea>
        </FloatingActionsWrapper>
      </FloatingActionsOuter>
    </PageWrapper>
  );
}

const PageWrapper = styled.div<{ $isShareMode?: boolean }>`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: ${({ $isShareMode }) =>
    $isShareMode
      ? `calc(var(--header-height, 56px) + 12px) ${MOBILE_PAGE_GUTTER} calc(var(--nav-height, 100px) + 90px)`
      : `calc(var(--header-height, 56px) + 16px) ${MOBILE_PAGE_GUTTER} calc(var(--nav-height, 100px) + 80px)`};
  background-color: var(--bg-subtle, #f8f9fb);
`;

const FriendListContainer = styled.div`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  box-sizing: border-box;
  width: 100%;
`;

const EmptyTitle = styled.h3`
  font-family: Pretendard;
  font-weight: 600;
  font-size: 20px;
  line-height: 32px;
  color: var(--text-primary, #333d4b);
  margin: 24px 0 8px 0;
  text-align: center;
`;

const FloatingActionsOuter = styled.div`
  position: fixed;
  bottom: calc(var(--nav-height, 100px) + 0px);
  right: 0;
  left: 0;
  width: 100%;
  z-index: 99;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(248, 249, 251, 0) 0%,
    rgba(248, 249, 251, 0.45) 45%,
    rgba(248, 249, 251, 0.85) 100%
  );
`;

const FloatingActionsWrapper = styled.div`
  max-width: 768px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
  box-sizing: border-box;
  padding: 32px 24px calc(24px + env(safe-area-inset-bottom, 0px));

  & > * {
    pointer-events: auto;
  }
`;

const PlusButtonWrapper = styled.div<{ $visible: boolean }>`
  position: relative;
  display: flex;
  justify-content: flex-end;
  margin-bottom: ${({ $visible }) => ($visible ? "12px" : "0px")};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) => ($visible ? "scale(1)" : "scale(0)")};
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.25s ease,
    margin-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const FloatingActionButton = styled.button<{ $isTop: boolean }>`
  height: 48px;
  border-radius: 24px;
  background-color: #5e92f0;
  border: none;
  box-shadow: 0 4px 12px rgba(94, 146, 240, 0.35);
  cursor: pointer;
  z-index: 10;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  display: grid;
  grid-template-columns: auto ${({ $isTop }) => ($isTop ? "1fr" : "0fr")};

  padding: ${({ $isTop }) => ($isTop ? "0 16px 0 14px" : "0 14px")};

  transition:
    grid-template-columns 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.2s;

  &:active {
    transform: scale(0.95);
  }
`;

const ButtonLabel = styled.span<{ $isTop: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;

  margin-left: ${({ $isTop }) => ($isTop ? "5px" : "0px")};

  opacity: ${({ $isTop }) => ($isTop ? 1 : 0)};

  transition:
    margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    opacity ${({ $isTop }) => ($isTop ? "0.2s" : "0.12s")}
      cubic-bezier(0.4, 0, 0.2, 1);
`;

const CompareButtonArea = styled.div<{ $visible: boolean }>`
  width: 100%;
  overflow: hidden;
  max-height: ${({ $visible }) => ($visible ? "80px" : "0px")};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) =>
    $visible ? "translateY(0)" : "translateY(12px)"};
  margin-top: ${({ $visible }) => ($visible ? "12px" : "0px")};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition:
    max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    margin-top 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
`;

const SearchBarContainer = styled.div<{ $isSearchActive: boolean }>`
  width: ${({ $isSearchActive }) => ($isSearchActive ? "100%" : "56px")};
  height: 56px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const CompareFloatingButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 56px;
  border-radius: 999px;
  background-color: var(--interactive-primary, #3b82f6);
  border: none;
  color: #ffffff;
  font-family: Pretendard;
  font-weight: 600;
  font-size: 20px;
  line-height: 32px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.16);
  cursor: pointer;
  outline: none;

  &:disabled,
  &.disabled {
    background-color: var(--bg-disabled, #d1d6db);
    color: var(--text-disabled, #8b95a1);
    cursor: not-allowed;
    box-shadow: none;
    pointer-events: none;
  }

  &:active {
    background-color: var(--interactive-primary-pressed, #2563eb);
    transform: scale(0.98);
  }
`;

const HeaderActionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const HeaderActionButton = styled.button`
  border: none;
  background: none;
  font-family: Pretendard;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: var(--text-brand, #0061ff);
  cursor: pointer;
  outline: none;
  padding: 0;

  &.cancel {
    color: var(--text-secondary, #333d4b);
  }

  &:active {
    opacity: 0.7;
  }
`;

const HeaderRightSingle = styled.div`
  display: flex;
  align-items: center;
`;

const SelectableRoomItemWrapper = styled.div<{ $isSelected: boolean }>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 4px 16px 4px 16px;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  background-color: ${({ $isSelected }) =>
    $isSelected ? "var(--bg-brand-subtle, #eff6ff)" : "transparent"};
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;

  &:last-child {
    border-bottom: none;
  }
`;

const RoomItemCheckOverlay = styled.div<{ $isSelected: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid
    ${({ $isSelected }) => ($isSelected ? "#0061ff" : "#c2c8d0")};
  background-color: ${({ $isSelected }) =>
    $isSelected ? "#0061ff" : "transparent"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 4px;
  transition: all 0.15s ease-in-out;
`;

const ChatRoomListItemWrapper = styled.div`
  flex: 1;
  min-width: 0;

  & > div {
    padding-left: 0;
    padding-right: 0;
  }
`;
