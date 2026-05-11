import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getFriends } from "@/apis/friends";
import { createPersonalChatRoom } from "@/apis/chat";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import SocialUserCard from "@/components/mobile/social/SocialUserCard";
import { ROUTES } from "@/constants/routes";
import { Check } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";

export default function CreatePersonalChatPage() {
  const navigate = useNavigate();
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);

  const { data: friendsRes, isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });

  const friends = friendsRes?.data || [];

  const createMutation = useMutation({
    mutationFn: createPersonalChatRoom,
    onSuccess: (res: any) => {
      // res.data.id (roomId)를 사용하여 채팅방으로 이동
      const roomId = res.data?.id || res.id;
      if (roomId) {
        navigate(`${ROUTES.CHAT.ROOT}/${roomId}`);
      } else {
        console.error("채팅방 ID를 찾을 수 없습니다:", res);
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
    createMutation.mutate(selectedMemberIds);
  };

  return (
    <Container>
      <Box>
        {isLoading ? (
          <EmptyState>친구 목록을 불러오는 중...</EmptyState>
        ) : friends.length > 0 ? (
          friends.map((friend, index) => (
            <div key={friend.memberId}>
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
        >
          {createMutation.isPending
            ? "채팅방 생성 중..."
            : `방 만들기 (${selectedMemberIds.length}명)`}
        </SubmitButton>
      </FixedFooter>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px ${MOBILE_PAGE_GUTTER} 100px;
  gap: 20px;
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
    pointer-events: none; /* SocialUserCard 내부 클릭 무시 */
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

const SubmitButton = styled.button`
  width: 100%;
  height: 56px;
  background-color: #5844e4;
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(88, 68, 228, 0.3);
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
