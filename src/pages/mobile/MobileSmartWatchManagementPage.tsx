import { useEffect, useState } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { getMyCampusWatchJobs, deleteCancelCampusWatch, CampusWatchJob } from "@/apis/agent";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { Bell, Clock, Trash2, RefreshCw } from "lucide-react";

export default function MobileSmartWatchManagementPage() {
  const [jobs, setJobs] = useState<CampusWatchJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useHeader({
    title: "스마트 감시 관리",
    subHeader: null,
    hasback: true,
  });

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await getMyCampusWatchJobs();
      if (res.data) {
        setJobs(res.data);
      }
    } catch (e) {
      console.error("감시 목록 로드 실패:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCancel = async (jobId: number) => {
    if (!window.confirm("이 빈자리 감시를 취소하시겠습니까?")) return;
    try {
      await deleteCancelCampusWatch(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (e) {
      console.error("감시 취소 실패:", e);
      alert("감시 취소에 실패했습니다.");
    }
  };

  const activeJobs = jobs.filter((j) => j.status === "ACTIVE");
  const pastJobs = jobs.filter((j) => j.status !== "ACTIVE");

  return (
    <Container>
      <SectionHeader>
        <SectionTitle>실시간 감시 중 ({activeJobs.length})</SectionTitle>
        <RefreshButton onClick={fetchJobs} disabled={isLoading}>
          <RefreshCw size={14} className={isLoading ? "spin" : ""} />
          <span>새로고침</span>
        </RefreshButton>
      </SectionHeader>

      {activeJobs.length === 0 ? (
        <EmptyBox>
          <Bell size={24} color="#94a3b8" />
          <EmptyText>현재 진행 중인 실시간 빈자리 감시가 없습니다.</EmptyText>
          <EmptySubText>
            캠퍼스 비서에게 "힐링존 자리 나면 알려줘", "제1열람실 빈자리 감시해줘"라고 요청해 보세요!
          </EmptySubText>
        </EmptyBox>
      ) : (
        <JobList>
          {activeJobs.map((job) => (
            <JobCard key={job.id}>
              <CardTop>
                <DomainBadge>{job.domainDescription || "도서관"}</DomainBadge>
                <RemainingTimeBadge>
                  <Clock size={12} />
                  <span>약 {job.remainingMinutes}분 남음</span>
                </RemainingTimeBadge>
              </CardTop>
              <TargetName>{job.targetName} 빈자리 스나이퍼</TargetName>
              <ConditionDesc>
                빈자리(1석 이상) 감지 즉시 FCM 푸시 알림이 발송됩니다.
              </ConditionDesc>
              <CardFooter>
                <NoticeText>서버가 45초마다 안전하게 감시 중입니다.</NoticeText>
                <CancelButton onClick={() => handleCancel(job.id)}>
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
            {pastJobs.slice(0, 5).map((job) => (
              <PastJobCard key={job.id}>
                <div>
                  <PastJobTitle>{job.targetName}</PastJobTitle>
                  <PastJobTime>{new Date(job.createdAt).toLocaleDateString()} {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</PastJobTime>
                </div>
                <StatusTag $status={job.status}>
                  {job.status === "NOTIFIED" ? "알림 완료" : job.status === "EXPIRED" ? "시간 만료" : "취소됨"}
                </StatusTag>
              </PastJobCard>
            ))}
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
    100% { transform: rotate(360deg); }
  }
`;

const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background: #ffffff;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`;

const EmptyText = styled.div`
  font-size: 13.5px;
  font-weight: 600;
  color: #334155;
  margin-top: 10px;
`;

const EmptySubText = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 6px;
  line-height: 1.4;
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

const DomainBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #0061ff;
  background: #eff6ff;
  padding: 2px 7px;
  border-radius: 5px;
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
