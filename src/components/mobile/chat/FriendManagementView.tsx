import styled from "styled-components";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  getFriends,
  getPendingFriends,
  acceptFriend,
  deleteFriend,
} from "@/apis/friends";
import { createPersonalChatRoom } from "@/apis/chat";
import { ROUTES } from "@/constants/routes";
import UserProfileModal from "@/components/mobile/social/UserProfileModal";
import SocialUserCard from "@/components/mobile/social/SocialUserCard";
import Divider from "@/components/common/Divider";
import Ripple from "@/components/common/Ripple";
import Icon from "@/components/common/Icon";
import { ArrowDownAZ, ArrowUpZA } from "lucide-react";
import useUserStore from "@/stores/useUserStore";
import {
  normalizeProfileImageId,
  DEFAULT_PROFILE_IMAGE_ID,
} from "@/utils/userInfo";
import Skeleton from "@/components/common/Skeleton";
import Modal from "@/components/common/Modal";

// --- SVG Icons ---

const CheckIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 6L9 17L4 12"
      stroke="#0061FF"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AlarmIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="13"
      r="7.5"
      stroke="#B45309"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 9V13L14 15"
      stroke="#B45309"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 3L8 1.3"
      stroke="#B45309"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 3L16 1.3"
      stroke="#B45309"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 20L4.5 21.5"
      stroke="#B45309"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 20L19.5 21.5"
      stroke="#B45309"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      stroke="#0061FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      stroke="#0061FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="7"
      r="4"
      stroke="#0061FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EmptyFriendsIllust = () => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="60" cy="60" r="52" fill="#F8F9FB" />
    <circle cx="60" cy="60" r="44" fill="#F2F4F6" />
    <g filter="url(#shadow)">
      <circle cx="48" cy="52" r="12" fill="#D3E5FF" />
      <circle cx="72" cy="54" r="10" fill="#E5E8EB" />
      <path d="M48 68C38 68 34 76 34 84H62C62 76 58 68 48 68Z" fill="#D3E5FF" />
      <path d="M72 68C64 68 60 74 60 81H84C84 74 80 68 72 68Z" fill="#E5E8EB" />
    </g>
    <defs>
      <filter
        id="shadow"
        x="28"
        y="36"
        width="62"
        height="54"
        filterUnits="userSpaceOnUse"
      >
        <feDropShadow
          dx="0"
          dy="2"
          stdDeviation="2"
          floodColor="#000000"
          floodOpacity="0.04"
        />
      </filter>
    </defs>
  </svg>
);

const getFriendStudentYear = (studentId?: string) => {
  if (!studentId) return "";
  if (studentId.length >= 4) {
    return `${studentId.slice(2, 4)}학번`;
  }
  return `${studentId}학번`;
};

export interface FriendManagementViewProps {
  searchTerm?: string;
  isSelectionMode?: boolean;
  selectedIds?: number[];
  onToggleSelect?: (friendId: number) => void;
  onPressStart?: (friendId: number) => void;
  onPressCancel?: () => void;
  isShareMode?: boolean;
}

