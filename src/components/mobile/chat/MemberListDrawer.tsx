import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Crown } from "lucide-react";
import Icon from "@/components/common/Icon";
import Modal from "@/components/common/Modal";
import Switch from "@/components/common/Switch";
import { useNavigate } from "react-router-dom";
import {
  getChatRoomMembers,
  leaveChatRoom,
  closeChatRoom,
  patchRoomPushSetting,
} from "@/apis/chat";
import useUserStore from "@/stores/useUserStore";
import UserProfileModal from "@/components/mobile/social/UserProfileModal";
import { useState } from "react";
import { ChatRoom, ChatRoomMemberResponseDto } from "@/types/chat";
import {
  normalizeProfileImageId,
  DEFAULT_PROFILE_IMAGE_ID,
} from "@/utils/userInfo";
import { torchAiLogo as TorchAiLogo } from "@/resources/assets/illustrations/ai";

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
  roomInfo: ChatRoom | null;
  refreshRoom?: () => void;
  onEditTitle?: () => void;
  onFindFreeTime?: () => void;
  onFindMeetingTime?: () => void;
  onEnterChatbuli?: () => void;
  onReportRoom?: () => void;
}

const formatStudentInfo = (studentId: string | null | undefined) => {
  if (!studentId) return "익명";
  if (/^\d{8,}$/.test(studentId)) {
    return `${studentId.slice(2, 4)}학번`;
  }
  return studentId;
};

