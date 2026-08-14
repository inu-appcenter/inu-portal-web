import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { Check, LinkIcon, User, UserPlus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useHeader } from "@/context/HeaderContext";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { acceptInvite, getInvitePreview } from "@/apis/friends";
import { ROUTES } from "@/constants/routes";
import useUserStore from "@/stores/useUserStore";
import {
  DEFAULT_PROFILE_IMAGE_ID,
  normalizeProfileImageId,
} from "@/utils/userInfo";

/** 로그인 왕복 후 "친구 되기"를 다시 누르지 않아도 되게 하는 표식. */
const AUTO_ACCEPT_STORAGE_KEY = "__intipPendingFriendInviteCode";

function getStoredAccessToken() {
  const storedTokenInfo = localStorage.getItem("tokenInfo");
  if (!storedTokenInfo) return "";
  try {
    return JSON.parse(storedTokenInfo)?.accessToken ?? "";
  } catch {
    return "";
  }
}

/**
 * 친구추가 링크 수락 화면.
 *
 * 링크 주인은 링크를 만든 시점에 이미 동의한 것으로 보므로, 수락하면 승인 절차 없이
 * 곧바로 친구가 된다. 미리보기는 비로그인 상태에서도 열리고, 수락 시점에만 로그인을 요구한다.
 */
