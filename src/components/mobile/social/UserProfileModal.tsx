import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { X, UserPlus, UserCheck, UserMinus, UserX } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMemberProfile } from "@/apis/members";
import { 
  requestFriendByNickname, 
  acceptFriend, 
  deleteFriend 
} from "@/apis/friends";
import { normalizeProfileImageId, DEFAULT_PROFILE_IMAGE_ID } from "@/utils/userInfo";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translate(-50%, 100%); }
  to { transform: translate(-50%, 0); }
`;

interface UserProfileModalProps {
  memberId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserProfileModal({
  memberId,
  isOpen,
  onOpenChange,
}: UserProfileModalProps) {
  const queryClient = useQueryClient();

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
    mutationFn: (nickname: string) => requestFriendByNickname(nickname),
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

  const handleAction = () => {
    if (!profile) return;

    switch (profile.friendStatus) {
      case "NONE":
        requestMutation.mutate(profile.nickname);
        break;
      case "PENDING":
        if (confirm("친구 요청을 취소하시겠습니까?")) {
          if (profile.friendId) deleteMutation.mutate(profile.friendId);
        }
        break;
      case "RECEIVED":
        if (confirm("친구 요청을 수락하시겠습니까?")) {
          if (profile.friendId) acceptMutation.mutate(profile.friendId);
        }
        break;
      case "ACCEPTED":
        if (confirm("친구를 삭제하시겠습니까?")) {
          if (profile.friendId) deleteMutation.mutate(profile.friendId);
        }
        break;
    }
  };

  const handleReject = () => {
    if (profile?.friendId && confirm("친구 요청을 거절하시겠습니까?")) {
      deleteMutation.mutate(profile.friendId);
    }
  };

  const safeFireId = normalizeProfileImageId(profile?.fireId, DEFAULT_PROFILE_IMAGE_ID);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <Header>
            <CloseButton onClick={() => onOpenChange(false)}>
              <X size={24} color="#1C1C1E" />
            </CloseButton>
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
                    <Nickname>{profile.nickname}</Nickname>
                    {profile.friendAlias && (
                      <Alias>({profile.friendAlias})</Alias>
                    )}
                  </NicknameArea>
                  <SubInfo>
                    {profile.department} · {profile.maskedStudentId}
                  </SubInfo>
                </UserInfoArea>

                <ActionArea>
                  {profile.friendStatus === "RECEIVED" ? (
                    <ButtonGroup>
                      <ActionButton onClick={handleReject} $variant="secondary">
                        <UserX size={20} />
                        거절
                      </ActionButton>
                      <ActionButton onClick={handleAction} $variant="primary">
                        <UserCheck size={20} />
                        수락
                      </ActionButton>
                    </ButtonGroup>
                  ) : (
                    <ActionButton
                      onClick={handleAction}
                      $variant={profile.friendStatus === "NONE" ? "primary" : "secondary"}
                      disabled={requestMutation.isPending || acceptMutation.isPending || deleteMutation.isPending}
                    >
                      {profile.friendStatus === "NONE" && (
                        <>
                          <UserPlus size={20} />
                          친구 요청
                        </>
                      )}
                      {profile.friendStatus === "PENDING" && (
                        <>
                          <UserCheck size={20} color="#8E8E93" />
                          요청 대기 중
                        </>
                      )}
                      {profile.friendStatus === "ACCEPTED" && (
                        <>
                          <UserMinus size={20} color="#8E8E93" />
                          친구 삭제
                        </>
                      )}
                    </ActionButton>
                  )}
                </ActionArea>
              </>
            ) : (
              <LoadingArea>정보를 불러올 수 없습니다.</LoadingArea>
            )}
          </Body>
        </StyledContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const StyledOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 3000;
  background-color: rgba(0, 0, 0, 0.5);
  animation: ${fadeIn} 200ms ease-out;
  backdrop-filter: blur(2px);
`;

const StyledContent = styled(Dialog.Content)`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 500px;
  background-color: white;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  z-index: 3001;
  display: flex;
  flex-direction: column;
  outline: none;
  animation: ${slideUp} 300ms cubic-bezier(0.16, 1, 0.3, 1);
  padding-bottom: env(safe-area-inset-bottom, 20px);
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 16px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
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

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
`;

const ActionButton = styled.button<{ $variant: "primary" | "secondary" }>`
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

  background-color: ${({ $variant }) =>
    $variant === "primary" ? "#5E92F0" : "#F2F2F7"};
  color: ${({ $variant }) => ($variant === "primary" ? "white" : "#3A3A3C")};

  &:active:not(:disabled) {
    transform: scale(0.97);
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
