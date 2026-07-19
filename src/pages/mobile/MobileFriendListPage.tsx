import styled from "styled-components";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getFriends } from "@/apis/friends";
import { createPersonalChatRoom } from "@/apis/chat";
import { ROUTES } from "@/constants/routes";
import { useHeader } from "@/context/HeaderContext";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import UserProfileModal from "@/components/mobile/social/UserProfileModal";
import AddFriendModal from "@/components/mobile/chat/AddFriendModal";
import { normalizeProfileImageId, DEFAULT_PROFILE_IMAGE_ID } from "@/utils/userInfo";
import FloatingSearchBar from "@/components/mobile/common/FloatingSearchBar";
import Ripple from "@/components/common/Ripple";
import { ArrowDownAZ, ArrowUpZA } from "lucide-react";

// --- SVG Icons ---

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19" stroke="#333D4B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 12H19" stroke="#333D4B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="#0061FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AlarmIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="13" r="7.5" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 9V13L14 15" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 3L8 1.3" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 3L16 1.3" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 20L4.5 21.5" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 20L19.5 21.5" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChatBubbleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#0061FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#0061FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke="#0061FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EmptyFriendsIllust = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="52" fill="#F8F9FB"/>
    <circle cx="60" cy="60" r="44" fill="#F2F4F6"/>
    <g filter="url(#shadow)">
      <circle cx="48" cy="52" r="12" fill="#D3E5FF"/>
      <circle cx="72" cy="54" r="10" fill="#E5E8EB"/>
      <path d="M48 68C38 68 34 76 34 84H62C62 76 58 68 48 68Z" fill="#D3E5FF"/>
      <path d="M72 68C64 68 60 74 60 81H84C84 74 80 68 72 68Z" fill="#E5E8EB"/>
    </g>
    <defs>
      <filter id="shadow" x="28" y="36" width="62" height="54" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.04"/>
      </filter>
    </defs>
  </svg>
);

// --- Dummy Helper Mapper (Matches existing API mapping logic) ---
const getFriendDept = (nickname: string) => {
  const deptMap: Record<string, string> = {
    김유니: "컴퓨터공학부",
    박민서: "생명공학부",
    이지원: "미디어커뮤니케이션학과",
    최유리: "도시환경공학부",
    홍길동: "Global Trade 학부",
  };
  return deptMap[nickname] || "컴퓨터공학부";
};

const getFriendStudentYear = (studentId: string) => {
  if (!studentId) return "23학번";
  if (studentId.length >= 4) {
    return `${studentId.slice(2, 4)}학번`;
  }
  return `${studentId}학번`;
};

