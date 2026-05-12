import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getFriends, searchFriend } from "@/apis/friends";
import { createPersonalChatRoom } from "@/apis/chat";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import SocialUserCard from "@/components/mobile/social/SocialUserCard";
import { ROUTES } from "@/constants/routes";
import { Check, ShieldCheck } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import useUserStore from "@/stores/useUserStore";
import Switch from "@/components/common/Switch";
import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";
import { FriendResponseDto } from "@/types/friends";

export default function CreatePersonalChatPage() {
  const navigate = useNavigate();
  const { userInfo } = useUserStore();
  const isAdmin = userInfo?.role === "admin";

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [studentIdSearch, setStudentIdSearch] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<FriendResponseDto[]>([]);

  const { data: friendsRes, isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
    enabled: !isAdminMode,
  });

  const friends = friendsRes?.data || [];

  const searchMutation = useMutation({
    mutationFn: searchFriend,
    onSuccess: (res) => {
      const user = res.data;
      if (searchedUsers.some((u) => u.memberId === user.memberId)) {
        alert("이미 목록에 있는 유저입니다.");
        return;
      }
      setSearchedUsers((prev) => [user, ...prev]);
      setStudentIdSearch("");
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "유저를 찾을 수 없습니다.");
    },
  });

  const createMutation = useMutation({
    mutationFn: ({ ids, isAdmin }: { ids: number[]; isAdmin: boolean }) =>
      createPersonalChatRoom(ids, isAdmin),
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

  useHeader({
    title: "대화 상대 선택",
    hasback: true,
  });

  const toggleMember = (memberId: number) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  };

  const handleCreate = () => {
    if (selectedMemberIds.length === 0) {
      alert("대화 상대를 한 명 이상 선택해주세요.");
      return;
    }
    createMutation.mutate({ ids: selectedMemberIds, isAdmin: isAdminMode });
  };

  const handleSearch = () => {
    if (!studentIdSearch.trim()) return;
    searchMutation.mutate(studentIdSearch.trim());
  };

  return (
    <Container>
      {isAdmin && (
        <AdminToggleArea>
          <div className="label">
            <ShieldCheck size={20} color="#5844E4" />
            <span>공식 메시지 모드 (Admin)</span>
          </div>
          <Switch
            checked={isAdminMode}
            onCheckedChange={(checked) => {
              setIsAdminMode(checked);
              setSelectedMemberIds([]);
              setSearchedUsers([]);
            }}
          />
        </AdminToggleArea>
      )}

      {isAdminMode && (
        <SearchArea>
          <MobilePillSearchBar
            value={studentIdSearch}
            onChange={setStudentIdSearch}
            onSubmit={handleSearch}
            placeholder="학번으로 유저 검색 후 추가"
          />
        </SearchArea>
      )}

      <Box>
        {isAdminMode ? (
          searchedUsers.length > 0 ? (
            searchedUsers.map((user, index) => (
              <div key={user.memberId} style={{ width: "100%" }}>
                <SelectableCard onClick={() => toggleMember(user.memberId)}>
                  <SocialUserCard
                    name={user.nickname}
                    subtitle={user.studentId}
                    fireId={user.fireId}
                  />
                  <Checkbox
                    $selected={selectedMemberIds.includes(user.memberId)}
                  >
                    {selectedMemberIds.includes(user.memberId) && (
                      <Check size={16} color="white" strokeWidth={3} />
                    )}
                  </Checkbox>
                </SelectableCard>
                {index < searchedUsers.length - 1 && <Divider />}
              </div>
            ))
          ) : (
            <EmptyState>학번을 검색하여 대화 상대를 추가하세요.</EmptyState>
          )
        ) : isLoading ? (
          <EmptyState>친구 목록을 불러오는 중...</EmptyState>
        ) : friends.length > 0 ? (
          friends.map((friend, index) => (
            <div key={friend.memberId} style={{ width: "100%" }}>
              <SelectableCard onClick={() => toggleMember(friend.memberId)}>
                <SocialUserCard
                  name={friend.nickname}
                  subtitle={friend.studentId}
                  fireId={friend.fireId}
                />
                <Checkbox
                  $selected={selectedMemberIds.includes(friend.memberId)}
                >
                  {selectedMemberIds.includes(friend.memberId) && (
                    <Check size={16} color="white" strokeWidth={3} />
                  )}
                </Checkbox>
              </SelectableCard>
              {index < friends.length - 1 && <Divider />}
            </div>
          ))
        ) : (
          <EmptyState>선택 가능한 친구가 없습니다.</EmptyState>
        )}
      </Box>

      <FixedFooter>
        <SubmitButton
          disabled={selectedMemberIds.length === 0 || createMutation.isPending}
          onClick={handleCreate}
          $isAdmin={isAdminMode}
        >
          {createMutation.isPending
            ? "채팅방 생성 중..."
            : isAdminMode
              ? `공식 방 만들기 (${selectedMemberIds.length}명)`
              : `방 만들기 (${selectedMemberIds.length}명)`}
        </SubmitButton>
      </FixedFooter>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px ${MOBILE_PAGE_GUTTER} 120px;
  gap: 20px;
`;

const AdminToggleArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #f8f9ff;
  border: 1px solid #e0e4ff;
  border-radius: 16px;

  .label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #1c1c1e;
  }
`;

const SearchArea = styled.div`
  margin-bottom: 8px;
`;

const SelectableCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  width: 100%;
  padding: 4px 0;

  & > :first-child {
    flex: 1;
    pointer-events: none;
  }
`;

const Checkbox = styled.div<{ $selected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${({ $selected }) => ($selected ? "#5844E4" : "#E5E5EA")};
  background-color: ${({ $selected }) =>
    $selected ? "#5844E4" : "transparent"};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: 12px;
`;

const FixedFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px ${MOBILE_PAGE_GUTTER} 32px;
  background: linear-gradient(to top, white 80%, transparent);
  z-index: 100;
`;

const SubmitButton = styled.button<{ $isAdmin?: boolean }>`
  width: 100%;
  height: 56px;
  background-color: ${({ $isAdmin }) => ($isAdmin ? "#1C1C1E" : "#5844E4")};
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px
    ${({ $isAdmin }) =>
      $isAdmin ? "rgba(0, 0, 0, 0.2)" : "rgba(88, 68, 228, 0.3)"};
  transition: all 0.2s;

  &:disabled {
    background-color: #e5e5ea;
    color: #8e8e93;
    box-shadow: none;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;
