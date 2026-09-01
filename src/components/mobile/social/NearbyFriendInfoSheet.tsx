import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { RefreshCw } from "lucide-react";
import Icon from "@/components/common/Icon";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import BottomSheet from "@/components/common/BottomSheet";
import SocialUserCard from "@/components/mobile/social/SocialUserCard";
import {
  requestFriend,
  updateMyLocation,
  updateNearbyVisibility,
  getNearbyFriends,
} from "@/apis/friends";
import type { NearbyMemberResponseDto } from "@/types/friends";

interface NearbyFriendInfoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CONSENT_STORAGE_KEY = "__intipNearbyLocationConsent";

type Phase = "consent" | "locating" | "results" | "denied" | "error";

export default function NearbyFriendInfoSheet({
  open,
  onOpenChange,
}: NearbyFriendInfoSheetProps) {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<Phase>("consent");
  const [nearbyMembers, setNearbyMembers] = useState<NearbyMemberResponseDto[]>(
    [],
  );
  const [requestedIds, setRequestedIds] = useState<number[]>([]);

  const locate = useCallback(() => {
    setPhase("locating");
    if (!navigator.geolocation) {
      setPhase("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await updateMyLocation(latitude, longitude);
          const res = await getNearbyFriends(latitude, longitude);
          setNearbyMembers(res.data);
          setPhase("results");
        } catch {
          setPhase("error");
        }
      },
      (err) => {
        setPhase(
          err.code === err.PERMISSION_DENIED ? "denied" : "error",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    if (!open) return;
    setRequestedIds([]);
    if (localStorage.getItem(CONSENT_STORAGE_KEY) === "true") {
      locate();
    } else {
      setPhase("consent");
    }
  }, [open, locate]);

  const handleAgree = async () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "true");
    try {
      await updateNearbyVisibility(true);
    } catch {
      // 노출 설정 실패해도 이번 조회 자체는 계속 진행
    }
    locate();
  };

  const requestMutation = useMutation({
    mutationFn: (nickname: string) => requestFriend(nickname),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sentPendingFriends"] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "친구 요청에 실패했습니다.");
    },
  });

  const handleRequest = (member: NearbyMemberResponseDto) => {
    requestMutation.mutate(member.nickname, {
      onSuccess: () => {
        setRequestedIds((prev) => [...prev, member.memberId]);
      },
    });
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      height={phase === "results" ? 0.75 : "auto"}
      showCloseButton
    >
      {phase === "consent" && (
        <>
          <IconWrapper>
            <Icon name="location" size={24} />
          </IconWrapper>
          <Title>위치 정보 수집·이용 동의</Title>
          <ConsentList>
            <li>
              <strong>수집 항목</strong> · 위치 정보(위도/경도)
            </li>
            <li>
              <strong>수집 목적</strong> · 주변에 있는 친구 찾기
            </li>
            <li>
              <strong>보유 기간</strong> · 기능 사용 중 최신 위치만 보관하며,
              언제든 동의를 철회하면 즉시 삭제돼요
            </li>
          </ConsentList>
          <Description>
            동의하지 않아도 다른 기능은 그대로 이용할 수 있어요.
          </Description>
          <PrimaryButton onClick={handleAgree}>동의하고 계속하기</PrimaryButton>
        </>
      )}

      {phase === "locating" && (
        <StatusBlock>
          <IconWrapper>
            <Icon name="location" size={24} />
          </IconWrapper>
          <Title>주변을 찾는 중이에요</Title>
          <Description>위치 확인 중이에요. 잠시만 기다려주세요.</Description>
        </StatusBlock>
      )}

      {(phase === "denied" || phase === "error") && (
        <StatusBlock>
          <IconWrapper>
            <Icon name="location" size={24} />
          </IconWrapper>
          <Title>
            {phase === "denied" ? "위치 권한이 꺼져 있어요" : "위치를 확인할 수 없어요"}
          </Title>
          <Description>
            {phase === "denied" ? (
              <>
                브라우저/앱 설정에서 위치 권한을 허용한 뒤
                <br />
                다시 시도해주세요.
              </>
            ) : (
              "잠시 후 다시 시도해주세요."
            )}
          </Description>
          <PrimaryButton onClick={locate}>
            <RefreshCw size={16} /> 다시 시도
          </PrimaryButton>
        </StatusBlock>
      )}

      {phase === "results" && (
        <ResultsWrapper>
          <ResultsHeader>
            <Title style={{ margin: 0 }}>내 주변 친구</Title>
            <RefreshButton onClick={locate} aria-label="새로고침">
              <RefreshCw size={16} />
            </RefreshButton>
          </ResultsHeader>

          {nearbyMembers.length === 0 ? (
            <EmptyResult>주변에서 친구를 찾을 수 없어요.</EmptyResult>
          ) : (
            <ResultList>
              {nearbyMembers.map((member) => {
                const isRequested = requestedIds.includes(member.memberId);
                return (
                  <SocialUserCard
                    key={member.memberId}
                    name={member.nickname}
                    subtitle={`${member.distanceMeters}m · ${member.studentId}`}
                    fireId={member.fireId}
                    actionLabel={isRequested ? "요청됨" : "친구 요청"}
                    onActionClick={
                      isRequested ? undefined : () => handleRequest(member)
                    }
                  />
                );
              })}
            </ResultList>
          )}
        </ResultsWrapper>
      )}
    </BottomSheet>
  );
}

const IconWrapper = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: var(--bg-brand, #eff6ff);
  color: var(--text-brand, #0061ff);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px auto 12px;
`;

const StatusBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0 8px;
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

const ConsentList = styled.ul`
  margin: 0 0 16px;
  padding: 16px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--bg-subtle, #f8f9fb);
  border-radius: 16px;

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

const PrimaryButton = styled.button`
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 999px;
  background-color: var(--interactive-primary, #3b82f6);
  color: #ffffff;
  font-family: Pretendard;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  outline: none;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:active {
    background-color: var(--interactive-primary-pressed, #2563eb);
    transform: scale(0.98);
  }
`;

const ResultsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #ffffff);
  color: var(--text-secondary, #6b7684);
  cursor: pointer;
  outline: none;

  &:active {
    background-color: var(--bg-muted, #f1f3f5);
  }
`;

const ResultList = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 -20px;
`;

const EmptyResult = styled.div`
  text-align: center;
  color: var(--text-tertiary, #8b95a1);
  font-family: Pretendard;
  font-size: 14px;
  padding: 40px 0;
`;
