import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, LogOut, Trash2, Bell, BellOff, Edit3 } from "lucide-react"; // LogOut, Trash2 아이콘 추가
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import SocialUserCard from "@/components/mobile/social/SocialUserCard";
import { useNavigate } from "react-router-dom";
import {
  getChatRoomMembers,
  leaveChatRoom,
  closeChatRoom,
  patchRoomPushSetting,
} from "@/apis/chat";
import useUserStore from "@/stores/useUserStore";
import UserProfileModal from "@/components/mobile/social/UserProfileModal";
import EditChatModal from "@/components/mobile/chat/EditChatModal";
import { useState } from "react";

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
  refreshRoom?: () => void;
}

export default function MemberListDrawer({
  roomId,
  isOpen,
  onOpenChange,
  roomInfo,
  refreshRoom,
}: MemberListDrawerProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userInfo } = useUserStore();
  const isAdmin = userInfo?.role?.toLowerCase() === "admin";
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: membersRes, isLoading } = useQuery({
    queryKey: ["chatMembers", roomId],
    queryFn: () => getChatRoomMembers(roomId),
    enabled: isOpen,
  });


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

  const togglePushMutation = useMutation({
    mutationFn: () => patchRoomPushSetting(roomId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["myChatRooms"] });
      alert(res.data ? "알림이 켜졌습니다." : "알림이 꺼졌습니다.");
      if (refreshRoom) {
        refreshRoom();
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "알림 설정 변경에 실패했습니다.");
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
        "채팅방을 폐쇄하시겠습니까?\n폐쇄 시 모든 참여자가 대화할 수 없게 됩니다.",
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
                      onClick={() => {
                        if (member.memberId) {
                          setSelectedMemberId(member.memberId);
                          setIsProfileModalOpen(true);
                        }
                      }}
                    />
                    {index < members.length - 1 && <Divider />}
                  </div>
                ))
              )}
            </Box>
          </ScrollArea>

          <Footer>
            <ActionButton
              onClick={() => togglePushMutation.mutate()}
              $variant="default"
            >
              {roomInfo?.pushEnabled ? (
                <>
                  <Bell size={20} />
                  채팅 알림 끄기
                </>
              ) : (
                <>
                  <BellOff size={20} />
                  채팅 알림 켜기
                </>
              )}
            </ActionButton>
            {(roomInfo?.owner || isAdmin) && (
              <>
                <ActionButton
                  onClick={() => setIsEditModalOpen(true)}
                  $variant="default"
                >
                  <Edit3 size={20} />
                  채팅방 정보 수정
                </ActionButton>
                <ActionButton onClick={handleClose} $variant="danger">
                  <Trash2 size={20} />
                  채팅방 폐쇄
                </ActionButton>
              </>
            )}
            <ActionButton onClick={handleLeave}>
              <LogOut size={20} />
              채팅방 나가기
            </ActionButton>
          </Footer>
          <UserProfileModal
            memberId={selectedMemberId}
            isOpen={isProfileModalOpen}
            onOpenChange={setIsProfileModalOpen}
            roomContext={{
              roomId: roomId,
              chatType: roomInfo?.type || "PERSONAL",
              participantCount: members.length,
              isOwner: roomInfo?.owner || isAdmin,
            }}
          />
          <EditChatModal
            isOpen={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            roomId={roomId}
            initialData={roomInfo}
          />
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
