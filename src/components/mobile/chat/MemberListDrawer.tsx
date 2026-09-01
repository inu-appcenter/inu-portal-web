import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, BellOff, Edit3 } from "lucide-react";
import Icon from "@/components/common/Icon";
import Divider from "@/components/common/Divider";
import SocialUserCard from "@/components/mobile/social/SocialUserCard";
import { useNavigate } from "react-router-dom";
import {
  getChatRoomMembers,
  leaveChatRoom,
  closeChatRoom,
  patchRoomPushSetting,
  inviteFriendsToChatRoom,
} from "@/apis/chat";
import { getFriends } from "@/apis/friends";
import useUserStore from "@/stores/useUserStore";
import UserProfileModal from "@/components/mobile/social/UserProfileModal";
import EditChatModal from "@/components/mobile/chat/EditChatModal";
import { useState, useMemo } from "react";

const contentShow = keyframes`
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const modalShow = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
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
  const [selectedChatRoomMemberId, setSelectedChatRoomMemberId] = useState<
    number | null
  >(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedFriendsToInvite, setSelectedFriendsToInvite] = useState<
    number[]
  >([]);

  const { data: membersRes, isLoading } = useQuery({
    queryKey: ["chatMembers", roomId],
    queryFn: () => getChatRoomMembers(roomId),
    enabled: isOpen,
  });
  const members = membersRes?.data || [];

  const { data: friendsRes } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
    enabled: isInviteOpen,
  });
  const friends = friendsRes?.data || [];

  // 현재 채팅방에 이미 참여 중인 멤버는 초대 대상에서 제외
  const filteredFriends = useMemo(() => {
    return friends.filter(
      (friend) =>
        !members.some(
          (m) =>
            (m.studentId && m.studentId === friend.studentId) ||
            m.nickname === friend.nickname,
        ),
    );
  }, [friends, members]);

  const inviteMutation = useMutation({
    mutationFn: (friendIds: number[]) =>
      inviteFriendsToChatRoom(roomId, friendIds),
    onSuccess: () => {
      alert("성공적으로 초대했습니다.");
      queryClient.invalidateQueries({ queryKey: ["chatMembers", roomId] });
      if (refreshRoom) refreshRoom();
      setIsInviteOpen(false);
      setSelectedFriendsToInvite([]);
    },
    onError: (err: any) => {
      alert(err.response?.data?.msg || "초대에 실패했습니다.");
    },
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

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <Header>
            <Title>대화 상대 ({members.length})</Title>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {roomInfo?.type === "PERSONAL" && members.length >= 3 && (
                <IconButton
                  onClick={() => setIsInviteOpen(true)}
                  title="초대하기"
                >
                  <Icon name="user-add" size={22} color="#5E92F0" />
                </IconButton>
              )}
              <CloseButton onClick={() => onOpenChange(false)}>
                <Icon name="close-md" size={24} color="#1C1C1E" />
              </CloseButton>
            </div>
          </Header>

          <ScrollArea>
            {isLoading ? (
              <div
                style={{
                  padding: "40px 0",
                  textAlign: "center",
                  color: "#969696",
                  fontSize: "14px",
                }}
              >
                멤버를 불러오는 중...
              </div>
            ) : (
              members.map((member, index) => (
                <div
                  key={`${member.nickname}-${index}`}
                  style={{ width: "100%" }}
                >
                  <SocialUserCard
                    name={
                      (member.friendAlias
                        ? `${member.friendAlias} (${member.nickname})`
                        : member.nickname) +
                      (member.isMe ? " (나)" : "") +
                      (member.isOwner ? " (방장)" : "")
                    }
                    subtitle={member.studentId || "익명"}
                    fireId={member.fireId || 0}
                    onClick={() => {
                      if (member.chatRoomMemberId) {
                        setSelectedChatRoomMemberId(member.chatRoomMemberId);
                        setIsProfileModalOpen(true);
                      }
                    }}
                  />
                  {index < members.length - 1 && <Divider />}
                </div>
              ))
            )}
          </ScrollArea>

          <Footer>
            {(roomInfo?.owner || isAdmin) && roomInfo?.type === "OPEN" && (
              <>
                <ActionButton
                  onClick={() => setIsEditModalOpen(true)}
                  $variant="default"
                >
                  <Edit3 size={20} />
                  채팅방 정보 수정
                </ActionButton>
                <ActionButton onClick={handleClose} $variant="danger">
                  <Icon name="trash-full" size={20} />
                  채팅방 폐쇄
                </ActionButton>
              </>
            )}
            <BottomActionRow>
              <IconButton
                onClick={() => togglePushMutation.mutate()}
                title={roomInfo?.pushEnabled ? "알림 끄기" : "알림 켜기"}
              >
                {roomInfo?.pushEnabled ? (
                  <Icon name="bell" size={22} />
                ) : (
                  <BellOff size={22} />
                )}
              </IconButton>
              <IconButton onClick={handleLeave} title="채팅방 나가기">
                <LogOut size={22} />
              </IconButton>
            </BottomActionRow>
          </Footer>
          <UserProfileModal
            chatRoomMemberId={selectedChatRoomMemberId}
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
          <InviteFriendsModal
            isOpen={isInviteOpen}
            onOpenChange={setIsInviteOpen}
            friends={filteredFriends}
            selectedIds={selectedFriendsToInvite}
            onToggle={(friendId) =>
              setSelectedFriendsToInvite((prev) =>
                prev.includes(friendId)
                  ? prev.filter((id) => id !== friendId)
                  : [...prev, friendId],
              )
            }
            onConfirm={() => inviteMutation.mutate(selectedFriendsToInvite)}
            isPending={inviteMutation.isPending}
          />
        </StyledContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const Footer = styled.div`
  padding: 16px 20px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 12px));
  border-top: 1px solid #f2f2f7;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: white;