export default function FriendManagementView({
  searchTerm = "",
  isSelectionMode = false,
  selectedIds = [],
  onToggleSelect,
  onPressStart,
  onPressCancel,
  isShareMode = false,
}: FriendManagementViewProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userInfo } = useUserStore();
  const isLoggedIn = userInfo && userInfo.id !== 0;

  // Local state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [selectedMyId, setSelectedMyId] = useState<number | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    type: "accept" | "reject";
    friendId: number;
    nickname: string;
  } | null>(null);

  // Sorting
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    () =>
      (localStorage.getItem("__intipFriendSortOrder") as "asc" | "desc") ||
      "asc",
  );

  useEffect(() => {
    localStorage.setItem("__intipFriendSortOrder", sortOrder);
  }, [sortOrder]);

  // Favorites
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("__intipFriendFavorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("__intipFriendFavorites", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const handleToggleFavorite = useCallback((friendId: number) => {
    setFavoriteIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
  }, []);

  // Long press tracking for rows
  const internalLongPressTimer = useRef<NodeJS.Timeout | null>(null);
  const preventClick = useRef(false);

  // Queries
  const { data: friendsRes, isLoading: friendsLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
    enabled: isLoggedIn,
  });

  const { data: pendingRes } = useQuery({
    queryKey: ["pendingFriends"],
    queryFn: getPendingFriends,
    enabled: isLoggedIn && !isShareMode && !isSelectionMode,
  });

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: acceptFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["pendingFriends"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["pendingFriends"] });
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (targetFriendIds: number[]) =>
      createPersonalChatRoom(targetFriendIds),
    onSuccess: (res: any) => {
      const roomData = res.data || res;
      const roomId = roomData.id || roomData.roomId;
      if (roomId) {
        navigate(`${ROUTES.CHAT.ROOT}/${roomId}`);
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "채팅방 생성에 실패했습니다.");
    },
  });

  const friends = useMemo(() => friendsRes?.data || [], [friendsRes]);
  const pendingRequests = useMemo(() => pendingRes?.data || [], [pendingRes]);

  // Filtering and sorting
  const filteredFriends = useMemo(() => {
    let result = friends;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          f.nickname.toLowerCase().includes(term) ||
          (f.friendAlias && f.friendAlias.toLowerCase().includes(term)) ||
          (f.studentId && f.studentId.includes(term)),
      );
    }
    return [...result].sort((a, b) => {
      const nameA = a.friendAlias || a.nickname;
      const nameB = b.friendAlias || b.nickname;
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
  }, [friends, searchTerm, sortOrder]);

  const favoriteFriends = useMemo(() => {
    return filteredFriends.filter((f) => favoriteIds.includes(f.friendId));
  }, [filteredFriends, favoriteIds]);

  const regularFriends = useMemo(() => {
    return filteredFriends;
  }, [filteredFriends]);

  const handleRowClick = (friendId: number, rowId: string) => {
    if (preventClick.current) {
      preventClick.current = false;
      return;
    }
    if (isSelectionMode) {
      onToggleSelect?.(friendId);
    } else {
      setExpandedId((prev) => (prev === rowId ? null : rowId));
    }
  };

  const handlePressStartInternal = (friendId: number) => {
    if (onPressStart) {
      onPressStart(friendId);
      return;
    }
    preventClick.current = false;
    internalLongPressTimer.current = setTimeout(() => {
      preventClick.current = true;
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 600);
  };

  const handlePressCancelInternal = () => {
    if (onPressCancel) {
      onPressCancel();
    }
    if (internalLongPressTimer.current) {
      clearTimeout(internalLongPressTimer.current);
    }
  };

  const renderFriendRows = (list: typeof filteredFriends, prefix: string) => {
    return list.map((friend) => {
      const rowId = `${prefix}-${friend.friendId}`;
      const isSelected = selectedIds.includes(friend.friendId);
      const isExpanded = expandedId === rowId;

      const year = getFriendStudentYear(friend.studentId);
      const safeFireId = normalizeProfileImageId(
        friend.fireId,
        DEFAULT_PROFILE_IMAGE_ID,
      );

      const showDetail = !isSelectionMode && isExpanded;

      return (
        <FriendRowWrapper key={friend.friendId} $expanded={isExpanded}>
          <RowInner>
            <RowHeader
              onMouseDown={() => handlePressStartInternal(friend.friendId)}
              onMouseUp={handlePressCancelInternal}
              onMouseLeave={handlePressCancelInternal}
              onTouchStart={() => handlePressStartInternal(friend.friendId)}
              onTouchEnd={handlePressCancelInternal}
              onTouchMove={handlePressCancelInternal}
              onClick={() => handleRowClick(friend.friendId, rowId)}
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
              <NameRow>{friend.friendAlias || friend.nickname}</NameRow>
            </RowHeader>

            <ExpandedDetailWrapper $expanded={showDetail}>
              <ExpandedDetailInner>
                <DetailContent>
                  <StudentInfoRow>
                    {year ? `${year} · ` : ""}
                    {friend.department ?? "-"}
                  </StudentInfoRow>
                  <ActionButtonRow>
                    <CircleActionButton
                      className="warn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `${ROUTES.TIMETABLE.COMPARE}?ids=${friend.friendId}`,
                        );
                      }}
                      title="시간표 비교"
                    >
                      <AlarmIcon />
                    </CircleActionButton>
                    <CircleActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        chatMutation.mutate([friend.friendId]);
                      }}
                      disabled={chatMutation.isPending}
                      title="1:1 채팅"
                    >
                      <ChatBubbleIcon />
                    </CircleActionButton>
                    <CircleActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFriendId(friend.friendId);
                        setSelectedMyId(null);
                        setIsProfileModalOpen(true);
                      }}
                      title="프로필 상세"
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
    });
  };

  const safeMyFireId = normalizeProfileImageId(
    userInfo?.fireId,
    DEFAULT_PROFILE_IMAGE_ID,
  );

  return (
    <ViewWrapper>
      <UserProfileModal
        memberId={selectedMyId}
        friendId={selectedFriendId}
        isOpen={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        isFavorite={
          selectedFriendId !== null && favoriteIds.includes(selectedFriendId)
        }
        onToggleFavorite={handleToggleFavorite}
      />
      <Modal
        isOpen={confirmModal !== null}
        onClose={() => setConfirmModal(null)}
        title={
          confirmModal?.type === "accept"
            ? "친구 요청 수락"
            : "친구 요청 거절"
        }
        description={
          confirmModal?.type === "accept"
            ? `${confirmModal.nickname}님의 친구 요청을 수락하시겠습니까?`
            : `${confirmModal?.nickname}님의 친구 요청을 거절하시겠습니까?`
        }
        primaryButton={{
          text: confirmModal?.type === "accept" ? "수락" : "거절",
          variant: confirmModal?.type === "accept" ? "brand" : "danger",
          onClick: () => {
            if (!confirmModal) return;
            if (confirmModal.type === "accept") {
              acceptMutation.mutate(confirmModal.friendId);
            } else {
              deleteMutation.mutate(confirmModal.friendId);
            }
            setConfirmModal(null);
          },
        }}
        secondaryButton={{
          text: "취소",
          onClick: () => setConfirmModal(null),
        }}
      />

      {/* 1. 내 프로필 카드 */}
      {isLoggedIn && !searchTerm.trim() && !isShareMode && !isSelectionMode && (
        <>
          <SectionHeader>내 프로필</SectionHeader>
          <FriendListContainer style={{ marginBottom: "16px" }}>
            <MyProfileRow
              onClick={() => {
                setSelectedMyId(userInfo.id);
                setSelectedFriendId(null);
                setIsProfileModalOpen(true);
              }}
            >
              <Ripple />
              <ProfileArea>
                <ProfileImage
                  src={`https://portal.inuappcenter.kr/images/profile/${safeMyFireId}`}
                  alt="Profile"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://portal.inuappcenter.kr/images/profile/default.png";
                  }}
                />
              </ProfileArea>
              <MyProfileInfo>
                <MyProfileName>{userInfo.nickname}</MyProfileName>
                <MyProfileDepartment>
                  {userInfo.department || "학과 정보 없음"}
                </MyProfileDepartment>
              </MyProfileInfo>
              <Icon
                name="chevron-right"
                size={20}
                color="var(--text-tertiary, #8b95a1)"
              />
            </MyProfileRow>
          </FriendListContainer>
        </>
      )}

      {/* 2. 받은 친구 요청 */}
      {pendingRequests.length > 0 &&
        !searchTerm.trim() &&
        !isShareMode &&
        !isSelectionMode && (
          <>
            <SectionHeader>
              받은 친구 요청 ({pendingRequests.length})
            </SectionHeader>
            <FriendListContainer style={{ marginBottom: "16px" }}>
              {pendingRequests.map((req, index) => (
                <div key={req.friendId} style={{ width: "100%" }}>
                  <SocialUserCard
                    name={req.nickname}
                    subtitle={req.studentId}
                    fireId={req.fireId}
                    onActionClick={() =>
                      setConfirmModal({
                        type: "accept",
                        friendId: req.friendId,
                        nickname: req.nickname,
                      })
                    }
                    onSecondaryActionClick={() =>
                      setConfirmModal({
                        type: "reject",
                        friendId: req.friendId,
                        nickname: req.nickname,
                      })
                    }
                    actionLabel="수락"
                    secondaryActionLabel="거절"
                  />
                  {index < pendingRequests.length - 1 && (
                    <Divider margin="0" />
                  )}
                </div>
              ))}
            </FriendListContainer>
          </>
        )}

      {/* 3. 내 친구 목록 헤더 및 정렬 */}
      <StatusSection>
        <TotalCountText>내 친구 ({filteredFriends.length})</TotalCountText>
        <SortIndicator
          onClick={() =>
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
          }
        >
          <span>{sortOrder === "asc" ? "오름차순" : "내림차순"}</span>
          {sortOrder === "asc" ? (
            <ArrowDownAZ size={18} color="#8B95A1" />
          ) : (
            <ArrowUpZA size={18} color="#8B95A1" />
          )}
        </SortIndicator>
      </StatusSection>

      {/* 4. 친구 리스트 렌더링 */}
      {friendsLoading ? (
        <FriendListContainer>
          {[1, 2, 3, 4, 5].map((i, idx) => (
            <div key={i} style={{ width: "100%" }}>
              <div
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  boxSizing: "border-box",
                }}
              >
                <Skeleton width="40px" height="40px" circle />
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <Skeleton width="120px" height="18px" />
                  <Skeleton width="180px" height="14px" />
                </div>
              </div>
              {idx < 4 && <Divider margin="0" />}
            </div>
          ))}
        </FriendListContainer>
      ) : filteredFriends.length > 0 ? (
        <>
          {favoriteFriends.length > 0 && !searchTerm.trim() && (
            <>
              <SectionHeader>즐겨찾기 ({favoriteFriends.length})</SectionHeader>
              <FriendListContainer style={{ marginBottom: "16px" }}>
                {renderFriendRows(favoriteFriends, "fav")}
              </FriendListContainer>
            </>
          )}

          {regularFriends.length > 0 && (
            <>
              {favoriteFriends.length > 0 && !searchTerm.trim() && (
                <SectionHeader>친구 ({regularFriends.length})</SectionHeader>
              )}
              <FriendListContainer>
                {renderFriendRows(regularFriends, "reg")}
              </FriendListContainer>
            </>
          )}
        </>
      ) : (
        <FriendListContainer>
          <EmptyContainer>
            <EmptyFriendsIllust />
            <EmptyTitle>
              {searchTerm ? "검색 결과가 없어요" : "친구가 없어요"}
            </EmptyTitle>
            <EmptyDescription>
              {searchTerm
                ? "다른 닉네임이나 학번으로 검색해보세요."
                : "+ 버튼을 눌러 친구를 추가하고\n친구와 시간표를 비교해보세요."}
            </EmptyDescription>
          </EmptyContainer>
        </FriendListContainer>
      )}
    </ViewWrapper>
  );
}

const ViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
`;

const StatusSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 4px;
  margin-bottom: 8px;
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

const SectionHeader = styled.div`
  font-family: Pretendard;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: var(--text-secondary, #6b7684);
  margin: 8px 0 8px 4px;
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

const MyProfileRow = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 14px 16px;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  background-color: transparent;
`;

const MyProfileInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 12px;
  overflow: hidden;
`;

const MyProfileName = styled.div`
  font-family: Pretendard;
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  color: var(--text-primary, #333d4b);
`;

const MyProfileDepartment = styled.div`
  font-family: Pretendard;
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  color: var(--text-tertiary, #8b95a1);
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
  padding: 12px 16px;
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
  border: 2px solid
    ${({ $selected }) => ($selected ? "#0061ff" : "rgba(0, 0, 0, 0.15)")};
  background-color: ${({ $selected }) =>
    $selected ? "rgba(0, 97, 255, 0.4)" : "transparent"};
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
  min-height: 40px;
  margin-left: 12px;
  box-sizing: border-box;
`;

const ExpandedDetailWrapper = styled.div<{ $expanded: boolean }>`
  display: grid;
  grid-template-rows: ${({ $expanded }) => ($expanded ? "1fr" : "0fr")};
  transition:
    grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.2, 1),
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
  padding: 4px 16px 12px 68px;
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
  width: 44px;
  height: 44px;
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

  &.warn,
  &.fav {
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
  padding: 60px 20px;
  box-sizing: border-box;
  width: 100%;
`;

const EmptyTitle = styled.h3`
  font-family: Pretendard;
  font-weight: 600;
  font-size: 18px;
  line-height: 28px;
  color: var(--text-primary, #333d4b);
  margin: 16px 0 6px 0;
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
  white-space: pre-line;
`;