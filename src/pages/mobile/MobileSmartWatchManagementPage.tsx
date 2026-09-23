import { useEffect, useState } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { getMyCampusWatchJobs, deleteCancelCampusWatch, CampusWatchJob } from "@/apis/agent";
import {
  getLocalWatchJobsFromApp,
  cancelLocalWatchJobInApp,
  LocalWatchJob,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { MOBILE_PAGE_GUTTER, DESKTOP_MEDIA } from "@/styles/responsive";
import Skeleton from "@/components/common/Skeleton";
import Box from "@/components/common/Box";
import Modal from "@/components/common/Modal";
import {
  Bell,
  Clock,
  Trash2,
  RefreshCw,
  Smartphone,
  Cloud,
  BookOpen,
  GraduationCap,
  ChevronRight,
} from "lucide-react";

export interface UnifiedWatchJob {
  source: "SERVER" | "LOCAL";
  id: string | number;
  domainName: string;
  targetName: string;
  conditionDesc: string;
  status: "ACTIVE" | "NOTIFIED" | "EXPIRED" | "CANCELLED";
  remainingMinutes?: number;
  createdAt: string | number;
  sourceDesc: string;
}

export default function MobileSmartWatchManagementPage() {
  const [serverJobs, setServerJobs] = useState<CampusWatchJob[]>([]);
  const [localJobs, setLocalJobs] = useState<LocalWatchJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [targetJobToCancel, setTargetJobToCancel] = useState<UnifiedWatchJob | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // 오류 및 알림 안내 모달 상태
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
  });

  const navigate = useNavigate();

  const showAlert = (title: string, description: string) => {
    setAlertModal({ isOpen: true, title, description });
  };

  useHeader({
    title: "빈자리 및 일정 알림",
    subHeader: null,
    hasback: true,
  });

  const fetchAllJobs = async () => {
    setIsLoading(true);
    try {
      const serverRes = await getMyCampusWatchJobs().catch(() => null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawData: any = serverRes?.data;
      const rawJobs = Array.isArray(rawData) ? rawData : rawData?.data;
      setServerJobs(Array.isArray(rawJobs) ? (rawJobs as CampusWatchJob[]) : []);

      if (isMobileAppEnvironment()) {
        const localRes = await getLocalWatchJobsFromApp().catch(() => ({ success: false, data: [] }));
        if (localRes.success && localRes.data) {
          setLocalJobs(localRes.data);
        }
      }
    } catch (e) {
      console.error("알림 목록 로드 실패:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const handleConfirmCancel = async () => {
    if (!targetJobToCancel) return;
    setIsCancelling(true);
    try {
      if (targetJobToCancel.source === "SERVER") {
        await deleteCancelCampusWatch(Number(targetJobToCancel.id));
        setServerJobs((prev) => prev.filter((j) => j.id !== Number(targetJobToCancel.id)));
      } else {
        await cancelLocalWatchJobInApp(String(targetJobToCancel.id));
        setLocalJobs((prev) =>
          prev.map((j) => (j.id === String(targetJobToCancel.id) ? { ...j, status: "CANCELLED" } : j))
        );
      }
      setTargetJobToCancel(null);
    } catch (e) {
      console.error("알림 취소 실패:", e);
      showAlert("알림 취소 오류", "알림 취소 처리에 실패했습니다.");
    } finally {
      setIsCancelling(false);
    }
  };

  const unifiedList: UnifiedWatchJob[] = [
    ...(Array.isArray(serverJobs) ? serverJobs : []).map((s): UnifiedWatchJob => ({
      source: "SERVER",
      id: s.id,
      domainName: s.domainDescription || "도서관 열람실",
      targetName: s.targetName,
      conditionDesc: "빈자리 발생 시 푸시 알림으로 안내합니다.",
      status: s.status,
      remainingMinutes: s.remainingMinutes,
      createdAt: s.createdAt,
      sourceDesc: "서버 푸시 알림",
    })),
    ...(Array.isArray(localJobs) ? localJobs : []).map((l): UnifiedWatchJob => {
      const now = Date.now();
      const remainMs = Math.max(0, l.expiresAt - now);
      const remainMin = Math.ceil(remainMs / (60 * 1000));

      let domainName = "기기 알림";
      let conditionDesc = "조건 만족 시 알림으로 안내합니다.";

      if (l.type === "STUDY_ROOM_SNIPER") {
        domainName = "스터디룸 취소표";
        conditionDesc = "해당 시간대 취소표 발생 시 알림으로 안내합니다.";
      } else if (l.type === "SPECIFIC_SEAT_SNIPER") {
        domainName = "열람실 특정 좌석";
        conditionDesc = "해당 좌석 퇴실/반납 시 알림으로 안내합니다.";
      } else if (l.type === "SEAT_EXPIRATION") {
        domainName = "좌석 만료 리마인더";
        conditionDesc = "이용 종료 20분 전 알림으로 안내합니다.";
      } else if (l.type === "ASSIGNMENT_REMINDER") {
        domainName = "과제 마감 알림";
        conditionDesc = "과제 마감 전 알림으로 안내합니다.";
      }

      return {
        source: "LOCAL",
        id: l.id,
        domainName,
        targetName: l.title || l.targetName,
        conditionDesc,
        status: l.status,
        remainingMinutes: remainMin,
        createdAt: l.createdAt,
        sourceDesc: "기기 백그라운드 알림",
      };
    }),
  ];

  const activeJobs = unifiedList.filter((j) => j.status === "ACTIVE");
  const pastJobs = unifiedList.filter((j) => j.status !== "ACTIVE");

  return (
    <Container>
      <HubSection>
        <HubCard onClick={() => navigate(ROUTES.SERVICES.LIBRARY)}>
          <HubLeft>
            <HubIconWrapper $bg="#eff6ff" $color="#2563eb">
              <BookOpen size={18} />
            </HubIconWrapper>
            <HubContent>
              <HubTitle>학산도서관 좌석 및 스터디룸</HubTitle>
              <HubDesc>열람실 잔여석 확인 및 빈자리 알림 신청</HubDesc>
            </HubContent>
          </HubLeft>
          <ChevronRight size={18} color="#94a3b8" />
        </HubCard>

        <HubCard onClick={() => navigate(ROUTES.SERVICES.LMS)}>
          <HubLeft>
            <HubIconWrapper $bg="#f0fdf4" $color="#16a34a">
              <GraduationCap size={18} />
            </HubIconWrapper>
            <HubContent>
              <HubTitle>이러닝 (LMS)</HubTitle>
              <HubDesc>수강 강좌 및 과제 마감 일정 확인</HubDesc>
            </HubContent>
          </HubLeft>
          <ChevronRight size={18} color="#94a3b8" />
        </HubCard>
      </HubSection>

      <SectionHeader>
        <SectionTitle>진행 중인 알림 ({activeJobs.length})</SectionTitle>
        <RefreshButton onClick={fetchAllJobs} disabled={isLoading}>
          <RefreshCw size={13} className={isLoading ? "spin" : ""} />
          <span>새로고침</span>
        </RefreshButton>
      </SectionHeader>

      {isLoading ? (
        <JobList>
          {[1, 2].map((i) => (
            <Box key={i} style={{ padding: "16px" }}>
              <CardTop>
                <Skeleton width="90px" height="20px" style={{ borderRadius: "6px" }} />
                <Skeleton width="70px" height="16px" />
              </CardTop>
              <Skeleton width="180px" height="18px" style={{ margin: "10px 0 6px" }} />
              <Skeleton width="220px" height="13px" />
            </Box>
          ))}
        </JobList>
      ) : activeJobs.length === 0 ? (
        <>
          {!isMobileAppEnvironment() && (
            <DisabledNoticeCard>
              <DisabledNoticeLeft>
                <Smartphone size={20} color="#0061ff" />
                <DisabledNoticeText>
                  <strong>포털 계정 연동 후(또는 INTIP 모바일 앱에서) 확인할 수 있어요.</strong>
                  <span>기기 백그라운드 빈자리 및 마감 알림은 INTIP 모바일 앱 환경에서 확인하실 수 있습니다.</span>
                </DisabledNoticeText>
              </DisabledNoticeLeft>
            </DisabledNoticeCard>
          )}
          <EmptyBox>
            <Bell size={28} color="#94a3b8" />
            <EmptyText>진행 중인 알림이 없습니다.</EmptyText>
            <EmptySubText>
              도서관 열람실이나 스터디룸, 과제 일정에서 빈자리 및 마감 알림을 등록해보세요.
            </EmptySubText>
          </EmptyBox>
        </>
      ) : (
        <JobList>
          {activeJobs.map((job) => (
            <Box key={`${job.source}_${job.id}`} style={{ padding: "16px" }}>
              <CardTop>
                <BadgeGroup>
                  <DomainBadge>{job.domainName}</DomainBadge>
                  <SourceBadge $isServer={job.source === "SERVER"}>
                    {job.source === "SERVER" ? <Cloud size={10} /> : <Smartphone size={10} />}
                    <span>{job.source === "SERVER" ? "서버" : "기기"}</span>
                  </SourceBadge>
                </BadgeGroup>
                {job.remainingMinutes !== undefined && (
                  <RemainingTimeBadge>
                    <Clock size={12} />
                    <span>약 {job.remainingMinutes}분 남음</span>
                  </RemainingTimeBadge>
                )}
              </CardTop>
              <TargetName>{job.targetName}</TargetName>
              <ConditionDesc>{job.conditionDesc}</ConditionDesc>
              <CardFooter>
                <NoticeText>{job.sourceDesc}</NoticeText>
                <CancelButton onClick={() => setTargetJobToCancel(job)}>
                  <Trash2 size={13} />
                  <span>알림 취소</span>
                </CancelButton>
              </CardFooter>
            </Box>
          ))}
        </JobList>
      )}

      {pastJobs.length > 0 && (
        <>
          <SectionTitle style={{ marginTop: 28, marginBottom: 12 }}>
            최근 완료된 알림 ({pastJobs.length})
          </SectionTitle>
          <JobList>
            {pastJobs.slice(0, 5).map((job) => {
              const dateObj = new Date(job.createdAt);
              return (
                <PastJobCard key={`${job.source}_${job.id}`}>
                  <div>
                    <PastJobTitle>{job.targetName}</PastJobTitle>
                    <PastJobTime>
                      {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </PastJobTime>
                  </div>
                  <StatusTag $status={job.status}>
                    {job.status === "NOTIFIED" ? "알림 완료" : job.status === "EXPIRED" ? "시간 만료" : "취소됨"}
                  </StatusTag>
                </PastJobCard>
              );
            })}
          </JobList>
        </>
      )}

      <Modal
        isOpen={Boolean(targetJobToCancel)}
        onClose={() => setTargetJobToCancel(null)}
        title="알림 취소"
        description={`'${targetJobToCancel?.targetName}' 알림을 취소하시겠습니까?`}
        primaryButton={{
          text: "알림 취소",
          variant: "danger",
          loading: isCancelling,
          onClick: handleConfirmCancel,
        }}
        secondaryButton={{
          text: "닫기",
          variant: "secondary",
          onClick: () => setTargetJobToCancel(null),
        }}
      />

      <Modal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        description={alertModal.description}
        primaryButton={{
          text: "확인",
          variant: "brand",
          onClick: () => setAlertModal((prev) => ({ ...prev, isOpen: false })),
        }}
      />
    </Container>
  );
}

const Container = styled.div`
  padding: 16px ${MOBILE_PAGE_GUTTER}px 40px;
  display: flex;
  flex-direction: column;
  max-width: 600px;
  margin: 0 auto;

  @media ${DESKTOP_MEDIA} {
    max-width: 1200px;
    padding: 24px 0 40px;
  }
`;

const DisabledNoticeCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--bg-muted, #f8fafc);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 16px;

  @media ${DESKTOP_MEDIA} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const DisabledNoticeLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DisabledNoticeText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  strong {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--text-primary, #191f28);
  }
  span {
    font-size: 12px;
    color: var(--text-secondary, #6b7684);
    line-height: 1.4;
  }
`;

const HubSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;

  @media ${DESKTOP_MEDIA} {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
`;

const HubCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 16px;
  padding: 14px 16px;
  cursor: pointer;
  transition: transform 0.12s ease-in-out;

  &:active {
    transform: scale(0.98);
    background: var(--bg-muted, #f8fafc);
  }
`;

const HubLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HubIconWrapper = styled.div<{ $bg: string; $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const HubContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const HubTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #191f28);
`;

const HubDesc = styled.div`
  font-size: 12px;
  color: var(--text-secondary, #6b7684);
  margin-top: 2px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
  margin: 0;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 12px;
  color: var(--text-secondary, #6b7684);
  cursor: pointer;

  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background: var(--bg-muted, #f8fafc);
  border: 1px dashed var(--border-default, #e5e8eb);
  border-radius: 16px;
  text-align: center;
  gap: 8px;
`;

const EmptyText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #333d4b);
  margin-top: 4px;
`;

const EmptySubText = styled.div`
  font-size: 12px;
  color: var(--text-secondary, #8b95a1);
  line-height: 1.5;
  max-width: 280px;
`;

const JobList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media ${DESKTOP_MEDIA} {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 16px;
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const BadgeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const DomainBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-brand, #0061ff);
  background: var(--bg-brand-subtle, #eff6ff);
  padding: 3px 8px;
  border-radius: 6px;
`;

const SourceBadge = styled.span<{ $isServer: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 7px;
  border-radius: 6px;
  background: ${({ $isServer }) => ($isServer ? "#f0fdf4" : "#f5f3ff")};
  color: ${({ $isServer }) => ($isServer ? "#16a34a" : "#7c3aed")};
`;

const RemainingTimeBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #d97706;
`;

const TargetName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #191f28);
`;

const ConditionDesc = styled.div`
  font-size: 13px;
  color: var(--text-secondary, #4e5968);
  margin-top: 4px;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border-default, #f1f5f9);
`;

const NoticeText = styled.span`
  font-size: 11px;
  color: var(--text-disabled, #8b95a1);
`;

const CancelButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--text-error, #ef4444);
  background: var(--bg-error, #fef2f2);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;

  &:active {
    background: #fee2e2;
  }
`;

const PastJobCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-muted, #f8fafc);
  border: 1px solid var(--border-default, #f1f5f9);
  border-radius: 12px;
`;

const PastJobTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary, #333d4b);
`;

const PastJobTime = styled.div`
  font-size: 11px;
  color: var(--text-disabled, #8b95a1);
  margin-top: 2px;
`;

const StatusTag = styled.span<{ $status: string }>`
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  background: ${({ $status }) => ($status === "NOTIFIED" ? "#dcfce7" : "#f1f5f9")};
  color: ${({ $status }) => ($status === "NOTIFIED" ? "#15803d" : "#64748b")};
`;
