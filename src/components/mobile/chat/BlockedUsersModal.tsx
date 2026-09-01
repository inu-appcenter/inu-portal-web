import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import Icon from "@/components/common/Icon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBlockedUsers, unblockUser } from "@/apis/blocks";
import SocialUserCard from "@/components/mobile/social/SocialUserCard";
import Divider from "@/components/common/Divider";
import { useSheetBackHandler } from "@/hooks/useSheetBackHandler";

const contentShow = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

interface BlockedUsersModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** 진입 지점에 따라 제목을 바꾼다. (채팅: 차단 친구 관리 / 마이페이지: 차단 사용자 관리) */
  title?: string;
}

export default function BlockedUsersModal({
  isOpen,
  onOpenChange,
  title = "차단 친구 관리",
}: BlockedUsersModalProps) {
  useSheetBackHandler(isOpen, () => onOpenChange(false));
  const queryClient = useQueryClient();

  const { data: blockedRes, isLoading } = useQuery({
    queryKey: ["blockedUsers"],
    queryFn: getBlockedUsers,
    enabled: isOpen,
  });

  const unblockMutation = useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      alert("차단이 해제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });

  const blockedUsers = blockedRes?.data || [];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <Header>
            <TitleArea>
              <Title>{title}</Title>
            </TitleArea>
            <CloseButton onClick={() => onOpenChange(false)}>
              <Icon name="close-md" size={24} color="#1C1C1E" />
            </CloseButton>
          </Header>
          <ScrollArea>
            {isLoading ? (
              <EmptyState>불러오는 중...</EmptyState>
            ) : blockedUsers.length > 0 ? (
              <div>
                {blockedUsers.map((user, index) => (
                  <div key={user.blockId}>
                    <SocialUserCard
                      name={user.nickname}
                      subtitle={user.studentId}
                      onActionClick={() =>
                        unblockMutation.mutate(user.blockedMemberId)
                      }
                      actionLabel="차단 해제"
                    />
                    {index < blockedUsers.length - 1 && <Divider />}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>차단한 유저가 없습니다.</EmptyState>
            )}
          </ScrollArea>
        </StyledContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const StyledOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.4);
  animation: ${fadeIn} 200ms ease-out;
  backdrop-filter: blur(4px);
`;

const StyledContent = styled(Dialog.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 400px;
  height: 60vh;
  background-color: white;
  border-radius: 24px;
  z-index: 2001;
  display: flex;
  flex-direction: column;
  outline: none;
  animation: ${contentShow} 250ms cubic-bezier(0.16, 1, 0.3, 1);
`;

const Header = styled.div`
  padding: 20px;
  padding-bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Title = styled.h2`
  font-size: 20px;
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
  padding: 20px 0;
`;

const EmptyState = styled.div`
  padding: 60px 24px;
  text-align: center;
  color: #969696;
  font-size: 14px;
`;