`;

const BottomActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: #8e8e93;
  background-color: #f2f2f7;
  transition: all 0.2s;

  &:active {
    opacity: 0.7;
    transform: scale(0.95);
  }
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
  padding: 20px 20px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  //border-bottom: 1px solid #f2f2f7;
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
  padding: 0 20px;
`;

const EmptyStateStyle = styled.div`
  padding: 40px 0;
  text-align: center;
  color: #969696;
  font-size: 14px;
`;

interface InviteFriendsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  friends: any[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onConfirm: () => void;
  isPending: boolean;
}

const InviteFriendsModal = ({
  isOpen,
  onOpenChange,
  friends,
  selectedIds,
  onToggle,
  onConfirm,
  isPending,
}: InviteFriendsModalProps) => {
  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <InviteOverlay />
        <InviteContent>
          <Header>
            <Title>내 친구에서 초대</Title>
            <CloseButton onClick={() => onOpenChange(false)}>
              <Icon name="close-md" size={24} color="#1C1C1E" />
            </CloseButton>
          </Header>
          <ScrollArea>
            {friends.length === 0 ? (
              <EmptyStateStyle>초대 가능한 친구가 없습니다.</EmptyStateStyle>
            ) : (
              friends.map((friend, index) => (
                <div key={friend.friendId} style={{ width: "100%" }}>
                  <SelectableCard onClick={() => onToggle(friend.friendId)}>
                    <SocialUserCard
                      name={friend.nickname}
                      subtitle={friend.studentId}
                      fireId={friend.fireId}
                    />
                    <Checkbox $selected={selectedIds.includes(friend.friendId)}>
                      {selectedIds.includes(friend.friendId) && (
                        <Icon name="check" size={16} color="white" />
                      )}
                    </Checkbox>
                  </SelectableCard>
                  {index < friends.length - 1 && <Divider />}
                </div>
              ))
            )}
          </ScrollArea>
          <Footer>
            <InviteConfirmButton
              disabled={selectedIds.length === 0 || isPending}
              onClick={onConfirm}
            >
              {isPending ? "초대 중..." : `초대 완료 (${selectedIds.length}명)`}
            </InviteConfirmButton>
          </Footer>
        </InviteContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const InviteOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  animation: ${fadeIn} 200ms ease-out;
`;

const InviteContent = styled(Dialog.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 360px;
  height: 80vh;
  background-color: white;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  outline: none;
  border-radius: 24px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15);
  animation: ${modalShow} 200ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
`;

const SelectableCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  width: 100%;
  //padding: 8px 0;

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

const InviteConfirmButton = styled.button`
  width: 100%;
  height: 48px;
  background-color: #5e92f0;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:disabled {
    background-color: #e5e5ea;
    color: #8e8e93;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
    opacity: 0.9;
  }
`;
