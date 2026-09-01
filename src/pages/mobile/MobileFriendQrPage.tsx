import { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { QRCodeSVG } from "qrcode.react";
import { Copy, RefreshCw } from "lucide-react";
import Icon from "@/components/common/Icon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useHeader } from "@/context/HeaderContext";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { getMyInviteCode, refreshMyInviteCode } from "@/apis/friends";
import { ROUTES } from "@/constants/routes";
import useUserStore from "@/stores/useUserStore";
import {
  DEFAULT_PROFILE_IMAGE_ID,
  normalizeProfileImageId,
} from "@/utils/userInfo";

/**
 * 내 친구추가 QR / 링크.
 *
 * 서버가 돌려주는 url은 운영 도메인 고정이라, 실제로 공유하는 링크는 현재 origin 기준으로
 * 다시 조립한다. 그래야 intip-test.pages.dev 에서 만든 QR이 테스트 환경으로 떨어진다.
 */
export default function MobileFriendQrPage() {
  const queryClient = useQueryClient();
  const { userInfo } = useUserStore();
  const [isCopied, setIsCopied] = useState(false);

  useHeader({
    title: "친구추가 QR",
    hasback: true,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["myInviteCode"],
    queryFn: getMyInviteCode,
    staleTime: Infinity,
  });

  const code = data?.data?.code;

  const inviteUrl = useMemo(() => {
    if (!code) return "";
    return `${window.location.origin}${ROUTES.FRIEND.INVITE(code)}`;
  }, [code]);

  const refreshMutation = useMutation({
    mutationFn: refreshMyInviteCode,
    onSuccess: (res) => {
      queryClient.setQueryData(["myInviteCode"], res);
      setIsCopied(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "링크를 새로 만들지 못했어요.");
    },
  });

  const handleCopy = useCallback(async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      alert("링크를 복사하지 못했어요. 주소를 길게 눌러 복사해주세요.");
    }
  }, [inviteUrl]);

  const handleShare = useCallback(async () => {
    if (!inviteUrl) return;
    // WebView·데스크톱 등 공유 시트가 없는 환경에서는 복사로 대체한다.
    if (!navigator.share) {
      handleCopy();
      return;
    }
    try {
      await navigator.share({
        title: "INTIP 친구추가",
        text: `${userInfo.nickname}님이 INTIP에서 친구를 신청했어요.`,
        url: inviteUrl,
      });
    } catch {
      // 사용자가 공유 시트를 닫은 경우 — 아무 것도 하지 않는다.
    }
  }, [inviteUrl, userInfo.nickname, handleCopy]);

  const handleRefresh = useCallback(() => {
    const confirmed = window.confirm(
      "새 링크를 만들면 지금까지 공유한 링크는 더 이상 쓸 수 없어요. 계속할까요?",
    );
    if (confirmed) refreshMutation.mutate();
  }, [refreshMutation]);

  const safeFireId = normalizeProfileImageId(
    userInfo.fireId,
    DEFAULT_PROFILE_IMAGE_ID,
  );

  return (
    <PageWrapper>
      <QrCard>
        <ProfileArea>
          <ProfileImage
            src={`https://portal.inuappcenter.kr/images/profile/${safeFireId}`}
            alt=""
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <DefaultIconArea>
            <Icon name="user-02" size={22} color="#D6D1D5" />
          </DefaultIconArea>
        </ProfileArea>

        <Nickname>{userInfo.nickname || "나"}</Nickname>
        <ProfileSubtitle>{userInfo.department}</ProfileSubtitle>

        <QrArea>
          {isLoading || refreshMutation.isPending ? (
            <QrPlaceholder>불러오는 중…</QrPlaceholder>
          ) : isError || !inviteUrl ? (
            <QrPlaceholder>링크를 불러오지 못했어요.</QrPlaceholder>
          ) : (
            <QRCodeSVG
              value={inviteUrl}
              size={200}
              level="M"
              marginSize={0}
              bgColor="#ffffff"
              fgColor="#333d4b"
            />
          )}
        </QrArea>

        <QrHint>이 QR을 상대방 카메라로 찍으면 바로 친구가 돼요.</QrHint>
      </QrCard>

      <LinkRow>
        <LinkText>{inviteUrl || "링크를 불러오는 중이에요"}</LinkText>
        <IconButton
          type="button"
          onClick={handleCopy}
          disabled={!inviteUrl}
          aria-label="링크 복사"
        >
          {isCopied ? <Icon name="check" size={18} /> : <Copy size={18} />}
        </IconButton>
      </LinkRow>

      <PrimaryButton type="button" onClick={handleShare} disabled={!inviteUrl}>
        <Icon name="share" size={18} />
        링크 공유하기
      </PrimaryButton>

      <SecondaryButton
        type="button"
        onClick={handleRefresh}
        disabled={refreshMutation.isPending}
      >
        <RefreshCw size={16} />
        링크 새로 만들기
      </SecondaryButton>

      <NoticeBox>
        <NoticeTitle>공유하기 전에 확인해주세요</NoticeTitle>
        <NoticeList>
          <li>링크를 연 사람은 <strong>수락 없이 바로 내 친구</strong>가 돼요.</li>
          <li>
            링크에는 닉네임이나 학번이 담기지 않아요. 무작위로 만든 코드예요.
          </li>
          <li>
            링크가 원치 않는 곳에 퍼졌다면 <strong>링크 새로 만들기</strong>로
            즉시 끊을 수 있어요.
          </li>
        </NoticeList>
      </NoticeBox>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px ${MOBILE_PAGE_GUTTER} 40px;
`;

const QrCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 20px 20px;
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
`;

const ProfileArea = styled.div`
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--bg-muted, #f1f3f5);
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
  object-fit: cover;
  z-index: 1;
`;

const Nickname = styled.div`
  margin-top: 10px;
  font-family: Pretendard;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary, #333d4b);
`;

const ProfileSubtitle = styled.div`
  margin-top: 2px;
  font-family: Pretendard;
  font-size: 13px;
  color: var(--text-tertiary, #8b95a1);
`;

const QrArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 232px;
  height: 232px;
  margin-top: 20px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid var(--border-subtle, #f1f3f5);
`;

const QrPlaceholder = styled.div`
  font-family: Pretendard;
  font-size: 14px;
  color: var(--text-tertiary, #8b95a1);
`;

const QrHint = styled.p`
  margin: 14px 0 0;
  font-family: Pretendard;
  font-size: 13px;
  line-height: 19px;
  color: var(--text-tertiary, #8b95a1);
  text-align: center;
`;

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 12px 12px 16px;
  background: var(--bg-subtle, #f8f9fb);
  border-radius: 14px;
`;

const LinkText = styled.span`
  flex: 1;
  min-width: 0;
  font-family: Pretendard;
  font-size: 13px;
  color: var(--text-secondary, #6b7684);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #ffffff);
  color: var(--text-secondary, #6b7684);
  cursor: pointer;
  outline: none;

  &:active:not(:disabled) {
    background-color: var(--bg-muted, #f1f3f5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 46px;
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 999px;
  background: var(--bg-base, #ffffff);
  color: var(--text-secondary, #6b7684);
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  outline: none;

  &:active:not(:disabled) {
    background-color: var(--bg-muted, #f1f3f5);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const NoticeBox = styled.div`
  margin-top: 4px;
  padding: 16px;
  background: var(--bg-subtle, #f8f9fb);
  border-radius: 16px;
`;

const NoticeTitle = styled.div`
  font-family: Pretendard;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary, #333d4b);
  margin-bottom: 8px;
`;

const NoticeList = styled.ul`
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  li {
    font-family: Pretendard;
    font-size: 13px;
    line-height: 19px;
    color: var(--text-secondary, #6b7684);
  }

  strong {
    color: var(--text-primary, #333d4b);
    font-weight: 600;
  }
`;