export default function MobileFriendInvitePage() {
  const { code = "" } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { tokenInfo } = useUserStore();
  const [isAccepted, setIsAccepted] = useState(false);
  const hasAutoAcceptedRef = useRef(false);

  const isLoggedIn =
    Boolean(tokenInfo.accessToken) || Boolean(getStoredAccessToken());

  useHeader({
    title: "친구 추가",
    hasback: true,
    backPath: ROUTES.FRIEND.LIST,
  });

  const {
    data,
    isLoading,
    error: previewError,
  } = useQuery({
    queryKey: ["friendInvitePreview", code],
    queryFn: () => getInvitePreview(code),
    enabled: Boolean(code),
    retry: false,
    staleTime: Infinity,
  });

  const owner = data?.data;

  const acceptMutation = useMutation({
    mutationFn: () => acceptInvite(code),
    onSuccess: () => {
      setIsAccepted(true);
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["pendingFriends"] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "친구 추가에 실패했어요.");
    },
  });

  const handleAccept = useCallback(() => {
    if (!isLoggedIn) {
      // 로그인 페이지를 다녀온 뒤 이 화면으로 돌아와 자동으로 수락되게 표식을 남긴다.
      localStorage.setItem(AUTO_ACCEPT_STORAGE_KEY, code);
      const redirectPath = `${location.pathname}${location.search}`;
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }
    acceptMutation.mutate();
  }, [isLoggedIn, code, location.pathname, location.search, navigate, acceptMutation]);

  // 로그인 왕복 복귀 시 1회만 자동 수락한다.
  useEffect(() => {
    if (hasAutoAcceptedRef.current) return;
    if (!isLoggedIn || !owner || isAccepted) return;
    if (localStorage.getItem(AUTO_ACCEPT_STORAGE_KEY) !== code) return;

    hasAutoAcceptedRef.current = true;
    localStorage.removeItem(AUTO_ACCEPT_STORAGE_KEY);
    acceptMutation.mutate();
  }, [isLoggedIn, owner, isAccepted, code, acceptMutation]);

  if (isLoading) {
    return (
      <PageWrapper>
        <StatusBlock>
          <IconWrapper>
            <LinkIcon size={24} strokeWidth={2.2} />
          </IconWrapper>
          <Title>링크를 확인하는 중이에요</Title>
        </StatusBlock>
      </PageWrapper>
    );
  }

  if (previewError || !owner) {
    return (
      <PageWrapper>
        <StatusBlock>
          <IconWrapper $tone="muted">
            <LinkIcon size={24} strokeWidth={2.2} />
          </IconWrapper>
          <Title>유효하지 않은 링크예요</Title>
          <Description>
            링크가 만료됐거나 새 링크로 바뀌었을 수 있어요.
            <br />
            상대방에게 링크를 다시 받아주세요.
          </Description>
          <PrimaryButton type="button" onClick={() => navigate(ROUTES.HOME)}>
            홈으로
          </PrimaryButton>
        </StatusBlock>
      </PageWrapper>
    );
  }

  const safeFireId = normalizeProfileImageId(
    owner.fireId,
    DEFAULT_PROFILE_IMAGE_ID,
  );

  return (
    <PageWrapper>
      <StatusBlock>
        <ProfileArea>
          <ProfileImage
            src={`https://portal.inuappcenter.kr/images/profile/${safeFireId}`}
            alt=""
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <DefaultIconArea>
            <User size={32} color="#D6D1D5" />
          </DefaultIconArea>
          {isAccepted && (
            <AcceptedBadge>
              <Check size={14} strokeWidth={3} />
            </AcceptedBadge>
          )}
        </ProfileArea>

        <Nickname>{owner.nickname}</Nickname>
        <ProfileSubtitle>{owner.studentId}</ProfileSubtitle>

        {isAccepted ? (
          <>
            <Title>이제 친구예요</Title>
            <Description>
              친구 목록에서 시간표를 비교하고 대화를 시작해보세요.
            </Description>
            <PrimaryButton
              type="button"
              onClick={() => navigate(ROUTES.FRIEND.LIST, { replace: true })}
            >
              친구 목록 보기
            </PrimaryButton>
          </>
        ) : (
          <>
            <Title>{owner.nickname}님이 친구를 신청했어요</Title>
            <Description>
              수락하면 바로 친구가 돼요.
              {!isLoggedIn && (
                <>
                  <br />
                  INTIP에 로그인한 뒤 이어서 진행돼요.
                </>
              )}
            </Description>
            <PrimaryButton
              type="button"
              onClick={handleAccept}
              disabled={acceptMutation.isPending}
            >
              <UserPlus size={18} />
              {acceptMutation.isPending
                ? "추가하는 중…"
                : isLoggedIn
                  ? "친구 되기"
                  : "로그인하고 친구 되기"}
            </PrimaryButton>
          </>
        )}
      </StatusBlock>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px ${MOBILE_PAGE_GUTTER} 40px;
`;

const StatusBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0 8px;
`;

const IconWrapper = styled.div<{ $tone?: "brand" | "muted" }>`
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: ${({ $tone }) =>
    $tone === "muted"
      ? "var(--bg-muted, #f1f3f5)"
      : "var(--bg-brand, #eff6ff)"};
  color: ${({ $tone }) =>
    $tone === "muted"
      ? "var(--text-tertiary, #8b95a1)"
      : "var(--text-brand, #0061ff)"};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px auto 12px;
`;

const ProfileArea = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 999px;
  background: var(--bg-muted, #f1f3f5);
  margin-bottom: 12px;
`;

const DefaultIconArea = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
  z-index: 1;
`;

const AcceptedBadge = styled.div`
  position: absolute;
  right: -2px;
  bottom: -2px;
  z-index: 2;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: 2px solid var(--bg-base, #ffffff);
  background: var(--interactive-primary, #3b82f6);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Nickname = styled.div`
  font-family: Pretendard;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #333d4b);
`;

const ProfileSubtitle = styled.div`
  margin-top: 2px;
  margin-bottom: 20px;
  font-family: Pretendard;
  font-size: 13px;
  color: var(--text-tertiary, #8b95a1);
`;

const Title = styled.h2`
  margin: 0 0 8px;
  font-family: Pretendard;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #333d4b);
  text-align: center;
`;

const Description = styled.p`
  margin: 0 0 24px;
  font-family: Pretendard;
  font-size: 14px;
  line-height: 20px;
  color: var(--text-tertiary, #8b95a1);
  text-align: center;
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 999px;
  background-color: var(--interactive-primary, #3b82f6);
  color: #ffffff;
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  outline: none;

  &:active:not(:disabled) {
    background-color: var(--interactive-primary-pressed, #2563eb);
    transform: scale(0.98);
  }

  &:disabled {
    background-color: var(--bg-muted, #f1f3f5);
    color: var(--text-tertiary, #8b95a1);
    cursor: not-allowed;
  }
`;
