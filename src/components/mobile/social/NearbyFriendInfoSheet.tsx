import { useCallback, useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { RefreshCw } from "lucide-react";
import Icon from "@/components/common/Icon";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import BottomSheet from "@/components/common/BottomSheet";
import Modal from "@/components/common/Modal";
import SocialUserCard from "@/components/mobile/social/SocialUserCard";
import useUserStore from "@/stores/useUserStore";
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

interface Coordinates {
  latitude: number;
  longitude: number;
}

const AUTO_REFRESH_INTERVAL_SECONDS = 5;
const PREFETCH_CACHE_TTL_MS = 15000;

type Phase = "consent" | "locating" | "results" | "denied" | "error";

export default function NearbyFriendInfoSheet({
  open,
  onOpenChange,
}: NearbyFriendInfoSheetProps) {
  const queryClient = useQueryClient();
  const { userInfo, setUserInfo } = useUserStore();
  const [phase, setPhase] = useState<Phase>("consent");
  const [nearbyMembers, setNearbyMembers] = useState<NearbyMemberResponseDto[]>(
    [],
  );
  const [requestedIds, setRequestedIds] = useState<number[]>([]);
  const [countdown, setCountdown] = useState<number>(
    AUTO_REFRESH_INTERVAL_SECONDS,
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const isLocatingRef = useRef<boolean>(false);

  const prefetchedCoordsRef = useRef<{
    coords: Coordinates;
    timestamp: number;
  } | null>(null);
  const prefetchPromiseRef = useRef<Promise<Coordinates> | null>(null);

  // 백그라운드에서 미리 GPS 위치 수집 (동의 화면을 보고 있는 동안 워밍업)
  const prefetchLocation = useCallback((): Promise<Coordinates> => {
    if (!navigator.geolocation) {
      return Promise.reject(new Error("GEOLOCATION_UNSUPPORTED"));
    }

    if (
      prefetchedCoordsRef.current &&
      Date.now() - prefetchedCoordsRef.current.timestamp < PREFETCH_CACHE_TTL_MS
    ) {
      return Promise.resolve(prefetchedCoordsRef.current.coords);
    }

    if (prefetchPromiseRef.current) {
      return prefetchPromiseRef.current;
    }

    const promise = new Promise<Coordinates>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          prefetchedCoordsRef.current = { coords, timestamp: Date.now() };
          prefetchPromiseRef.current = null;
          resolve(coords);
        },
        (err) => {
          prefetchPromiseRef.current = null;
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });

    prefetchPromiseRef.current = promise;
    return promise;
  }, []);

  const locate = useCallback(
    async (showLocatingPhase: boolean = true) => {
      if (isLocatingRef.current) return;

      if (showLocatingPhase) {
        setPhase("locating");
      } else {
        setIsRefreshing(true);
      }

      isLocatingRef.current = true;
      try {
        const coords = await prefetchLocation();
        if (!showLocatingPhase) {
          // 자동/수동 갱신 시 다음 주기를 위해 캐시 만료
          prefetchedCoordsRef.current = null;
        }

        await updateMyLocation(coords.latitude, coords.longitude);
        const res = await getNearbyFriends(coords.latitude, coords.longitude);
        setNearbyMembers(res.data);
        setPhase("results");
        setCountdown(AUTO_REFRESH_INTERVAL_SECONDS);
      } catch (err: any) {
        const msg = err?.response?.data?.msg || "";
        if (
          msg.includes("동의") ||
          (err?.response?.status === 400 && msg.includes("노출"))
        ) {
          setPhase("consent");
        } else if (err?.code === 1 || err?.PERMISSION_DENIED === 1) {
          if (showLocatingPhase) setPhase("denied");
        } else {
          if (showLocatingPhase) setPhase("error");
        }
      } finally {
        isLocatingRef.current = false;
        setIsRefreshing(false);
      }
    },
    [prefetchLocation],
  );

  useEffect(() => {
    if (!open) {
      prefetchedCoordsRef.current = null;
      prefetchPromiseRef.current = null;
      return;
    }

    setRequestedIds([]);
    setCountdown(AUTO_REFRESH_INTERVAL_SECONDS);

    // 1. 바텀시트가 열리는 순간 즉시 백그라운드 GPS 위치 수집 시작 (Warm-up)
    prefetchLocation().catch(() => {});

    // 2. 이미 동의한 상태라면 바로 탐색 진행, 미동의면 동의 화면 표시
    if (userInfo.nearbyVisibility) {
      locate(true);
    } else {
      setPhase("consent");
    }
  }, [open, userInfo.nearbyVisibility, prefetchLocation, locate]);

  // 5초 주기 자동 업데이트 & 카운트다운 타이머
  useEffect(() => {
    if (!open || phase !== "results") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          prefetchedCoordsRef.current = null;
          prefetchPromiseRef.current = null;
          locate(false);
          return AUTO_REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, phase, locate]);

  const handleManualRefresh = () => {
    prefetchedCoordsRef.current = null;
    prefetchPromiseRef.current = null;
    setCountdown(AUTO_REFRESH_INTERVAL_SECONDS);
    locate(false);
  };

  const handleAgree = async () => {
    try {
      await updateNearbyVisibility(true);
      setUserInfo({ ...userInfo, nearbyVisibility: true });
      // 이미 백그라운드에서 prefetchLocation()으로 좌표를 수집해두었으므로 즉시 locate 완료됨
      locate(true);
    } catch (err: any) {
      alert(err?.response?.data?.msg || "위치 노출 설정에 실패했습니다.");
    }
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

  const [confirmTarget, setConfirmTarget] =
    useState<NearbyMemberResponseDto | null>(null);

  const handleRequest = (member: NearbyMemberResponseDto) => {
    setConfirmTarget(member);
  };

  const confirmRequest = () => {
    if (!confirmTarget) return;
    requestMutation.mutate(confirmTarget.nickname, {
      onSuccess: () => {
        setRequestedIds((prev) => [...prev, confirmTarget.memberId]);
        setConfirmTarget(null);
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
          <PrimaryButton onClick={() => locate(true)}>
            <RefreshCw size={16} /> 다시 시도
          </PrimaryButton>
        </StatusBlock>
      )}

      {phase === "results" && (
        <ResultsWrapper>
          <ResultsHeader>
            <ResultsHeaderLeft>
              <Title style={{ margin: 0 }}>내 주변 친구</Title>
              <CountdownBadge>
                {isRefreshing ? "업데이트 중..." : `${countdown}초 뒤 업데이트`}
              </CountdownBadge>
            </ResultsHeaderLeft>
            <RefreshButton
              onClick={handleManualRefresh}
              aria-label="새로고침"
              disabled={isRefreshing}
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "spin" : undefined}
              />
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

      <Modal
        isOpen={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        title="친구 요청"
        description={`${confirmTarget?.nickname}님에게 친구 요청을 보낼까요?`}
        primaryButton={{
          text: "요청 보내기",
          onClick: confirmRequest,
          loading: requestMutation.isPending,
        }}
        secondaryButton={{
          text: "취소",
          onClick: () => setConfirmTarget(null),
        }}
      />
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

const ResultsHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CountdownBadge = styled.span`
  font-family: Pretendard;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-tertiary, #8b95a1);
  background: var(--bg-subtle, #f8f9fb);
  padding: 3px 8px;
  border-radius: 999px;
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }

  .spin {
    animation: ${spin} 1s linear infinite;
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
