import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSentPendingFriends, cancelFriendRequest } from "@/apis/friends";
import {
  getAlreadyProcessedFriendRequestNotice,
  isFriendRequestAlreadyProcessed,
  tryLockFriendRequest,
  unlockFriendRequest,
} from "@/utils/friendRequestLock";
import SocialUserCard from "@/components/mobile/social/SocialUserCard";
import Divider from "@/components/common/Divider";
import Icon from "@/components/common/Icon";
import EmptyState from "@/components/common/EmptyState";
import { useSheetBackHandler } from "@/hooks/useSheetBackHandler";

const contentShow = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

interface SentRequestsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SentRequestsModal({
  isOpen,
  onOpenChange,
}: SentRequestsModalProps) {
  useSheetBackHandler(isOpen, () => onOpenChange(false));
  const queryClient = useQueryClient();

  const { data: sentRes, isLoading } = useQuery({
    queryKey: ["sentPendingFriends"],
    queryFn: getSentPendingFriends,
    enabled: isOpen,
  });

  // 취소는 서버가 PENDING일 때만 지운다. 상대가 먼저 수락(409)했거나 요청이 이미
  // 없어졌으면(404) 실패가 아니라 목록만 맞춘다. 잠금 해제는 모달이 닫혀도 실행되도록
  // useMutation 옵션에 둔다.
  const cancelMutation = useMutation({
    mutationFn: cancelFriendRequest,
    onSuccess: () => {
      alert("요청이 취소되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["sentPendingFriends"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: unknown) => {
      if (isFriendRequestAlreadyProcessed(error)) {
        queryClient.invalidateQueries({ queryKey: ["sentPendingFriends"] });
        queryClient.invalidateQueries({ queryKey: ["friends"] });
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        const notice = getAlreadyProcessedFriendRequestNotice(error);
        if (notice) alert(notice);
        return;
      }
      const msg = (error as { response?: { data?: { msg?: string } } })
        .response?.data?.msg;
      alert(msg || "요청 취소에 실패했습니다.");
    },
    onSettled: (_data: unknown, _error: unknown, friendId: number) => {
      unlockFriendRequest(friendId);
    },
  });

  const handleCancel = (friendId: number) => {
    if (!confirm("보낸 친구 요청을 취소하시겠습니까?")) return;
    // 연타·다른 화면(프로필)에서의 동시 취소를 동기 잠금으로 막는다.
    if (!tryLockFriendRequest(friendId)) return;
    cancelMutation.mutate(friendId);
  };

  const sentRequests = sentRes?.data || [];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <Header>
            <Title>보낸 친구 요청 목록</Title>
            <CloseButton onClick={() => onOpenChange(false)}>
              <Icon name="close-md" size={24} color="var(--text-primary)" />
            </CloseButton>
          </Header>
          <ScrollArea>
            {isLoading ? (
              <EmptyState>불러오는 중...</EmptyState>
            ) : sentRequests.length > 0 ? (
              <div>
                {sentRequests.map((req, index) => (
                  <div key={req.friendId} style={{ width: "100%" }}>
                    <SocialUserCard
                      name={req.nickname}
                      subtitle={req.studentId}
                      fireId={req.fireId}
                      onActionClick={() => handleCancel(req.friendId)}
                      actionLabel="취소"
                    />
                    {index < sentRequests.length - 1 && <Divider />}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>보낸 친구 요청이 없습니다.</EmptyState>
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
  background-color: var(--bg-base);
  border-radius: 24px;
  z-index: 2001;
  display: flex;
  flex-direction: column;
  outline: none;
  animation: ${contentShow} 250ms cubic-bezier(0.16, 1, 0.3, 1);
`;

const Header = styled.div`
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
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
