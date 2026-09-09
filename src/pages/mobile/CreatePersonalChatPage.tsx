import styled from "styled-components";
import { ShieldCheck } from "lucide-react";
import { useHeader } from "@/context/HeaderContext";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { searchFriend } from "@/apis/friends";
import { createPersonalChatRoom } from "@/apis/chat";
import { ROUTES } from "@/constants/routes";
import useUserStore from "@/stores/useUserStore";
import Switch from "@/components/common/Switch";
import CapsuleButton from "@/components/common/CapsuleButton";
import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";
import FriendManagementView from "@/components/mobile/chat/FriendManagementView";
import { FriendResponseDto } from "@/types/friends";

export default function CreatePersonalChatPage() {
  const navigate = useNavigate();
  const { userInfo } = useUserStore();
  const isAdmin =
    userInfo?.role?.toLowerCase() === "admin" ||
    userInfo?.role === "ROLE_ADMIN";

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<FriendResponseDto[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<FriendResponseDto[]>([]);

  const searchMutation = useMutation({
    mutationFn: searchFriend,
    onSuccess: (res) => {
      const user = res.data;
      if (searchedUsers.some((u) => u.friendId === user.friendId)) {
        alert("이미 목록에 있는 유저입니다.");
        return;
      }
      setSearchedUsers((prev) => [user, ...prev]);
      setSearchTerm("");
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "유저를 찾을 수 없습니다.");
    },
  });

  const createMutation = useMutation({
    mutationFn: ({
      friendIds,
      title,
      adminMode,
    }: {
      friendIds: number[];
      title?: string;
      adminMode?: boolean;
    }) => createPersonalChatRoom(friendIds, title, adminMode),
    onSuccess: (res: any) => {
      const roomId = res.data?.id || res.id;
      if (roomId) {
        navigate(`${ROUTES.CHAT.ROOT}/${roomId}`);
      } else {
        alert("채팅방 생성은 완료되었으나 이동에 실패했습니다.");
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "채팅방 생성에 실패했습니다.");
    },
  });

  const toggleFriend = useCallback((friendId: number) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const currentList = isAdminMode ? searchedUsers : filteredFriends;
    if (currentList.length === 0) return;

    const allCurrentIds = currentList.map((f) => f.friendId);
    const isAllSelected = allCurrentIds.every((id) =>
      selectedFriendIds.includes(id),
    );

    if (isAllSelected) {
      setSelectedFriendIds((prev) =>
        prev.filter((id) => !allCurrentIds.includes(id)),
      );
    } else {
      setSelectedFriendIds((prev) =>
        Array.from(new Set([...prev, ...allCurrentIds])),
      );
    }
  }, [isAdminMode, searchedUsers, filteredFriends, selectedFriendIds]);

  const currentAvailableFriends = isAdminMode ? searchedUsers : filteredFriends;
  const isAllSelected =
    currentAvailableFriends.length > 0 &&
    currentAvailableFriends.every((f) =>
      selectedFriendIds.includes(f.friendId),
    );

  const headerRight = useMemo(() => {
    return (
      <HeaderActionButton onClick={handleSelectAll}>
        {isAllSelected ? "전체 해제" : "전체 선택"}
      </HeaderActionButton>
    );
  }, [handleSelectAll, isAllSelected]);

  useHeader({
    title: "대화 상대 선택",
    hasback: true,
    rightAreaNotCircle: true,
    rightArea: headerRight,
  });

  const handleCreate = () => {
    if (selectedFriendIds.length === 0) {
      alert("대화 상대를 한 명 이상 선택해주세요.");
      return;
    }
    createMutation.mutate({
      friendIds: selectedFriendIds,
      title: title.trim() || undefined,
      adminMode: isAdminMode,
    });
  };

  const handleSearchSubmit = () => {
    if (!isAdminMode) return;
    if (!searchTerm.trim()) return;
    searchMutation.mutate(searchTerm.trim());
  };

  return (
    <PageWrapper>
      {/* 1. 채팅방 이름 카드 */}
      <ChatTitleCard>
        <ChatTitleSection>
          <ChatTitleLabel>채팅방 이름</ChatTitleLabel>
          <ChatTitleInputWrapper>
            <ChatTitleInput
              value={isAdminMode ? "INTIP 운영자" : title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                selectedFriendIds.length > 1
                  ? "그룹 채팅 (기본값)"
                  : "상대방 이름 (기본값)"
              }
              disabled={isAdminMode}
            />
          </ChatTitleInputWrapper>
          {!isAdminMode && (
            <ChatTitleHints>
              <p className="hint-line">
                미입력 시 상대방의 닉네임이 이름으로 사용됩니다.
              </p>
              <p className="hint-line">
                설정한 그룹채팅방의 이름은 나에게만 표시되는 이름으로 설정돼요.
              </p>
            </ChatTitleHints>
          )}
        </ChatTitleSection>

        {isAdmin && (
          <AdminToggleRow>
            <AdminLabelArea>
              <ShieldCheck size={20} color="#5E92F0" />
              <AdminLabelText>공식 메시지 모드 (Admin)</AdminLabelText>
            </AdminLabelArea>
            <Switch
              checked={isAdminMode}
              onCheckedChange={(checked) => {
                setIsAdminMode(checked);
                setSelectedFriendIds([]);
                setSearchedUsers([]);
                setTitle("");
                setSearchTerm("");
              }}
            />
          </AdminToggleRow>
        )}
      </ChatTitleCard>

      {/* 2. 검색 바 */}
      <SearchBarWrapper>
        <MobilePillSearchBar
          variant="clean"
          value={searchTerm}
          onChange={setSearchTerm}
          onSubmit={handleSearchSubmit}
          placeholder={
            isAdminMode
              ? "학번으로 유저 검색 후 추가"
              : "닉네임, 학번으로 검색"
          }
        />
      </SearchBarWrapper>

      {/* 3. 친구 목록 (FriendManagementView 공용 컴포넌트 활용) */}
      <FriendManagementView
        searchTerm={searchTerm}
        isSelectionMode={true}
        selectedIds={selectedFriendIds}
        onToggleSelect={toggleFriend}
        showMyProfile={false}
        showPendingRequests={false}
        customFriends={isAdminMode ? searchedUsers : undefined}
        onFilteredFriendsChange={setFilteredFriends}
      />

      {/* 4. 하단 고정 만들기 버튼 */}
      <FixedFooter>
        <FixedFooterContent>
          <CreateButton
            variant="primary"
            fullWidth
            disabled={selectedFriendIds.length === 0 || createMutation.isPending}
            onClick={handleCreate}
          >
            {createMutation.isPending
              ? "채팅방 생성 중..."
              : `채팅방 만들기 (${selectedFriendIds.length}명)`}
          </CreateButton>
        </FixedFooterContent>
      </FixedFooter>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: 24px ${MOBILE_PAGE_GUTTER} 120px;
  background-color: var(--bg-subtle, #f8f9fb);
`;

const ChatTitleCard = styled.div`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 12px;
  width: 100%;
  box-sizing: border-box;
`;

const ChatTitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const AdminToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  padding: 0 4px 4px 4px;
`;

const AdminLabelArea = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AdminLabelText = styled.span`
  font-family: Pretendard;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  color: var(--text-secondary, #333d4b);
`;

const ChatTitleLabel = styled.p`
  font-family: Pretendard;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.4;
  color: var(--text-secondary, #333d4b);
  margin: 0;
`;

const ChatTitleInputWrapper = styled.div`
  background: var(--bg-subtle, #f8f9fb);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: var(--interactive-primary, #0061ff);
  }
`;

const ChatTitleInput = styled.input`
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-family: Pretendard;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary, #191f28);
  padding: 0;

  &::placeholder {
    color: var(--text-tertiary, #8b95a1);
  }

  &:disabled {
    color: var(--text-disabled, #b0b8c1);
  }
`;

const ChatTitleHints = styled.div`
  font-family: Pretendard;
  font-weight: 400;
  font-size: 12px;
  color: var(--text-tertiary, #8b95a1);
  margin-top: 4px;

  .hint-line {
    margin: 0;
    line-height: 16px;
  }
`;

const SearchBarWrapper = styled.div`
  width: 100%;
`;

const HeaderActionButton = styled.button`
  border: none;
  background: none;
  font-family: Pretendard;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.4;
  color: var(--text-brand, #0061ff);
  cursor: pointer;
  outline: none;
  padding: 8px 12px;
  white-space: nowrap;

  &:active {
    opacity: 0.7;
  }
`;

const FixedFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: linear-gradient(
    180deg,
    rgba(248, 249, 251, 0) 0%,
    rgba(248, 249, 251, 0.45) 45%,
    rgba(248, 249, 251, 0.85) 100%
  );
  z-index: 100;
  pointer-events: none;
`;

const FixedFooterContent = styled.div`
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  padding: 16px 24px calc(24px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  pointer-events: auto;
`;

const CreateButton = styled(CapsuleButton)`
  color: #fff;
  text-align: center;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: -0.2px;
  border-radius: 999px;
  background: var(--interactive-primary, #0061ff);
  height: 48px;
  padding: 12px 24px;

  &:disabled {
    border-color: var(--border-default, #e5e8eb);
    background: var(--bg-disabled, #e5e8eb);
    color: var(--text-disabled, #b0b8c1);
    cursor: not-allowed;
    box-shadow: none;
  }
`;
