import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSentPendingFriends, deleteFriend } from "@/apis/friends";
import SocialUserCard from "@/components/mobile/social/SocialUserCard";
import Divider from "@/components/common/Divider";
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

  const cancelMutation = useMutation({
    mutationFn: deleteFriend,
    onSuccess: () => {
      alert("요청이 취소되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["sentPendingFriends"] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "요청 취소에 실패했습니다.");
    },
  });

  const sentRequests = sentRes?.data || [];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <Header>
            <Title>보낸 친구 요청 목록</Title>
            <CloseButton onClick={() => onOpenChange(false)}>
              <X size={24} color="#1C1C1E" />
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
                      onActionClick={() => {
                        if (confirm("보낸 친구 요청을 취소하시겠습니까?")) {
                          cancelMutation.mutate(req.friendId);
                        }
                      }}
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
  display: flex;
  justify-content: space-between;
  align-items: center;
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
