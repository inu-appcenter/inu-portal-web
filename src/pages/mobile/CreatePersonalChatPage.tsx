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
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
  const [title, setTitle] = useState("");
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
      if (searchedUsers.some((u) => u.friendId === user.friendId)) {
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
    mutationFn: (friendIds: number[]) => createPersonalChatRoom(friendIds),
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

  const toggleFriend = (friendId: number) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
  };

  const handleCreate = () => {
    if (selectedFriendIds.length === 0) {
      alert("대화 상대를 한 명 이상 선택해주세요.");
      return;
    }
    createMutation.mutate(selectedFriendIds);
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
            <ShieldCheck size={20} color="#5E92F0" />
            <span>공식 메시지 모드 (Admin)</span>
          </div>
          <Switch
            checked={isAdminMode}
            onCheckedChange={(checked) => {
              setIsAdminMode(checked);
              setSelectedFriendIds([]);
              setSearchedUsers([]);
              setTitle("");
            }}
          />
        </AdminToggleArea>
      )}

      <Box style={{ padding: "16px" }}>
        <InputWrapper>
          <div className="label">채팅방 이름</div>
          <TitleInput
            value={isAdminMode ? "INTIP 운영자" : title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              selectedFriendIds.length > 1
                ? "그룹 채팅 (기본값)"
                : "상대방 이름 (기본값)"
            }
            disabled={isAdminMode}
          />
          {!isAdminMode && (
            <p className="hint">
              {selectedFriendIds.length > 1
                ? "미입력 시 '그룹 채팅'으로 설정됩니다."
                : "미입력 시 상대방의 닉네임이 이름으로 사용됩니다."}
            </p>
          )}
        </InputWrapper>
      </Box>

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
              <div key={user.friendId} style={{ width: "100%" }}>
                <SelectableCard onClick={() => toggleFriend(user.friendId)}>
                  <SocialUserCard
                    name={user.nickname}
                    subtitle={user.studentId}
                    fireId={user.fireId}
                  />
                  <Checkbox
                    $selected={selectedFriendIds.includes(user.friendId)}
                  >
                    {selectedFriendIds.includes(user.friendId) && (
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
            <div key={friend.friendId} style={{ width: "100%" }}>
              <SelectableCard onClick={() => toggleFriend(friend.friendId)}>
                <SocialUserCard
                  name={friend.nickname}
                  subtitle={friend.studentId}
                  fireId={friend.fireId}
                />
                <Checkbox
                  $selected={selectedFriendIds.includes(friend.friendId)}
                >
                  {selectedFriendIds.includes(friend.friendId) && (
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
          disabled={selectedFriendIds.length === 0 || createMutation.isPending}
          onClick={handleCreate}
          $isAdmin={isAdminMode}
        >
          {createMutation.isPending
            ? "채팅방 생성 중..."
            : isAdminMode
              ? `공식 방 만들기 (${selectedFriendIds.length}명)`
              : `방 만들기 (${selectedFriendIds.length}명)`}
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

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .label {
    font-size: 14px;
    font-weight: 600;
    color: #1c1c1e;
    margin-left: 4px;
  }

  .hint {
    font-size: 12px;
    color: #8e8e93;
    margin-left: 4px;
    margin-top: 4px;
  }
`;

const TitleInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  font-size: 15px;
  color: #1c1c1e;
  background-color: ${({ disabled }) => (disabled ? "#F2F2F7" : "white")};

  &::placeholder {
    color: #aeaeb2;
  }

  &:focus {
    outline: none;
    border-color: #5E92F0;
  }
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
  border: 2px solid ${({ $selected }) => ($selected ? "#5E92F0" : "#E5E5EA")};
  background-color: ${({ $selected }) =>
    $selected ? "#5E92F0" : "transparent"};
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
  padding: 16px ${MOBILE_PAGE_GUTTER}
    calc(32px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(to top, white 80%, transparent);
  z-index: 100;
`;

const SubmitButton = styled.button<{ $isAdmin?: boolean }>`
  width: 100%;
  height: 56px;
  background-color: ${({ $isAdmin }) => ($isAdmin ? "#1C1C1E" : "#5E92F0")};
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px
    ${({ $isAdmin }) =>
      $isAdmin ? "rgba(0, 0, 0, 0.2)" : "rgba(94, 146, 240, 0.3)"};
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