export default function MemberListDrawer({
  roomId,
  isOpen,
  onOpenChange,
  roomInfo,
  refreshRoom,
  onEditTitle,
  onFindFreeTime,
  onFindMeetingTime,
  onEnterChatbuli,
  onReportRoom,
}: MemberListDrawerProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userInfo } = useUserStore();
  const isAdmin = userInfo?.role?.toLowerCase() === "admin";
  const [selectedChatRoomMemberId, setSelectedChatRoomMemberId] = useState<
    number | null
  >(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  const { data: membersRes, isLoading } = useQuery({
    queryKey: ["chatMembers", roomId],
    queryFn: () => getChatRoomMembers(roomId),
    enabled: isOpen,
  });
  const members: ChatRoomMemberResponseDto[] = membersRes?.data || [];

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myChatRooms"] });
      if (refreshRoom) {
        refreshRoom();
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "알림 설정 변경에 실패했습니다.");
    },
  });

  const handleLeave = () => setIsLeaveModalOpen(true);

  const handleClose = () => {
    if (
      confirm(
        "채팅방을 폐쇄하시겠습니까?\n폐쇄 시 모든 참여자가 대화할 수 없게 됩니다.",
      )
    ) {
      closeMutation.mutate();
    }
  };

  const roomTitle = roomInfo?.friendAlias || roomInfo?.title || "채팅방";

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <VisuallyHidden>
            <Dialog.Title>채팅방 사이드바 메뉴</Dialog.Title>
            <Dialog.Description>대화 상대 및 채팅방 설정</Dialog.Description>
          </VisuallyHidden>

          {/* Panel Header */}
          <PanelHeader>
            <TitleCol>
              <RoomTitle>{roomTitle}</RoomTitle>
              {onEditTitle && (
                <HeaderIconButton
                  onClick={onEditTitle}
                  title="채팅방 이름 변경"
                  aria-label="채팅방 이름 변경"
                >
                  <Icon name="edit-pencil-01" size={20} color="#8B95A1" />
                </HeaderIconButton>
              )}
            </TitleCol>
            <HeaderIconButton
              onClick={() => onOpenChange(false)}
              title="닫기"
              aria-label="닫기"
            >
              <Icon name="close-md" size={22} color="#333D4B" />
            </HeaderIconButton>
          </PanelHeader>

          {/* Panel Body */}
          <PanelBody>
            {/* 1. 참여자 카드 */}
            <Card>
              <SectionHeader>
                <SectionTitle>대화 상대 {members.length}</SectionTitle>
                {roomInfo?.type === "PERSONAL" && (
                  <InvitationButton
                    onClick={() => {
                      onOpenChange(false);
                      navigate(`/chat/${roomId}/invite`);
                    }}
                    title="초대하기"
                  >
                    <Icon name="user-add" size={18} color="#0061FF" />
                    <span>초대하기</span>
                  </InvitationButton>
                )}
              </SectionHeader>

              <MemberList>
                {isLoading ? (
                  <LoadingText>멤버를 불러오는 중...</LoadingText>
                ) : (
                  members.map((member, index) => {
                    const safeFireId = normalizeProfileImageId(
                      member.fireId,
                      DEFAULT_PROFILE_IMAGE_ID,
                    );
                    const profileUrl = `https://portal.inuappcenter.kr/images/profile/${safeFireId}`;
                    const displayName =
                      (member.friendAlias || member.nickname) +
                      (member.isMe ? " (나)" : "");

                    return (
                      <MemberItem
                        key={`${member.nickname}-${index}`}
                        onClick={() => {
                          if (member.isMe) {
                            setSelectedChatRoomMemberId(null);
                            setIsProfileModalOpen(true);
                          } else if (member.chatRoomMemberId) {
                            setSelectedChatRoomMemberId(
                              member.chatRoomMemberId,
                            );
                            setIsProfileModalOpen(true);
                          }
                        }}
                      >
                        <AvatarWrapper>
                          {member.isOwner && (
                            <CrownBadge>
                              <Crown size={14} color="#FFB800" fill="#FFB800" />
                            </CrownBadge>
                          )}
                          <AvatarImg
                            src={profileUrl}
                            alt={member.nickname}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                `https://portal.inuappcenter.kr/images/profile/${DEFAULT_PROFILE_IMAGE_ID}`;
                            }}
                          />
                        </AvatarWrapper>
                        <MemberInfo>
                          <MemberName>{displayName}</MemberName>
                          <MemberDetails>
                            {formatStudentInfo(member.studentId)}
                          </MemberDetails>
                        </MemberInfo>
                      </MemberItem>
                    );
                  })
                )}
              </MemberList>
            </Card>

            {/* 2. 챗불이 AI 카드 */}
            <ChatbotCard
              onClick={() => {
                onOpenChange(false);
                onEnterChatbuli?.();
              }}
            >
              <ChatbotIconImg src={TorchAiLogo} alt="챗불이" />
              <ChatbotTextCol>
                <ChatbotTitle>챗불이</ChatbotTitle>
                <ChatbotDesc>대학 생활에 대해 챗불이에게 질문하기</ChatbotDesc>
              </ChatbotTextCol>
            </ChatbotCard>

            {/* 3. 공강 & 회의 시간 맞추기 카드 */}
            <FreeTimeContainer>
              <SyncSubCard
                $bgColor="#eff6ff"
                onClick={() => {
                  onOpenChange(false);
                  onFindFreeTime?.();
                }}
              >
                <SyncCardTitle>겹치는 공강 보기</SyncCardTitle>
                <SyncCardAction $textColor="#0061ff">
                  <span>채팅방에 공유하기</span>
                  <Icon name="chevron-right-md" size={18} color="#0061FF" />
                </SyncCardAction>
              </SyncSubCard>

              <SyncSubCard
                $bgColor="#e9ffe4"
                onClick={() => {
                  onOpenChange(false);
                  (onFindMeetingTime || onFindFreeTime)?.();
                }}
              >
                <SyncCardTitle>회의 시간 맞추기</SyncCardTitle>
                <SyncCardAction $textColor="#22c55e">
                  <span>채팅방에 공유하기</span>
                  <Icon name="chevron-right-md" size={18} color="#22C55E" />
                </SyncCardAction>
              </SyncSubCard>
            </FreeTimeContainer>

            {/* 4. 알림 및 나가기/신고 카드 */}
            <Card>
              <ActionRow
                style={{ cursor: "default" }}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("button")) return;
                  togglePushMutation.mutate();
                }}
              >
                <span>채팅방 알림</span>
                <Switch
                  checked={roomInfo?.pushEnabled ?? false}
                  onCheckedChange={() => togglePushMutation.mutate()}
                />
              </ActionRow>

              <ActionRow
                onClick={() => {
                  onOpenChange(false);
                  onReportRoom?.();
                }}
              >
                <span>채팅방 신고하기</span>
              </ActionRow>

              <ActionRow $danger onClick={handleLeave}>
                <span>채팅방 나가기</span>
              </ActionRow>

              {(roomInfo?.owner || isAdmin) && roomInfo?.type === "OPEN" && (
                <ActionRow $danger onClick={handleClose}>
                  <span>채팅방 폐쇄하기</span>
                </ActionRow>
              )}
            </Card>
          </PanelBody>

          {/* 프로필 상세 모달 */}
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
        </StyledContent>
        <Modal
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          title="채팅방 나가기"
          description={
            <>
              채팅방에서 나가시겠습니까?
              <br />
              나간 후에는 이전 대화 내용을 볼 수 없습니다.
            </>
          }
          secondaryButton={{
            text: "취소",
            onClick: () => setIsLeaveModalOpen(false),
          }}
          primaryButton={{
            text: "나가기",
            variant: "danger",
            loading: leaveMutation.isPending,
            onClick: () => leaveMutation.mutate(),
          }}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const VisuallyHidden = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const StyledOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  animation: ${fadeIn} 200ms ease-out;
