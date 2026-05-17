import { Drawer } from "vaul";
import styled from "styled-components";
import {
  UserPlus,
  UserCheck,
  UserMinus,
  UserX,
  Edit3,
  ShieldAlert,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMemberProfile } from "@/apis/members";
import {
  requestFriend,
  acceptFriend,
  deleteFriend,
  updateFriendAlias,
} from "@/apis/friends";
import {
  normalizeProfileImageId,
  DEFAULT_PROFILE_IMAGE_ID,
} from "@/utils/userInfo";
import findTitleOrCode from "@/utils/findTitleOrCode";
import { useNavigate } from "react-router-dom";
import useUserStore from "@/stores/useUserStore";
import { blockUser } from "@/apis/blocks";
import { kickMember, delegateOwner, createPersonalChatRoom } from "@/apis/chat";
import { ROUTES } from "@/constants/routes";

const StyledOverlay = styled(Drawer.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 3000;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
`;

const StyledContent = styled(Drawer.Content)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 100%;
  max-width: 500px;
  background-color: white;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  z-index: 3001;
  display: flex;
  flex-direction: column;
  outline: none;
  padding-bottom: env(safe-area-inset-bottom, 20px);
`;

const Header = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-end;
  padding: 16px;
`;

const SheetHandle = styled.div`
  position: absolute;
  left: 50%;
  top: 10px;
  transform: translateX(-50%);
  width: 40px;
  height: 5px;
  background-color: #E5E5EA;
  border-radius: 3px;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  &:active {
    background-color: #f2f2f7;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px 24px 24px;
`;

const LoadingArea = styled.div`
  padding: 40px 0;
  color: #8e8e93;
  font-size: 15px;
`;

const ProfileImageWrapper = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 40px;
  overflow: hidden;
  margin-bottom: 16px;
  background-color: #f2f2f7;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UserInfoArea = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const NicknameArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 4px;
`;

const Nickname = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #1c1c1e;
  margin: 0;
`;

const EditAliasButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  &:active {
    background-color: #f2f2f7;
  }
`;

const Alias = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #5e92f0;
`;

const SubInfo = styled.p`
  font-size: 15px;
  color: #8e8e93;
  margin: 0;
`;

const ActionArea = styled.div`
  width: 100%;
`;

const VerticalButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
`;

const ActionButton = styled.button<{ $variant: "primary" | "secondary" | "danger" }>`
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  background-color: ${({ $variant }) => {
    if ($variant === "primary") return "#5E92F0";
    if ($variant === "danger") return "#FFF5F5";
    return "#F2F2F7";
  }};
  color: ${({ $variant }) => {
    if ($variant === "primary") return "white";
    if ($variant === "danger") return "#FF3B30";
    return "#3A3A3C";
  }};

  &:active:not(:disabled) {
    transform: scale(0.97);
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

interface UserProfileModalProps {
  memberId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roomContext?: {
    roomId: number | string;
    chatType: string;
    participantCount: number;
    isOwner: boolean;
  };
}

export default function UserProfileModal({
  memberId,
  isOpen,
  onOpenChange,
  roomContext,
}: UserProfileModalProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userInfo } = useUserStore();
  const isAdmin = userInfo?.role?.toLowerCase() === "admin";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["memberProfile", memberId],
    queryFn: () => getMemberProfile(memberId!),
    enabled: !!memberId && isOpen,
    retry: false,
  });

  const profile = data?.data;

  // 에러 처리 (차단된 유저 등 404 에러 시)
  if (isError && isOpen) {
    const err = error as any;
    if (err.response?.status === 404) {
      alert("존재하지 않거나 차단된 사용자입니다.");
      onOpenChange(false);
    }
  }

  const requestMutation = useMutation({
    mutationFn: (nickname: string) => requestFriend(nickname),
    onSuccess: () => {
      alert("친구 요청을 보냈습니다.");
      queryClient.invalidateQueries({ queryKey: ["memberProfile", memberId] });
      queryClient.invalidateQueries({ queryKey: ["sentPendingFriends"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.msg || "친구 요청에 실패했습니다.");
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (friendId: number) => acceptFriend(friendId),
    onSuccess: () => {
      alert("친구 요청을 수락했습니다.");
      queryClient.invalidateQueries({ queryKey: ["memberProfile", memberId] });
      queryClient.invalidateQueries({ queryKey: ["pendingFriends"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (friendId: number) => deleteFriend(friendId),
    onSuccess: () => {
      alert("처리되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["memberProfile", memberId] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["pendingFriends"] });
      queryClient.invalidateQueries({ queryKey: ["sentPendingFriends"] });
    },
  });

  const updateAliasMutation = useMutation({
    mutationFn: ({ friendId, alias }: { friendId: number; alias: string }) =>
      updateFriendAlias(friendId, alias),
    onSuccess: () => {
      alert("별명이 수정되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["memberProfile", memberId] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.msg || "별명 수정에 실패했습니다.");
    },
  });

  const handleEditAlias = () => {
    if (!profile?.friendId) return;
    const newAlias = prompt("새로운 별명을 입력하세요.", profile.friendAlias || "");
    if (newAlias === null) return;
    updateAliasMutation.mutate({
      friendId: profile.friendId,
      alias: newAlias.trim(),
    });
  };

  const handleAction = () => {
    if (!profile) return;

    switch (profile.friendStatus) {
      case "NONE":
        requestMutation.mutate(profile.nickname);
        break;
      case "PENDING":
        if (confirm("친구 요청을 취소할까요?")) {
          if (profile.friendId) deleteMutation.mutate(profile.friendId);
        }
        break;
      case "RECEIVED":
        if (confirm("친구 요청을 수락할까요?")) {
          if (profile.friendId) acceptMutation.mutate(profile.friendId);
        }
        break;
      case "ACCEPTED":
        if (confirm("친구를 삭제할까요?")) {
          if (profile.friendId) deleteMutation.mutate(profile.friendId);
        }
        break;
    }
  };

  const handleReject = () => {
    if (profile?.friendId && confirm("친구 요청을 거절할까요?")) {
      deleteMutation.mutate(profile.friendId);
    }
  };

  const chatMutation = useMutation({
    mutationFn: (targetMemberId: number) =>
      createPersonalChatRoom([targetMemberId]),
    onSuccess: (res) => {
      const roomId = res.data.id;
      onOpenChange(false);
      navigate(`/chat/${roomId}`);
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "1대1 채팅방 생성에 실패했습니다.");
    },
  });

  const handleStartChat = () => {
    if (!profile) return;
    chatMutation.mutate(profile.memberId);
  };

  const blockMutation = useMutation({
    mutationFn: (targetMemberId: number) => blockUser(targetMemberId),
    onSuccess: () => {
      alert("유저를 차단했습니다.");
      queryClient.invalidateQueries({ queryKey: ["memberProfile", memberId] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "차단에 실패했습니다.");
    },
  });

  const kickMutation = useMutation({
    mutationFn: (targetMemberId: number) =>
      kickMember(roomContext!.roomId, targetMemberId),
    onSuccess: () => {
      alert("멤버를 강퇴했습니다.");
      queryClient.invalidateQueries({
        queryKey: ["chatMembers", roomContext?.roomId],
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "강퇴에 실패했습니다.");
    },
  });

  const delegateMutation = useMutation({
    mutationFn: (targetMemberId: number) =>
      delegateOwner(roomContext!.roomId, targetMemberId),
    onSuccess: () => {
      alert("방장을 위임했습니다.");
      queryClient.invalidateQueries({
        queryKey: ["chatMembers", roomContext?.roomId],
      });
      queryClient.invalidateQueries({ queryKey: ["myChatRooms"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "위임에 실패했습니다.");
    },
  });

  const handleBlock = () => {
    if (!profile) return;
    if (
      confirm(
        `${profile.nickname}님을 차단할까요?\n차단 시 해당 유저의 메시지가 더 이상 보이지 않으며 친구 관계가 해제됩니다.`,
      )
    ) {
      blockMutation.mutate(profile.memberId);
    }
  };

  const handleKick = () => {
    if (!profile || !roomContext) return;
    if (confirm(`'${profile.nickname}'님을 강퇴할까요?`)) {
      kickMutation.mutate(profile.memberId);
    }
  };

  const handleDelegate = () => {
    if (!profile || !roomContext) return;
    if (
      confirm(
        `'${profile.nickname}'님에게 방장을 위임할까요?\n위임 후에는 방장 권한이 상실됩니다.`,
      )
    ) {
      delegateMutation.mutate(profile.memberId);
    }
  };

  const isMe = userInfo?.id === profile?.memberId;

  const canManage =
    !isMe &&
    (roomContext?.isOwner || isAdmin) &&
    (roomContext?.chatType === "OPEN" ||
      (roomContext?.chatType === "PERSONAL" &&
        roomContext.participantCount >= 3));

  const safeFireId = normalizeProfileImageId(profile?.fireId, DEFAULT_PROFILE_IMAGE_ID);

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <StyledOverlay />
        <StyledContent>
          <Header>
            <SheetHandle />
            <HeaderActions>
              {!isMe && profile && (
                <>
                  {profile.friendStatus === "ACCEPTED" && (
                    <IconButton
                      onClick={handleAction}
                      title="친구 삭제"
                    >
                      <UserMinus size={22} color="#8E8E93" />
                    </IconButton>
                  )}
                  <IconButton
                    onClick={handleBlock}
                    title="차단"
                  >
                    <ShieldAlert size={22} color="#FF3B30" />
                  </IconButton>
                </>
              )}
            </HeaderActions>
          </Header>

              <Body>
                {isLoading ? (
                  <LoadingArea>프로필 로딩 중...</LoadingArea>
                ) : profile ? (
                  <>
                    <ProfileImageWrapper>
                      <ProfileImage
                        src={`https://portal.inuappcenter.kr/images/profile/${safeFireId}`}
                        alt="Profile"
                      />
                    </ProfileImageWrapper>

                    <UserInfoArea>
                      <NicknameArea>
                        <Nickname>{profile.friendAlias || profile.nickname}</Nickname>
                        {profile.friendAlias && (
                          <Alias>({profile.nickname})</Alias>
                        )}
                        {profile.friendStatus === "ACCEPTED" && (
                          <EditAliasButton onClick={handleEditAlias}>
                            <Edit3 size={16} color="#8E8E93" />
                          </EditAliasButton>
                        )}
                      </NicknameArea>
                      <SubInfo>
                        {findTitleOrCode(profile.department)} · {profile.maskedStudentId}
                      </SubInfo>
                    </UserInfoArea>

                    <ActionArea>
                      {isMe ? (
                        <ActionButton
                          onClick={() => navigate(ROUTES.MYPAGE.PROFILE)}
                          $variant="primary"
                        >
                          <Edit3 size={20} />
                          프로필 수정
                        </ActionButton>
                      ) : (
                        <VerticalButtonGroup>
                          {/* 1층: 친구 수락/거절 또는 친구 요청/대기중 버튼 */}
                          {profile.friendStatus === "RECEIVED" && (
                            <ButtonGroup>
                              <ActionButton
                                onClick={handleReject}
                                $variant="secondary"
                              >
                                <UserX size={20} />
                                거절
                              </ActionButton>
                              <ActionButton
                                onClick={handleAction}
                                $variant="primary"
                              >
                                <UserCheck size={20} />
                                수락
                              </ActionButton>
                            </ButtonGroup>
                          )}

                          {profile.friendStatus === "NONE" && (
                            <ActionButton
                              onClick={handleAction}
                              $variant="primary"
                              disabled={requestMutation.isPending}
                            >
                              <UserPlus size={20} />
                              친구 요청
                            </ActionButton>
                          )}

                          {profile.friendStatus === "PENDING" && (
                            <ActionButton
                              onClick={handleAction}
                              $variant="secondary"
                              disabled={deleteMutation.isPending}
                            >
                              <UserCheck size={20} color="#8E8E93" />
                              요청 대기 중
                            </ActionButton>
                          )}

                          {/* 2층: 강퇴 버튼 (차단은 상단 헤더로 올라갔으므로 강퇴만 조건부 렌더링) */}
                          {canManage && (
                            <ActionButton
                              onClick={handleKick}
                              $variant="danger"
                            >
                              <LogOut size={20} color="#FF3B30" />
                              강퇴
                            </ActionButton>
                          )}

                          {/* 3층: 방장 위임 */}
                          {canManage && roomContext?.isOwner && (
                            <ActionButton
                              onClick={handleDelegate}
                              $variant="secondary"
                            >
                              <UserCheck size={20} />
                              방장 위임
                            </ActionButton>
                          )}

                          {/* 4층: 1대1 채팅 버튼 */}
                          <ActionButton
                            onClick={handleStartChat}
                            $variant="primary"
                            disabled={chatMutation.isPending}
                          >
                            <MessageSquare size={20} />
                            1대1 채팅
                          </ActionButton>
                        </VerticalButtonGroup>
                      )}
                    </ActionArea>
                  </>
                ) : (
                  <LoadingArea>정보를 불러올 수 없습니다.</LoadingArea>
                )}
              </Body>
            </StyledContent>
          </Drawer.Portal>
        </Drawer.Root>
      );
    }
