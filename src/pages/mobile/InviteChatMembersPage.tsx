import styled from "styled-components";
import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getFriends } from "@/apis/friends";
import { getChatRoomMembers, inviteFriendsToChatRoom } from "@/apis/chat";
import { useHeader } from "@/context/HeaderContext";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import CapsuleButton from "@/components/common/CapsuleButton";
import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";
import FriendManagementView from "@/components/mobile/chat/FriendManagementView";

export default function InviteChatMembersPage() {
  const { roomId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<any[]>([]);

  const { data: membersRes } = useQuery({
    queryKey: ["chatMembers", roomId],
    queryFn: () => getChatRoomMembers(roomId),
    enabled: Boolean(roomId),
  });
  const { data: friendsRes } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });

  const inviteableFriends = useMemo(() => {
    const members = membersRes?.data || [];
    return (friendsRes?.data || []).filter(
      (friend) =>
        !members.some(
          (member) =>
            (member.studentId && member.studentId === friend.studentId) ||
            member.nickname === friend.nickname,
        ),
    );
  }, [friendsRes, membersRes]);

  const toggleFriend = useCallback((friendId: number) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const ids = filteredFriends.map((friend) => friend.friendId);
    if (!ids.length) return;
    setSelectedFriendIds((prev) =>
      ids.every((id) => prev.includes(id))
        ? prev.filter((id) => !ids.includes(id))
        : Array.from(new Set([...prev, ...ids])),
    );
  }, [filteredFriends]);

  const inviteMutation = useMutation({
    mutationFn: () => inviteFriendsToChatRoom(roomId, selectedFriendIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatMembers", roomId] });
      queryClient.invalidateQueries({ queryKey: ["myChatRooms"] });
      navigate(-1);
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "초대에 실패했습니다.");
    },
  });

  const allSelected =
    filteredFriends.length > 0 &&
    filteredFriends.every((friend) => selectedFriendIds.includes(friend.friendId));

  const headerRight = useMemo(
    () => (
      <HeaderActionButton onClick={handleSelectAll}>
        {allSelected ? "전체 해제" : "전체 선택"}
      </HeaderActionButton>
    ),
    [allSelected, handleSelectAll],
  );

  useHeader({
    title: "대화 상대 초대",
    hasback: true,
    rightAreaNotCircle: true,
    rightArea: headerRight,
  });

  return (
    <PageWrapper>
      <SearchBarWrapper>
        <MobilePillSearchBar
          variant="clean"
          value={searchTerm}
          onChange={setSearchTerm}
          onSubmit={() => undefined}
          placeholder="닉네임, 학번으로 검색"
        />
      </SearchBarWrapper>

      <FriendManagementView
        searchTerm={searchTerm}
        isSelectionMode
        selectedIds={selectedFriendIds}
        onToggleSelect={toggleFriend}
        showMyProfile={false}
        showPendingRequests={false}
        customFriends={inviteableFriends}
        onFilteredFriendsChange={setFilteredFriends}
      />

      <FixedFooter>
        <FixedFooterContent>
          <InviteButton
            variant="primary"
            fullWidth
            disabled={selectedFriendIds.length === 0 || inviteMutation.isPending}
            onClick={() => inviteMutation.mutate()}
          >
            {inviteMutation.isPending
              ? "초대 중..."
              : `초대하기 (${selectedFriendIds.length}명)`}
          </InviteButton>
        </FixedFooterContent>
      </FixedFooter>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 24px ${MOBILE_PAGE_GUTTER} 120px;
  background: var(--bg-subtle, #f8f9fb);
`;

const SearchBarWrapper = styled.div`
  width: 100%;
`;

const HeaderActionButton = styled.button`
  border: none;
  background: none;
  padding: 8px 12px;
  color: var(--text-brand, #0061ff);
  font: 500 16px/1.4 Pretendard;
  white-space: nowrap;
`;

const FixedFooter = styled.div`
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(248, 249, 251, 0), rgba(248, 249, 251, 0.9) 45%);
`;

const FixedFooterContent = styled.div`
  max-width: 768px;
  margin: 0 auto;
  padding: 16px 24px calc(24px + env(safe-area-inset-bottom, 0px));
  pointer-events: auto;
`;

const InviteButton = styled(CapsuleButton)`
  height: 48px;
  border-radius: 999px;
  font: 700 16px/24px Pretendard;

  &:disabled {
    background: var(--bg-disabled, #e5e8eb);
    color: var(--text-disabled, #b0b8c1);
  }
`;
