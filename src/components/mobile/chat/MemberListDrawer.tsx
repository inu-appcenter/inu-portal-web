import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, LogOut, Trash2 } from "lucide-react"; // LogOut, Trash2 아이콘 추가
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import SocialUserCard from "@/components/mobile/social/SocialUserCard";
import { useNavigate } from "react-router-dom";
import { getChatRoomMembers, leaveChatRoom, closeChatRoom } from "@/apis/chat";
import { blockUser } from "@/apis/blocks";

const contentShow = keyframes`
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

import { ChatRoom } from "@/types/chat";

interface MemberListDrawerProps {
  roomId: string | number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roomInfo: ChatRoom | null;
}

export default function MemberListDrawer({
  roomId,
  isOpen,
  onOpenChange,
  roomInfo,
}: MemberListDrawerProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
    if (
      confirm(
        `${nickname}님을 차단하시겠습니까?\n차단 시 해당 유저의 메시지가 더 이상 보이지 않으며 친구 관계가 해제됩니다.`,
      )
    ) {
      blockMutation.mutate(memberId);
    }
  };

  const leaveMutation = useMutation({
    mutationFn: () => leaveChatRoom(roomId),
    onSuccess: () => {
      alert("채팅방에서 나갔습니다.");
      queryClient.invalidateQueries({ queryKey: ["myChatRooms"] });
      queryClient.invalidateQueries({ queryKey: ["unreadTotalCount"] });
      onOpenChange(false);
      navigate("/chat/list", { replace: true });
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "채팅방 나가기에 실패했습니다.");
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => closeChatRoom(roomId),
    onSuccess: () => {
      alert("채팅방이 폐쇄되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["myChatRooms"] });
      queryClient.invalidateQueries({ queryKey: ["unreadTotalCount"] });
      onOpenChange(false);
      navigate("/chat/list", { replace: true });
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "채팅방 폐쇄에 실패했습니다.");
    },
  });

  const handleLeave = () => {
    if (
      confirm(
        "채팅방에서 나가시겠습니까?\n나간 후에는 이전 대화 내용을 볼 수 없습니다.",
      )
    ) {
      leaveMutation.mutate();
    }
  };

  const handleClose = () => {
    if (
      confirm(
        "오픈채팅방을 폐쇄하시겠습니까?\n폐쇄 시 모든 참여자가 대화할 수 없게 됩니다.",
      )
    ) {
      closeMutation.mutate();
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
            <Box style={{ padding: "0 16px" }}>
              {isLoading ? (
                <EmptyState>멤버를 불러오는 중...</EmptyState>
              ) : (
                members.map((member, index) => (
                  <div
                    key={`${member.nickname}-${index}`}
                    style={{ width: "100%" }}
                  >
                    <SocialUserCard
                      name={
                        member.nickname +
                        (member.me ? " (나)" : "") +
                        (member.isOwner ? " (방장)" : "")
                      }
                      subtitle={member.studentId || "익명"}
                      fireId={member.fireId || 0}
                      onActionClick={
                        !member.me && member.fireId
                          ? () => handleBlock(member.fireId!, member.nickname)
                          : undefined
                      }
                      actionLabel="차단"
                    />
                    {index < members.length - 1 && <Divider />}
                  </div>
                ))
              )}
            </Box>
          </ScrollArea>

          <Footer>
            {roomInfo?.type === "OPEN" && roomInfo?.isOwner && (
              <ActionButton onClick={handleClose} $variant="danger">
                <Trash2 size={20} />
                오픈채팅방 폐쇄
              </ActionButton>
            )}
            <ActionButton onClick={handleLeave}>
              <LogOut size={20} />
              채팅방 나가기
            </ActionButton>
          </Footer>
        </StyledContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const Footer = styled.div`
  padding: 16px;
  border-top: 1px solid #f2f2f7;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActionButton = styled.button<{ $variant?: "danger" | "default" }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  background-color: ${(props) =>
    props.$variant === "danger" ? "#FFF5F5" : "#F2F2F7"};
  color: ${(props) => (props.$variant === "danger" ? "#FF3B30" : "#1C1C1E")};

  &:active {
    opacity: 0.7;
  }
`;

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
  border-bottom: 1px solid #f2f2f7;
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