`;

const StyledContent = styled(Dialog.Content)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 85vw;
  max-width: 380px;
  background-color: #f8f9fb;
  border-top-left-radius: 32px;
  border-bottom-left-radius: 32px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  outline: none;
  padding: calc(
      12px + var(--native-safe-area-inset-top, env(safe-area-inset-top, 0px))
    )
    12px calc(16px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  animation: ${contentShow} 250ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  word-break: normal;
  overflow-wrap: break-word;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding-left: 8px;
  padding-right: 4px;
  margin-bottom: 8px;
  flex-shrink: 0;
`;

const TitleCol = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex: 1;
`;

const RoomTitle = styled.h2`
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui,
    Roboto, sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  color: #333d4b;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HeaderIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  border-radius: 50%;
  cursor: pointer;
  color: #333d4b;
  flex-shrink: 0;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.6;
  }
`;

const PanelBody = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 8px;

  /* 스크롤바 숨김 */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 16px;
  box-sizing: border-box;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 12px 16px 4px;
`;

const SectionTitle = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #8b95a1;
  line-height: 1.4;
`;

const InvitationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  color: #0061ff;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;

  &:active {
    opacity: 0.7;
  }
`;

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4px 0 8px;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:active {
    background-color: #f2f4f6;
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
`;

const AvatarImg = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #e5e8eb;
`;

const CrownBadge = styled.div`
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
`;

const MemberInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MemberName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #333d4b;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MemberDetails = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: #8b95a1;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LoadingText = styled.div`
  padding: 24px 0;
  text-align: center;
  color: #8b95a1;
  font-size: 13px;
`;

const ChatbotCard = styled(Card)`
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background-color 0.15s ease;

  &:active {
    background-color: #f2f4f6;
    transform: scale(0.98);
  }
`;

const ChatbotIconImg = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: contain;
  flex-shrink: 0;
`;

const ChatbotTextCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const ChatbotTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #333d4b;
  line-height: 1.4;
`;

const ChatbotDesc = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: #8b95a1;
  line-height: 1.35;
  word-break: keep-all;
  overflow-wrap: break-word;
`;

const FreeTimeContainer = styled(Card)`
  padding: 12px;
  display: flex;
  gap: 8px;
`;

const SyncSubCard = styled.div<{ $bgColor: string }>`
  flex: 1;
  min-width: 0;
  background-color: ${({ $bgColor }) => $bgColor};
  border-radius: 16px;
  padding: 10px 12px 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;

  &:active {
    transform: scale(0.97);
    opacity: 0.9;
  }
`;

const SyncCardTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333d4b;
  line-height: 1.4;
  word-break: keep-all;
  overflow-wrap: break-word;
  margin-bottom: 12px;
`;

const SyncCardAction = styled.div<{ $textColor: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 500;
  color: ${({ $textColor }) => $textColor};
  line-height: 1.4;
  word-break: keep-all;
`;

const ActionRow = styled.div<{ $danger?: boolean }>`
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 400;
  color: ${({ $danger }) => ($danger ? "#ef4444" : "#333d4b")};
  cursor: pointer;
  transition: background-color 0.15s ease;
  word-break: keep-all;
  overflow-wrap: break-word;

  &:active {
    background-color: #f2f4f6;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f8f9fb;
  }
`;

