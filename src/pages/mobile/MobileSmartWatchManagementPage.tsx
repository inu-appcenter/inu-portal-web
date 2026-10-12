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
import CapsuleButton from "@/components/common/CapsuleButton";
import EmptyState from "@/components/common/EmptyState";
import { openIntipAppOrStore } from "@/utils/appLauncher";
import { typography } from "@/styles/typography";
import {
  Search,
  X,
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

  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "library" | "assignment" | "server" | "local">("all");

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
    } catch (e: unknown) {
      console.error("알림 목록 로드 실패:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchAllJobs();
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
    } catch (e: unknown) {
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

  const filterPredicate = (job: UnifiedWatchJob) => {
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchTarget = job.targetName.toLowerCase().includes(q);
      const matchDomain = job.domainName.toLowerCase().includes(q);
      if (!matchTarget && !matchDomain) return false;
    }
    if (filterType === "library") {
      const isLib = job.domainName.includes("열람실") || job.domainName.includes("스터디룸") || job.domainName.includes("좌석");
      if (!isLib) return false;
    } else if (filterType === "assignment") {
      if (!job.domainName.includes("과제")) return false;
    } else if (filterType === "server") {
      if (job.source !== "SERVER") return false;
    } else if (filterType === "local") {
      if (job.source !== "LOCAL") return false;
    }
    return true;
  };

  const filteredActiveJobs = activeJobs.filter(filterPredicate);
  const filteredPastJobs = pastJobs.filter(filterPredicate);

  return (
    <Container as="main">
      <HubSection as="section" aria-label="연관 서비스 바로가기">
        <HubCard
          role="button"
          tabIndex={0}
          onClick={() => navigate(ROUTES.SERVICES.LIBRARY)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate(ROUTES.SERVICES.LIBRARY);
            }
          }}
        >
          <HubLeft>
            <HubIconWrapper $bg="var(--bg-brand)" $color="var(--interactive-primary)">
              <BookOpen size={18} />
            </HubIconWrapper>
            <HubContent>
              <HubTitle>학산도서관 좌석 및 스터디룸</HubTitle>
              <HubDesc>열람실 잔여석 확인 및 빈자리 알림 신청</HubDesc>
            </HubContent>
          </HubLeft>
          <ChevronRight size={18} color="var(--text-disabled)" />
        </HubCard>

        <HubCard
          role="button"
          tabIndex={0}
          onClick={() => navigate(ROUTES.SERVICES.LMS)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate(ROUTES.SERVICES.LMS);
            }
          }}
        >
          <HubLeft>
            <HubIconWrapper $bg="var(--bg-subtle)" $color="var(--border-success)">
              <GraduationCap size={18} />
            </HubIconWrapper>
            <HubContent>
              <HubTitle>이러닝 (LMS)</HubTitle>
              <HubDesc>수강 강좌 및 과제 마감 일정 확인</HubDesc>
            </HubContent>
          </HubLeft>
          <ChevronRight size={18} color="var(--text-disabled)" />
        </HubCard>
      </HubSection>

      <section aria-label="진행 중인 알림">
        <SectionHeader>
          <SectionTitle>진행 중인 알림 ({filteredActiveJobs.length})</SectionTitle>
          <RefreshButton onClick={() => void fetchAllJobs()} disabled={isLoading}>
            <RefreshCw size={13} className={isLoading ? "spin" : ""} />
            <span>새로고침</span>
          </RefreshButton>
        </SectionHeader>

        {/* 검색 및 필터 바 */}
        {activeJobs.length > 0 && (
          <FilterArea>
            <SearchBox>
              <Search size={16} color="var(--text-tertiary)" />
              <SearchInput
                type="text"
                placeholder="알림 대상 또는 열람실/과목명 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="알림 검색"
              />
              {searchQuery && (
                <ClearBtn onClick={() => setSearchQuery("")} type="button" aria-label="검색어 지우기">
                  <X size={14} />
                </ClearBtn>
              )}
            </SearchBox>
            <ChipRow role="tablist" aria-label="알림 필터">
              <FilterChip
                type="button"
                role="tab"
                aria-selected={filterType === "all"}
                $active={filterType === "all"}
                onClick={() => setFilterType("all")}
              >
                전체
              </FilterChip>
              <FilterChip
                type="button"
                role="tab"
                aria-selected={filterType === "library"}
                $active={filterType === "library"}
                onClick={() => setFilterType("library")}
              >
                도서관 좌석/스터디룸
              </FilterChip>
              <FilterChip
                type="button"
                role="tab"
                aria-selected={filterType === "assignment"}
                $active={filterType === "assignment"}
                onClick={() => setFilterType("assignment")}
              >
                과제 마감
              </FilterChip>
              <FilterChip
                type="button"
                role="tab"
                aria-selected={filterType === "server"}
                $active={filterType === "server"}
                onClick={() => setFilterType("server")}
              >
                서버 푸시
              </FilterChip>
              <FilterChip
                type="button"
                role="tab"
                aria-selected={filterType === "local"}
                $active={filterType === "local"}
                onClick={() => setFilterType("local")}
              >
                기기 알림
              </FilterChip>
            </ChipRow>
          </FilterArea>
        )}

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
        ) : !isMobileAppEnvironment() ? (
          <EmptyStateCard>
            <EmptyStateContent>
              <Smartphone size={32} color="var(--interactive-primary)" />
              <EmptyStateTitle>INTIP 모바일 앱에서 이용할 수 있어요</EmptyStateTitle>
              <EmptyStateDescription>
                도서관 빈자리 알림 및 과제 마감 리마인더는 기기 백그라운드 환경이 지원되는 INTIP 모바일 앱에서 제공돼요.
              </EmptyStateDescription>
              <CapsuleButton
                variant="brand"
                style={{ marginTop: "12px", padding: "8px 20px" }}
                onClick={() => openIntipAppOrStore("smart-watch")}
              >
                앱에서 열기
              </CapsuleButton>
            </EmptyStateContent>
          </EmptyStateCard>
        ) : activeJobs.length === 0 ? (
          <EmptyStateCard>
            <EmptyState padding="32px 0">진행 중인 알림이 없어요. 도서관이나 LMS 과제에서 알림을 등록해보세요.</EmptyState>
          </EmptyStateCard>
        ) : filteredActiveJobs.length === 0 ? (
          <EmptyStateCard>
            <EmptyState padding="32px 0">검색 조건과 일치하는 알림이 없어요.</EmptyState>
          </EmptyStateCard>
        ) : (
          <JobList>
            {filteredActiveJobs.map((job) => (
              <Box key={`${job.source}_${job.id}`} style={{ padding: "16px", width: "100%", boxSizing: "border-box" }}>
                <CardTop>
                  <BadgeGroup>
                    <DomainBadge>{job.domainName}</DomainBadge>
                    <SourceBadge $isServer={job.source === "SERVER"}>
                      {job.source === "SERVER" ? <Cloud size={11} /> : <Smartphone size={11} />}
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
                  <CancelButton type="button" onClick={() => setTargetJobToCancel(job)}>
                    <Trash2 size={13} />
                    <span>알림 취소</span>
                  </CancelButton>
                </CardFooter>
              </Box>
            ))}
          </JobList>
        )}
      </section>

      {filteredPastJobs.length > 0 && (
        <PastSection as="section" aria-label="최근 완료된 알림">
          <SectionTitle style={{ marginBottom: "12px" }}>
            최근 완료된 알림 ({filteredPastJobs.length})
          </SectionTitle>
          <JobList>
            {filteredPastJobs.slice(0, 5).map((job) => {
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
        </PastSection>
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

      <FootnoteText>기기 백그라운드 작업은 휴대폰 환경에 맞추어 안전하게 수행돼요.</FootnoteText>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 16px ${MOBILE_PAGE_GUTTER} calc(24px + var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)));

  @media ${DESKTOP_MEDIA} {
    max-width: 1200px;
    padding: 24px 0 calc(32px + var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)));
  }
`;

const PastSection = styled.div`
  margin-top: var(--space-4);
`;

const FootnoteText = styled.p`
  margin: var(--space-4) 0 0;
  ${typography.caption1}
  color: var(--text-tertiary);
  text-align: center;
`;

const HubSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: var(--space-2);
  width: 100%;
  box-sizing: border-box;

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
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  transition: transform 0.12s ease-in-out, background-color 0.12s ease;

  &:active {
    transform: scale(0.98);
    background: var(--bg-subtle);
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
  border-radius: var(--radius-sm);
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
  ${typography.heading2}
  font-size: 14px;
  color: var(--text-primary);
`;

const HubDesc = styled.div`
  ${typography.caption1}
  color: var(--text-tertiary);
  margin-top: 2px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
  width: 100%;
  box-sizing: border-box;
`;

const FilterArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: var(--space-3);
  width: 100%;
  box-sizing: border-box;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 9px 12px;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.15s ease;

  &:focus-within {
    border-color: var(--interactive-primary);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  ${typography.body2}
  color: var(--text-primary);
  outline: none;
  min-width: 0;

  &::placeholder {
    color: var(--text-disabled);
  }
`;

const ClearBtn = styled.button`
  background: none;
  border: none;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-disabled);
  cursor: pointer;
  border-radius: var(--radius-full);

  &:hover {
    color: var(--text-primary);
  }
`;

const ChipRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
  width: 100%;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterChip = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  ${typography.label3}
  color: ${({ $active }) => ($active ? "var(--text-brand)" : "var(--text-secondary)")};
  background: ${({ $active }) => ($active ? "var(--bg-brand)" : "var(--bg-muted)")};
  border: 1px solid ${({ $active }) => ($active ? "var(--interactive-primary)" : "var(--border-default)")};
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.12s ease;
  white-space: nowrap;

  &:active {
    transform: scale(0.97);
  }
`;

const SectionTitle = styled.h2`
  ${typography.title4}
  color: var(--text-primary);
  margin: 0;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  ${typography.label3}
  color: var(--text-tertiary);
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

const EmptyStateCard = styled(Box)`
  padding: 32px 16px;
  width: 100%;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;
`;

const EmptyStateContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  gap: var(--space-2);
`;

const EmptyStateTitle = styled.div`
  ${typography.heading2}
  color: var(--text-primary);
  margin-top: var(--space-1);
  text-align: center;
`;

const EmptyStateDescription = styled.div`
  ${typography.body2}
  color: var(--text-tertiary);
  max-width: 320px;
  line-height: 1.5;
  text-align: center;
  margin: 0 auto;
`;

const JobList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;

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
  width: 100%;
  box-sizing: border-box;
`;

const BadgeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const DomainBadge = styled.span`
  ${typography.caption1}
  font-weight: 600;
  color: var(--text-brand);
  background: var(--bg-brand);
  padding: 3px 8px;
  border-radius: 6px;
`;

const SourceBadge = styled.span<{ $isServer: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  ${typography.caption1}
  font-weight: 600;
  padding: 3px 7px;
  border-radius: 6px;
  background: ${({ $isServer }) => ($isServer ? "var(--bg-subtle)" : "var(--bg-brand)")};
  color: ${({ $isServer }) => ($isServer ? "var(--border-success)" : "var(--text-brand)")};
`;

const RemainingTimeBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  ${typography.caption1}
  font-weight: 600;
  color: var(--text-warn);
`;

const TargetName = styled.div`
  ${typography.heading2}
  color: var(--text-primary);
  width: 100%;
  box-sizing: border-box;
`;

const ConditionDesc = styled.div`
  ${typography.body2}
  color: var(--text-secondary);
  margin-top: 4px;
  width: 100%;
  box-sizing: border-box;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border-default);
  width: 100%;
  box-sizing: border-box;
`;

const NoticeText = styled.span`
  ${typography.caption1}
  color: var(--text-disabled);
`;

const CancelButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  ${typography.label3}
  color: var(--text-error);
  background: var(--bg-error);
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.8;
  }
`;

const PastJobCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-muted);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  width: 100%;
  box-sizing: border-box;
`;

const PastJobTitle = styled.div`
  ${typography.heading3}
  color: var(--text-secondary);
`;

const PastJobTime = styled.div`
  ${typography.caption1}
  color: var(--text-disabled);
  margin-top: 2px;
`;

const StatusTag = styled.span<{ $status: string }>`
  ${typography.caption1}
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  background: ${({ $status }) => ($status === "NOTIFIED" ? "var(--bg-subtle)" : "var(--bg-muted)")};
  color: ${({ $status }) => ($status === "NOTIFIED" ? "var(--border-success)" : "var(--text-tertiary)")};
  border: 1px solid ${({ $status }) => ($status === "NOTIFIED" ? "var(--border-success)" : "var(--border-default)")};
`;