export default function MobileFriendListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // States
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const isSelectionModeRef = useRef(false);
  const hasSelectionHistoryEntryRef = useRef(false);
  const isSyncingSelectionHistoryRef = useRef(false);

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

      hasSelectionHistoryEntryRef.current = false;
      setIsSelectionMode(false);
    };

    window.addEventListener("popstate", handlePopStateForSelection);
    return () => window.removeEventListener("popstate", handlePopStateForSelection);
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
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    () => (localStorage.getItem("__intipFriendSortOrder") as "asc" | "desc") || "asc"
  );

  useEffect(() => {
    localStorage.setItem("__intipFriendSortOrder", sortOrder);
  }, [sortOrder]);

  // Profile modal states
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Long press timer tracking refs
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const preventClick = useRef(false);

  // Query friends
  const { data: friendsRes } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });

  const friends = useMemo(() => friendsRes?.data || [], [friendsRes]);

  // Handle friend 1:1 chat room creation
  const chatMutation = useMutation({
    mutationFn: async (friendId: number) => createPersonalChatRoom([friendId]),
    onSuccess: (res) => {
      const roomId = res.data.id;
      navigate(`${ROUTES.CHAT.ROOT}/${roomId}`);
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "1대1 채팅방 생성에 실패했습니다.");
    },
  });

  // Filtered friends list
  const filteredFriends = useMemo(() => {
    let result = friends;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          f.nickname.toLowerCase().includes(term) ||
          (f.friendAlias && f.friendAlias.toLowerCase().includes(term)) ||
          (f.studentId && f.studentId.includes(term))
      );
    }
    // Chronological name sorting based on sortOrder
    return [...result].sort((a, b) => {
      const nameA = a.friendAlias || a.nickname;
      const nameB = b.friendAlias || b.nickname;
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
  }, [friends, searchTerm, sortOrder]);

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

  // Header handlers
  const handleSelectToggle = useCallback(() => {
    if (isSelectionMode) {
      setIsSelectionMode(false);
    } else {
      setIsSelectionMode(true);
      setExpandedId(null); // Collapse all accordion items
    }
  }, [isSelectionMode]);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredFriends.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFriends.map((f) => f.friendId));
    }
  }, [selectedIds, filteredFriends]);

  const headerRight = useMemo(() => {
    if (isSelectionMode) {
      return (
        <HeaderActionsContainer>
          <HeaderActionButton onClick={handleSelectAll}>
            {selectedIds.length === filteredFriends.length ? "전체 해제" : "전체 선택"}
          </HeaderActionButton>
          <HeaderActionButton onClick={handleSelectToggle} className="cancel">
            취소
          </HeaderActionButton>
        </HeaderActionsContainer>
      );
    }
    return (
      <HeaderRightSingle>
        <HeaderActionButton onClick={handleSelectToggle}>선택</HeaderActionButton>
      </HeaderRightSingle>
    );
  }, [isSelectionMode, selectedIds, filteredFriends, handleSelectAll, handleSelectToggle]);

  useHeader({
    title: "친구",
    hasback: true,
    immersive: true,
    pageBgColor: "#f8f9fb",
    rightAreaNotCircle: true,
    rightArea: headerRight,
  });

  // Expand / selection click handler
  const handleFriendClick = (friendId: number) => {
    if (isSelectionMode) {
      setSelectedIds((prev) =>
        prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
      );
    } else {
      setExpandedId((prev) => (prev === friendId ? null : friendId));
    }
  };

  // Long press event handlers
  const handlePressStart = (friendId: number) => {
    preventClick.current = false;
    longPressTimer.current = setTimeout(() => {
      preventClick.current = true;
      if (!isSelectionMode) {
        setIsSelectionMode(true);
        setExpandedId(null);
        setSelectedIds([friendId]);
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }, 600); // 600ms long press threshold
  };

  const handlePressCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleRowClick = (friendId: number) => {
    if (preventClick.current) {
      preventClick.current = false;
      return;
    }
    handleFriendClick(friendId);
  };

  const handleCompareClick = () => {
    if (selectedIds.length === 0) return;
    navigate(`${ROUTES.TIMETABLE.COMPARE}?ids=${selectedIds.join(",")}`);
  };

  const handleSingleTimetableCompare = (e: React.MouseEvent, friendId: number) => {
    e.stopPropagation();
    navigate(`${ROUTES.TIMETABLE.COMPARE}?ids=${friendId}`);
  };

  const handleSingleChatClick = (e: React.MouseEvent, friendId: number) => {
    e.stopPropagation();
    chatMutation.mutate(friendId);
  };

  const handleSingleInfoClick = (e: React.MouseEvent, friendId: number) => {
    e.stopPropagation();
    setSelectedFriendId(friendId);
    setIsProfileModalOpen(true);
  };

  const handleSearchActiveChange = useCallback((active: boolean) => {
    setIsSearchActive(active);
    if (!active) {
      setSearchTerm("");
    }
  }, []);

  return (
    <PageWrapper>
      <UserProfileModal
        friendId={selectedFriendId}
        isOpen={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
      />
      <AddFriendModal
        isOpen={isAddFriendOpen}
        onOpenChange={(open) => {
          setIsAddFriendOpen(open);
          if (!open) {
            queryClient.invalidateQueries({ queryKey: ["friends"] });
          }
        }}
      />

      <StatusSection>
        <TotalCountText>내 친구 ({filteredFriends.length})</TotalCountText>
        <SortIndicator onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}>
          <span>{sortOrder === "asc" ? "오름차순" : "내림차순"}</span>
          {sortOrder === "asc" ? (
            <ArrowDownAZ size={18} color="#8B95A1" />
          ) : (
            <ArrowUpZA size={18} color="#8B95A1" />
          )}
        </SortIndicator>
      </StatusSection>

      <FriendListContainer>
        {filteredFriends.length > 0 ? (
          filteredFriends.map((friend) => {
            const isSelected = selectedIds.includes(friend.friendId);
            const isExpanded = expandedId === friend.friendId;
            const dept = getFriendDept(friend.nickname);
            const year = getFriendStudentYear(friend.studentId);
            const safeFireId = normalizeProfileImageId(friend.fireId, DEFAULT_PROFILE_IMAGE_ID);

            const showDetail = !isSelectionMode && isExpanded;

            return (
              <FriendRowWrapper
                key={friend.friendId}
                $expanded={isExpanded}
              >
                <RowInner>
                  <RowHeader
                    onMouseDown={() => handlePressStart(friend.friendId)}
                    onMouseUp={handlePressCancel}
                    onMouseLeave={handlePressCancel}
                    onTouchStart={() => handlePressStart(friend.friendId)}
                    onTouchEnd={handlePressCancel}
                    onTouchMove={handlePressCancel}
                    onClick={() => handleRowClick(friend.friendId)}
                  >
                    <Ripple />
                    <ProfileArea>
                      <ProfileImage
                        src={`https://portal.inuappcenter.kr/images/profile/${safeFireId}`}
                        alt="Profile"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://portal.inuappcenter.kr/images/profile/default.png";
                        }}
                      />
                      {isSelectionMode && (
                        <SelectionOverlay $selected={isSelected}>
                          {isSelected && <CheckIcon />}
                        </SelectionOverlay>
                      )}
                    </ProfileArea>
                    <NameRow>
                      {friend.friendAlias || friend.nickname}
                    </NameRow>
                  </RowHeader>

                  <ExpandedDetailWrapper $expanded={showDetail}>
                    <ExpandedDetailInner>
                      <DetailContent>
                        <StudentInfoRow>
                          {year} · {dept}
                        </StudentInfoRow>
                        <ActionButtonRow>
                          <CircleActionButton
                            className="warn"
                            onClick={(e) => handleSingleTimetableCompare(e, friend.friendId)}
                          >
                            <AlarmIcon />
                          </CircleActionButton>
                          <CircleActionButton
                            onClick={(e) => handleSingleChatClick(e, friend.friendId)}
                          >
                            <ChatBubbleIcon />
                          </CircleActionButton>
                          <CircleActionButton
                            onClick={(e) => handleSingleInfoClick(e, friend.friendId)}
                          >
                            <UserIcon />
                          </CircleActionButton>
                        </ActionButtonRow>
                      </DetailContent>
                    </ExpandedDetailInner>
                  </ExpandedDetailWrapper>
                </RowInner>
              </FriendRowWrapper>
            );
          })
        ) : (
          <EmptyContainer>
            <EmptyFriendsIllust />
            <EmptyTitle>친구가 없어요</EmptyTitle>
            <EmptyDescription>
              아래 +버튼을 눌러 친구를 추가하고
              <br />
              친구와 시간표를 비교해보세요.
            </EmptyDescription>
          </EmptyContainer>
        )}
      </FriendListContainer>

      {/* Floating Area (always rendered for animation) */}
      <FloatingActionsWrapper>
        {/* Plus button - scale out when selection mode is active */}
        <PlusButtonWrapper $visible={!isSelectionMode && !isSearchActive}>
          <FloatingButton onClick={() => setIsAddFriendOpen(true)}>
            <PlusIcon />
          </FloatingButton>
        </PlusButtonWrapper>

        {/* Search bar */}
        <SearchBarContainer $isSearchActive={isSearchActive}>
          <FloatingSearchBar
            placeholder="친구 이름 또는 학번 검색"
            onSearch={setSearchTerm}
            onActiveChange={handleSearchActiveChange}
            searchParamKey="q"
          />
        </SearchBarContainer>

        {/* Compare button - slides up from bottom when in selection mode */}
        <CompareButtonArea $visible={isSelectionMode}>
          <CompareFloatingButton
            onClick={handleCompareClick}
            disabled={selectedIds.length === 0}
            className={selectedIds.length === 0 ? "disabled" : ""}
          >
            시간표 비교하기
          </CompareFloatingButton>
        </CompareButtonArea>
      </FloatingActionsWrapper>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: calc(var(--header-height, 56px) + 16px) ${MOBILE_PAGE_GUTTER} calc(var(--nav-height, 100px) + 80px);
  background-color: var(--bg-subtle, #f8f9fb);
`;

const StatusSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 12px;
  margin-bottom: 12px;
  box-sizing: border-box;
`;

const TotalCountText = styled.span`
  font-family: Pretendard;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: var(--text-tertiary, #8b95a1);
`;

const SortIndicator = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
  font-family: Pretendard;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: var(--text-tertiary, #8b95a1);
  cursor: pointer;
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

const FriendRowWrapper = styled.div<{ $expanded: boolean }>`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  background-color: transparent;
  user-select: none;
  -webkit-user-select: none;

  &:last-child {
    border-bottom: none;
  }
`;

const RowInner = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
`;

const RowHeader = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px 16px;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
`;

const ProfileArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  position: relative;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
  background-color: var(--border-brand-subtle, #d3e5ff);
`;

const SelectionOverlay = styled.div<{ $selected: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  box-sizing: border-box;
  border: 2px solid ${({ $selected }) => ($selected ? "#0061ff" : "rgba(0, 0, 0, 0.15)")};
  background-color: ${({ $selected }) => ($selected ? "rgba(0, 97, 255, 0.4)" : "transparent")};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
`;

const NameRow = styled.div`
  font-family: Pretendard;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: var(--text-primary, #333d4b);
  display: flex;
  align-items: center;
  min-height: 40px; /* Vertically centers name next to profile */
  margin-left: 12px;
  box-sizing: border-box;
`;

const ExpandedDetailWrapper = styled.div<{ $expanded: boolean }>`
  display: grid;
  grid-template-rows: ${({ $expanded }) => ($expanded ? "1fr" : "0fr")};
  transition: grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              visibility 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  overflow: hidden;
  visibility: ${({ $expanded }) => ($expanded ? "visible" : "hidden")};
`;

const ExpandedDetailInner = styled.div`
  min-height: 0;
  width: 100%;
`;

const DetailContent = styled.div`
  padding: 4px 16px 10px 68px; /* 16px gutter + 40px profile + 12px gap = 68px left padding */
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
`;

const StudentInfoRow = styled.div`
  font-family: Pretendard;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: var(--text-tertiary, #8b95a1);
  margin-bottom: 12px;
`;

const ActionButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
`;

const CircleActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  background-color: var(--bg-brand, #eff6ff);
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s ease-in-out;

  &:active {
    transform: scale(0.95);
    background-color: var(--border-brand-subtle, #d3e5ff);
  }

  &.warn {
    border: 1px solid var(--border-warn, #fee588);
    background-color: var(--bg-warn, #fffaeb);
    
    &:active {
      background-color: var(--border-warn, #fee588);
    }
  }
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

const EmptyDescription = styled.p`
  font-family: Pretendard;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: var(--text-secondary, #6b7684);
  margin: 0;
  text-align: center;
`;

const FloatingActionsWrapper = styled.div`
  position: fixed;
  bottom: calc(var(--nav-height, 100px) + 0px);
  right: 0;
  left: 0;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  z-index: 99;
  max-width: 768px;
  pointer-events: none;
  box-sizing: border-box;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.00) 16.02%, #FFF 100%);
  padding: 32px 24px calc(24px + env(safe-area-inset-bottom, 0px));

  & > * {
    pointer-events: auto;
  }
`;

const PlusButtonWrapper = styled.div<{ $visible: boolean }>`
  height: ${({ $visible }) => ($visible ? "56px" : "0px")};
  width: 56px;
  margin-bottom: ${({ $visible }) => ($visible ? "12px" : "0px")};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition:
    height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    margin-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  & > button {
    transform: ${({ $visible }) => ($visible ? "scale(1)" : "scale(0)")};
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    transition:
      transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.25s ease;
  }
`;

const CompareButtonArea = styled.div<{ $visible: boolean }>`
  width: 100%;
  overflow: hidden;
  max-height: ${({ $visible }) => ($visible ? "80px" : "0px")};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) => ($visible ? "translateY(0)" : "translateY(12px)")};
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

const FloatingButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid var(--border-default, #e5e8eb);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: pointer;
  outline: none;
  
  &:active {
    background-color: var(--bg-muted, #f1f3f5);
    transform: scale(0.95);
  }
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
  
  &:disabled, &.disabled {
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
