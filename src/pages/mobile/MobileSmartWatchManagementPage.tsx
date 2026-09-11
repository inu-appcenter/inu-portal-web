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
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import Skeleton from "@/components/common/Skeleton";
import { Bell, Clock, Trash2, RefreshCw, Smartphone, Cloud, BookOpen, GraduationCap } from "lucide-react";

export interface UnifiedWatchJob {
  source: 'SERVER' | 'LOCAL';
  id: string | number;
  domainName: string;
  targetName: string;
  conditionDesc: string;
  status: 'ACTIVE' | 'NOTIFIED' | 'EXPIRED' | 'CANCELLED';
  remainingMinutes?: number;
  createdAt: string | number;
  sourceDesc: string;
}

export default function MobileSmartWatchManagementPage() {
  const [serverJobs, setServerJobs] = useState<CampusWatchJob[]>([]);
  const [localJobs, setLocalJobs] = useState<LocalWatchJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useHeader({
    title: "스마트 감시 관리",
    subHeader: null,
    hasback: true,
  });

  const fetchAllJobs = async () => {
    setIsLoading(true);
    try {
      // 1. 서버 감시 목록 조회
      // tokenInstance 인터셉터는 axios response 전체를 반환하므로
      // 런타임: serverRes.data = ApiResponse body = { data: CampusWatchJob[], msg: "" }
      // TS 타입과 실제 런타임 구조가 다르므로 unknown으로 캐스팅 후 안전하게 접근
      const serverRes = await getMyCampusWatchJobs().catch(() => null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawData: any = serverRes?.data;
      const rawJobs = Array.isArray(rawData) ? rawData : rawData?.data;
      setServerJobs(Array.isArray(rawJobs) ? (rawJobs as CampusWatchJob[]) : []);

      // 2. 모바일 앱 로컬 감시 목록 조회 (INTIP 앱 환경인 경우)
      if (isMobileAppEnvironment()) {
        const localRes = await getLocalWatchJobsFromApp().catch(() => ({ success: false, data: [] }));
        if (localRes.success && localRes.data) {
          setLocalJobs(localRes.data);
        }
      }
    } catch (e) {
      console.error("감시 목록 로드 실패:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const handleCancel = async (job: UnifiedWatchJob) => {
    if (!window.confirm(`'${job.targetName}' 감시를 취소하시겠습니까?`)) return;
    try {
      if (job.source === 'SERVER') {
        await deleteCancelCampusWatch(Number(job.id));
        setServerJobs((prev) => prev.filter((j) => j.id !== Number(job.id)));
      } else {
        await cancelLocalWatchJobInApp(String(job.id));
        setLocalJobs((prev) =>
          prev.map((j) => (j.id === String(job.id) ? { ...j, status: 'CANCELLED' } : j))
        );
      }
    } catch (e) {
      console.error("감시 취소 실패:", e);
      alert("감시 취소에 실패했습니다.");
    }
  };

  // 서버 + 로컬 목록을 하나의 통합 구조로 정규화
  const unifiedList: UnifiedWatchJob[] = [
    ...(Array.isArray(serverJobs) ? serverJobs : []).map((s): UnifiedWatchJob => ({
      source: 'SERVER',
      id: s.id,
      domainName: s.domainDescription || "도서관 열람실",
      targetName: s.targetName,
      conditionDesc: "빈자리(1석 이상) 발생 즉시 FCM 푸시 알림이 발송됩니다.",
      status: s.status,
      remainingMinutes: s.remainingMinutes,
      createdAt: s.createdAt,
      sourceDesc: "서버 45초 단일 감시",
    })),
    ...(Array.isArray(localJobs) ? localJobs : []).map((l): UnifiedWatchJob => {
      const now = Date.now();
      const remainMs = Math.max(0, l.expiresAt - now);
      const remainMin = Math.ceil(remainMs / (60 * 1000));
      return {
        source: 'LOCAL',
        id: l.id,
        domainName: l.type === 'STUDY_ROOM_SNIPER' ? "스터디룸 취소표" : "도서관 좌석 리마인더",
        targetName: l.title || l.targetName,
        conditionDesc: l.type === 'STUDY_ROOM_SNIPER'
          ? "취소표 발생 시 상단 헤드업 알림으로 즉시 안내합니다."
          : "만료 20분 전 정시 알림을 발송합니다.",
        status: l.status,
        remainingMinutes: remainMin,
        createdAt: l.createdAt,
        sourceDesc: "기기 내 백그라운드 감시",
      };
    }),
  ];

  const activeJobs = unifiedList.filter((j) => j.status === "ACTIVE");
  const pastJobs = unifiedList.filter((j) => j.status !== "ACTIVE");

  const navigate = useNavigate();

  return (
    <Container>
      {/* 도메인 허브 바로가기 배너 */}
      <HubBannerContainer>
        <HubBannerCard onClick={() => navigate(ROUTES.SERVICES.LIBRARY)}>
          <HubBannerIconWrapper $bgColor="#eff6ff" $iconColor="#2563eb">
            <BookOpen size={18} />
          </HubBannerIconWrapper>
          <HubBannerInfo>
            <HubBannerTitle>학산도서관 허브</HubBannerTitle>
            <HubBannerDesc>열람실/스터디룸 실시간 조회 & 스나이퍼</HubBannerDesc>
          </HubBannerInfo>
        </HubBannerCard>
        <HubBannerCard onClick={() => navigate(ROUTES.SERVICES.LMS)}>
          <HubBannerIconWrapper $bgColor="#f0fdf4" $iconColor="#16a34a">
            <GraduationCap size={18} />
          </HubBannerIconWrapper>
          <HubBannerInfo>
            <HubBannerTitle>사이버캠퍼스 허브</HubBannerTitle>
            <HubBannerDesc>과제·퀴즈 마감일정 & 정시 리마인더</HubBannerDesc>
          </HubBannerInfo>
        </HubBannerCard>
      </HubBannerContainer>

      <SectionHeader>
        <SectionTitle>실시간 감시 중 ({activeJobs.length})</SectionTitle>
        <RefreshButton onClick={fetchAllJobs} disabled={isLoading}>
          <RefreshCw size={14} className={isLoading ? "spin" : ""} />
          <span>새로고침</span>
        </RefreshButton>
      </SectionHeader>

      {isLoading ? (
        <JobList>
          {Array.from({ length: 2 }).map((_, idx) => (
            <JobCard key={`watch-skel-${idx}`}>
              <CardTop>
                <Skeleton width="100px" height="20px" style={{ borderRadius: "5px" }} />
                <Skeleton width="80px" height="18px" style={{ borderRadius: "4px" }} />
              </CardTop>
              <Skeleton width="160px" height="20px" style={{ margin: "10px 0 6px" }} />
              <Skeleton width="220px" height="14px" />
              <CardFooter>
                <Skeleton width="90px" height="14px" />
                <Skeleton width="70px" height="26px" style={{ borderRadius: "6px" }} />
              </CardFooter>
            </JobCard>
          ))}
        </JobList>
      ) : activeJobs.length === 0 ? (
        <EmptyBox>
          <Bell size={24} color="#94a3b8" />
          <EmptyText>현재 진행 중인 실시간 빈자리 감시가 없습니다.</EmptyText>
          <EmptySubText>
            도서관/LMS 허브에서 직접 둘러보며 스나이퍼를 설정하거나, AI 비서에게 "힐링존 자리 나면 알려줘"라고 요청해 보세요!
          </EmptySubText>
        </EmptyBox>
      ) : (
        <JobList>
          {activeJobs.map((job) => (
            <JobCard key={`${job.source}_${job.id}`}>
              <CardTop>
                <BadgeGroup>
                  <DomainBadge>{job.domainName}</DomainBadge>
                  <SourceBadge $isServer={job.source === 'SERVER'}>
                    {job.source === 'SERVER' ? <Cloud size={10} /> : <Smartphone size={10} />}
                    <span>{job.source === 'SERVER' ? '서버 감시' : '기기 감시'}</span>
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
                <CancelButton onClick={() => handleCancel(job)}>
                  <Trash2 size={13} />
                  <span>감시 취소</span>
                </CancelButton>
              </CardFooter>
            </JobCard>
          ))}
        </JobList>
      )}

      {pastJobs.length > 0 && (
        <>
          <SectionTitle style={{ marginTop: 28, marginBottom: 12 }}>
            최근 완료된 감시 ({pastJobs.length})
          </SectionTitle>
          <JobList>
            {pastJobs.slice(0, 5).map((job) => {
              const dateObj = new Date(job.createdAt);
              return (
                <PastJobCard key={`${job.source}_${job.id}`}>
                  <div>
                    <PastJobTitle>{job.targetName}</PastJobTitle>
                    <PastJobTime>
                      {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
    </Container>
  );
}

const Container = styled.div`
  padding: 16px ${MOBILE_PAGE_GUTTER} 40px;
  display: flex;
  flex-direction: column;
`;

const HubBannerContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 24px;
`;

const HubBannerCard = styled.div`
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:active {
    background: #f8fafc;
    transform: scale(0.98);
  }
`;

const HubBannerIconWrapper = styled.div<{ $bgColor: string; $iconColor: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${({ $bgColor }) => $bgColor};
  color: ${({ $iconColor }) => $iconColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;

const HubBannerInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const HubBannerTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
`;

const HubBannerDesc = styled.div`
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
  line-height: 1.3;
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
  color: #1e293b;
  margin: 0;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background: #f8fafc;
  border-radius: 16px;
  text-align: center;
  gap: 8px;
`;

const EmptyText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-top: 4px;
`;

const EmptySubText = styled.div`
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
  max-width: 260px;
`;

const JobList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const JobCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid #f1f5f9;
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
  color: #0061ff;
  background: #eff6ff;
  padding: 2px 7px;
  border-radius: 5px;
`;

const SourceBadge = styled.span<{ $isServer: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 5px;
  background: ${({ $isServer }) => ($isServer ? "#f0fdf4" : "#fdf4ff")};
  color: ${({ $isServer }) => ($isServer ? "#16a34a" : "#9333ea")};
`;

const RemainingTimeBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 600;
  color: #f59e0b;
`;

const TargetName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
`;

const ConditionDesc = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid #f8fafc;
`;

const NoticeText = styled.span`
  font-size: 11px;
  color: #94a3b8;
`;

const CancelButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  font-size: 11.5px;
  color: #ef4444;
  background: #fef2f2;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
`;

const PastJobCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 10px;
`;

const PastJobTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #334155;
`;

const PastJobTime = styled.div`
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
`;

const StatusTag = styled.span<{ $status: string }>`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 5px;
  background: ${({ $status }) => ($status === "NOTIFIED" ? "#dcfce7" : "#f1f5f9")};
  color: ${({ $status }) => ($status === "NOTIFIED" ? "#15803d" : "#64748b")};
`;
