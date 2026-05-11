import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import SocialUserCard from "@/components/mobile/social/SocialUserCard";
import { getChatRoomMembers } from "@/apis/chat";
import { blockUser } from "@/apis/blocks";

const contentShow = keyframes`
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

interface MemberListDrawerProps {
  roomId: string | number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MemberListDrawer({
  roomId,
  isOpen,
  onOpenChange,
}: MemberListDrawerProps) {
  const queryClient = useQueryClient();

  const { data: membersRes, isLoading } = useQuery({
    queryKey: ["chatMembers", roomId],
    queryFn: () => getChatRoomMembers(roomId),
    enabled: isOpen,
  });

  const blockMutation = useMutation({
    mutationFn: blockUser,
    onSuccess: () => {
      alert("유저를 차단했습니다.");
      queryClient.invalidateQueries({ queryKey: ["chatMembers", roomId] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "차단에 실패했습니다.");
    },
  });

  const handleBlock = (memberId: number, nickname: string) => {
    if (confirm(`${nickname}님을 차단하시겠습니까?\n차단 시 해당 유저의 메시지가 더 이상 보이지 않으며 친구 관계가 해제됩니다.`)) {
      blockMutation.mutate(memberId);
    }
  };

  const members = membersRes?.data || [];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <Header>
            <Title>대화 상대 ({members.length})</Title>
            <CloseButton onClick={() => onOpenChange(false)}>
              <X size={24} color="#1C1C1E" />
            </CloseButton>
          </Header>
          
          <ScrollArea>
            <Box style={{ padding: '0 16px' }}>
              {isLoading ? (
                <EmptyState>멤버를 불러오는 중...</EmptyState>
              ) : (
                members.map((member, index) => (
                  <div key={`${member.nickname}-${index}`}>
                    <SocialUserCard
                      name={member.nickname + (member.me ? " (나)" : "")}
                      subtitle={member.studentId || "익명"}
                      fireId={member.fireId || 0}
                      onActionClick={!member.me && member.fireId ? () => handleBlock(member.fireId!, member.nickname) : undefined}
                      actionLabel="차단"
                    />
                    {index < members.length - 1 && <Divider />}
                  </div>
                ))
              )}
            </Box>
          </ScrollArea>
        </StyledContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const StyledOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.4);
  animation: ${fadeIn} 200ms ease-out;
`;

const StyledContent = styled(Dialog.Content)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 80vw;
  max-width: 320px;
  background-color: white;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  outline: none;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  animation: ${contentShow} 250ms cubic-bezier(0.16, 1, 0.3, 1);
`;

const Header = styled.div`
  padding: 20px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #F2F2F7;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #1c1c1e;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
`;

const EmptyState = styled.div`
  padding: 40px 0;
  text-align: center;
  color: #969696;
  font-size: 14px;
`;
