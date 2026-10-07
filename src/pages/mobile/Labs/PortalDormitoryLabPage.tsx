import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import ActionButton from "@/components/common/ActionButton";
import { ROUTES } from "@/constants/routes";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import {
  checkPortalAccountLinked,
  fetchDormitoryStudentInfoFromApp,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import { DormitoryStudentInfo } from "@/utils/ssvParser";
import { PortalAccountModal } from "@/components/mobile/agent/PortalAccountModal";
import { FEATURE_FLAG_KEYS } from "@/types/featureFlags";
import { formatKoreanDateTime } from "@/utils/date";
import {
  Home,
  Bed,
  Calendar,
  Utensils,
  Award,
  User,
  Clock,
  Smartphone,
  Code,
  CheckCircle2,
} from "lucide-react";
import { openIntipAppOrStore } from "@/utils/appLauncher";

const PortalDormitoryLabPage = () => {
  const navigate = useNavigate();
  const { enabled: isLabsEnabled, isFetched: isLabsFlagFetched } = useFeatureFlag(
    FEATURE_FLAG_KEYS.LABS,
  );

  const [dormInfo, setDormInfo] = useState<DormitoryStudentInfo | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isFetched, setIsFetched] = useState(false);
  const [isPortalAccountModalOpen, setIsPortalAccountModalOpen] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  useHeader({
    title: "생활원 사생정보 (실험실)",
  });

  useEffect(() => {
    if (isLabsFlagFetched && !isLabsEnabled) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [isLabsFlagFetched, isLabsEnabled, navigate]);

  const loadDormitoryInfo = useCallback(async () => {
    if (!isMobileAppEnvironment()) {
      setIsPortalAccountModalOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage("기숙사 사생 정보를 포털 ERP에서 안전하게 조회하고 있습니다...");

      const isLinked = await checkPortalAccountLinked();
      if (!isLinked) {
        setIsPortalAccountModalOpen(true);
        setIsLoading(false);
        return;
      }

      const res = await fetchDormitoryStudentInfoFromApp();
      if (res.success && res.data) {
        setDormInfo(res.data);
        setLastUpdated(new Date().toISOString());
        setIsFetched(true);
      } else {
        alert(res.errorMessage || "생활원 사생 정보 조회 중 오류가 발생했습니다.");
      }
    } catch (e: any) {
      alert(e?.message || "생활원 사생 정보 조회 실패");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  }, []);

  useEffect(() => {
    loadDormitoryInfo();
  }, [loadDormitoryInfo]);

  return (
    <Container>
      <TitleContentArea
        title="생활원 사생정보 조회 (실험실)"
        description="포털 종합정보시스템(부속행정 > 생활원 > 사생관리)에서 학생 본인의 배정 호실, 침대, 입퇴사 일정, 상벌점 내역 및 식수 신청 현황을 안전하게 실시간 조회합니다."
      >
        <NoticeBox>
          <div className="icon">
            <Home size={18} />
          </div>
          <div className="text">
            <strong>로컬 보안 브릿지 조회 안내</strong>
            <p>
              사생 정보는 외부 서버에 절대 전송되지 않으며, 사용자 기기 내부의 포털 ERP 세션을 통해
              직접 로컬 브라우저로 가져옵니다.
            </p>
          </div>
        </NoticeBox>

        {!isMobileAppEnvironment() && (
          <WebFallbackCard>
            <Smartphone size={32} />
            <div className="title">인팁 모바일 앱 전용 기능입니다</div>
            <div className="desc">
              포털 ERP 생활원 스크래핑은 모바일 앱의 안전한 백그라운드 SSO 세션을 통해 작동합니다.
            </div>
            <ActionButton
              as="button"
              onClick={() => openIntipAppOrStore(ROUTES.LABS.PORTAL.DORMITORY)}
            >
              인팁 앱 열기 / 설치
            </ActionButton>
          </WebFallbackCard>
        )}

        {isMobileAppEnvironment() && (
          <ActionArea>
            <ActionButton
              as="button"
              disabled={isLoading}
              onClick={loadDormitoryInfo}
            >
              {isLoading ? loadingMessage || "조회 중..." : "사생 정보 새로고침"}
            </ActionButton>
            {lastUpdated && (
              <LastUpdatedText>
                <Clock size={13} />
                최근 갱신: {formatKoreanDateTime(lastUpdated)}
              </LastUpdatedText>
            )}
          </ActionArea>
        )}

        {dormInfo && (
          <ContentSection>
            {/* 1. 핵심 배정 카드 */}
            <SectionTitle>
              <Bed size={18} /> 기숙사 배정 및 거주 현황
            </SectionTitle>
            <CardGrid>
              <StatCard>
                <div className="label">생활원 / 건물</div>
                <div className="value highlight">
                  {dormInfo.dormitoryBuilding || "생활원"}
                </div>
              </StatCard>
              <StatCard>
                <div className="label">배정 호실 / 침대</div>
                <div className="value primary">
                  {dormInfo.roomNumber ? `${dormInfo.roomNumber}호` : "미배정"}
                  {dormInfo.bedNumber ? ` (${dormInfo.bedNumber}번 침대)` : ""}
                </div>
              </StatCard>
              <StatCard>
                <div className="label">룸 타입</div>
                <div className="value">{dormInfo.roomType || "2인실"}</div>
              </StatCard>
              <StatCard>
                <div className="label">거주 상태</div>
                <div className="value status">
                  <CheckCircle2 size={16} />
                  {dormInfo.status || "거주중"}
                </div>
              </StatCard>
            </CardGrid>

            {/* 2. 일정 및 식수 카드 */}
            <SectionTitle>
              <Calendar size={18} /> 입·퇴사 및 식수 정보
            </SectionTitle>
            <InfoCard>
              <InfoRow>
                <span className="key"><Calendar size={14} /> 입사일자</span>
                <span className="val">{dormInfo.checkInDate || "-"}</span>
              </InfoRow>
              <InfoRow>
                <span className="key"><Calendar size={14} /> 퇴사(예정)일자</span>
                <span className="val">{dormInfo.checkOutDate || "-"}</span>
              </InfoRow>
              <InfoRow>
                <span className="key"><Utensils size={14} /> 신청 식수 유형</span>
                <span className="val">{dormInfo.mealType || "미신청 또는 의무식"}</span>
              </InfoRow>
              {dormInfo.studentName && (
                <InfoRow>
                  <span className="key"><User size={14} /> 사생 성명 (학번)</span>
                  <span className="val">{dormInfo.studentName} ({dormInfo.studentId})</span>
                </InfoRow>
              )}
            </InfoCard>

            {/* 3. 상벌점 관리 */}
            <SectionTitle>
              <Award size={18} /> 상벌점 현황
            </SectionTitle>
            <PointSummaryBox>
              <PointStat type="merit">
                <div className="title">누적 상점</div>
                <div className="score">+{dormInfo.meritPoints}점</div>
              </PointStat>
              <PointStat type="demerit">
                <div className="title">누적 벌점</div>
                <div className="score">-{dormInfo.demeritPoints}점</div>
              </PointStat>
              <PointStat type="total">
                <div className="title">총 점수</div>
                <div className="score">{dormInfo.totalPoints}점</div>
              </PointStat>
            </PointSummaryBox>

            {dormInfo.pointsList && dormInfo.pointsList.length > 0 ? (
              <PointList>
                {dormInfo.pointsList.map((pt, idx) => (
                  <PointItem key={idx} isDemerit={pt.type === "DEMERIT"}>
                    <div className="header">
                      <span className="type">{pt.typeName} {pt.points}점</span>
                      <span className="date">{pt.date}</span>
                    </div>
                    <div className="reason">{pt.reason}</div>
                  </PointItem>
                ))}
              </PointList>
            ) : (
              <EmptyBox>상벌점 부여 내역이 없습니다.</EmptyBox>
            )}

            {/* 4. 디버그 원시 데이터 토글 */}
            <DebugArea>
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowRawJson(!showRawJson)}
              >
                <Code size={14} />
                {showRawJson ? "원시 파싱 데이터 닫기" : "원시 파싱 데이터 보기"}
              </button>
              {showRawJson && (
                <pre className="json-dump">
                  {JSON.stringify(dormInfo, null, 2)}
                </pre>
              )}
            </DebugArea>
          </ContentSection>
        )}

        {isFetched && !dormInfo && !isLoading && (
          <EmptyBox>생활원 사생 정보가 존재하지 않거나 입사 이력이 없습니다.</EmptyBox>
        )}
      </TitleContentArea>

      <PortalAccountModal
        isOpen={isPortalAccountModalOpen}
        onClose={() => setIsPortalAccountModalOpen(false)}
        onSuccess={() => {
          setIsPortalAccountModalOpen(false);
          loadDormitoryInfo();
        }}
      />
    </Container>
  );
};

export default PortalDormitoryLabPage;

const Container = styled.div`
  padding: 16px;
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NoticeBox = styled.div`
  display: flex;
  gap: 12px;
  background-color: #f0f7ff;
  padding: 14px 16px;
  border-radius: 12px;
  color: #0055b8;
  font-size: 13px;
  line-height: 1.5;
  margin-top: 12px;

  .icon {
    flex-shrink: 0;
    margin-top: 2px;
  }

  strong {
    display: block;
    margin-bottom: 2px;
    font-weight: 600;
  }

  p {
    margin: 0;
    opacity: 0.9;
  }
`;

const WebFallbackCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 20px;
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  gap: 12px;
  margin-top: 16px;

  svg {
    color: #0066cc;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
  }

  .desc {
    font-size: 13px;
    color: #64748b;
    max-width: 320px;
    line-height: 1.5;
    margin-bottom: 8px;
  }
`;

const ActionArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

const LastUpdatedText = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 20px;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const StatCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .label {
    font-size: 12px;
    color: #64748b;
  }

  .value {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;

    &.primary {
      color: #0066cc;
    }

    &.highlight {
      color: #0284c7;
    }

    &.status {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #10b981;
      font-size: 14px;
    }
  }
`;

const InfoCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;

  .key {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #64748b;
  }

  .val {
    font-weight: 600;
    color: #1e293b;
  }
`;

const PointSummaryBox = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const PointStat = styled.div<{ type: "merit" | "demerit" | "total" }>`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 10px;
  text-align: center;

  .title {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 4px;
  }

  .score {
    font-size: 18px;
    font-weight: 800;
    color: ${({ type }) =>
      type === "merit"
        ? "#10b981"
        : type === "demerit"
        ? "#ef4444"
        : "#0f172a"};
  }
`;

const PointList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PointItem = styled.div<{ isDemerit: boolean }>`
  background: ${({ isDemerit }) => (isDemerit ? "#fff1f2" : "#f0fdf4")};
  border: 1px solid ${({ isDemerit }) => (isDemerit ? "#fecdd3" : "#bbf7d0")};
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .header {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 700;
    color: ${({ isDemerit }) => (isDemerit ? "#e11d48" : "#16a34a")};

    .date {
      color: #64748b;
      font-weight: normal;
    }
  }

  .reason {
    font-size: 13px;
    color: #1e293b;
  }
`;

const EmptyBox = styled.div`
  padding: 28px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
`;

const DebugArea = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: #64748b;
    font-size: 12px;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 6px;
    &:hover {
      background: #f1f5f9;
    }
  }

  .json-dump {
    width: 100%;
    margin-top: 8px;
    padding: 12px;
    background: #0f172a;
    color: #38bdf8;
    border-radius: 8px;
    font-size: 11px;
    overflow-x: auto;
    font-family: monospace;
  }
`;
