import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";
import {
  RefreshCw,
  Database,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Building2,
  MessageSquare,
  Calendar,
  Phone,
  BookOpen,
  Users,
} from "lucide-react";

import { useHeader } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { SOFT_CARD_SHADOW } from "@/styles/shadows";
import useUserStore from "@/stores/useUserStore";
import AdminLayout from "@/components/admin/AdminLayout";
import Switch from "@/components/common/Switch";
import { isAdminUser } from "@/types/admin";
import { reindexAllSearch, reindexSearchDomain } from "@/apis/admin";

interface DomainItem {
  id: string;
  name: string;
  description: string;
  icon: (size: number) => JSX.Element;
  color: string;
}

const DOMAIN_LIST: DomainItem[] = [
  {
    id: "notices",
    name: "학교 공지사항",
    description: "학사, 장학, 채용 등 학교 전체 공지 데이터",
    icon: (size) => <FileText size={size} color="#fff" />,
    color: "#0284c7",
  },
  {
    id: "dept-notices",
    name: "학과 공지사항",
    description: "단과대 및 각 학과별 맞춤 공지 데이터",
    icon: (size) => <Building2 size={size} color="#fff" />,
    color: "#2563eb",
  },
  {
    id: "posts",
    name: "정보나눔 / 게시글",
    description: "학생 커뮤니티 꿀팁 및 질문/답변 게시글",
    icon: (size) => <MessageSquare size={size} color="#fff" />,
    color: "#8b5cf6",
  },
  {
    id: "schedules",
    name: "학사일정",
    description: "수강신청, 시험, 개강/종강 등 연간 학사 일정",
    icon: (size) => <Calendar size={size} color="#fff" />,
    color: "#10b981",
  },
  {
    id: "directory",
    name: "교내 전화번호부",
    description: "교수 연구실, 행정부서, 학과 사무실 연락처",
    icon: (size) => <Phone size={size} color="#fff" />,
    color: "#f59e0b",
  },
  {
    id: "courses",
    name: "개설 강의",
    description: "학기별 개설 강의 목록 및 수업계획서 정보",
    icon: (size) => <BookOpen size={size} color="#fff" />,
    color: "#ec4899",
  },
  {
    id: "clubs",
    name: "동아리",
    description: "중앙동아리 및 학과 소모임 정보",
    icon: (size) => <Users size={size} color="#fff" />,
    color: "#06b6d4",
  },
];

interface LogEntry {
  id: string;
  timestamp: string;
  type: "ALL" | "DOMAIN";
  target: string;
  success: boolean;
  message: string;
  elapsedMs: number;
}

export default function MobileAdminSearchPage() {
  const navigate = useNavigate();
  const { tokenInfo, userInfo } = useUserStore();

  const [recreate, setRecreate] = useState<boolean>(true);
  const [isFullReindexing, setIsFullReindexing] = useState<boolean>(false);
  const [loadingDomain, setLoadingDomain] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useHeader({
    title: "검색 색인 관리",
  });

  useEffect(() => {
    const hasStoredToken = Boolean(localStorage.getItem("tokenInfo"));
    if (!tokenInfo.accessToken && !hasStoredToken) {
      navigate(ROUTES.HOME, { replace: true });
      return;
    }
    if (tokenInfo.accessToken && userInfo.role && !isAdminUser(userInfo.role)) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [navigate, tokenInfo.accessToken, userInfo.role]);

  const addLog = (entry: Omit<LogEntry, "id" | "timestamp">) => {
    const newLog: LogEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 9)]);
  };

  const handleFullReindex = async () => {
    const confirmMessage = recreate
      ? "⚠️ [인덱스 재생성 포함 전체 재색인]\n기존 7개 인덱스를 모두 삭제하고 settings.json(동의어/복합명사 사전)을 새로 반영하여 다시 색인합니다.\n\n진행하시겠습니까? (약 15~30초 소요)"
      : "기존 인덱스 설정을 유지하고 전체 RDB 데이터만 Elasticsearch로 재색인합니다.\n\n진행하시겠습니까?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsFullReindexing(true);
    const startTime = performance.now();

    try {
      const res = await reindexAllSearch(recreate);
      const elapsedMs = Math.round(performance.now() - startTime);
      const msg = res.msg || `전체 ${res.data ?? 0}건 데이터 재색인 완료`;
      addLog({
        type: "ALL",
        target: recreate ? "전체 (인덱스 재생성)" : "전체 (데이터 동기화)",
        success: true,
        message: msg,
        elapsedMs,
      });
      alert(`✅ 재색인 성공!\n${msg} (${(elapsedMs / 1000).toFixed(1)}초 소요)`);
    } catch (err: any) {
      const elapsedMs = Math.round(performance.now() - startTime);
      const errorMsg = err?.message || "재색인 중 오류가 발생했습니다.";
      addLog({
        type: "ALL",
        target: "전체 재색인",
        success: false,
        message: errorMsg,
        elapsedMs,
      });
      alert(`❌ 재색인 실패\n${errorMsg}`);
    } finally {
      setIsFullReindexing(false);
    }
  };

  const handleDomainReindex = async (domain: DomainItem) => {
    if (isFullReindexing || loadingDomain) return;

    if (!window.confirm(`'${domain.name}' (${domain.id}) 데이터를 재색인하시겠습니까?`)) {
      return;
    }

    setLoadingDomain(domain.id);
    const startTime = performance.now();

    try {
      const res = await reindexSearchDomain(domain.id);
      const elapsedMs = Math.round(performance.now() - startTime);
      const msg = res.msg || `${domain.name} ${res.data ?? 0}건 재색인 완료`;
      addLog({
        type: "DOMAIN",
        target: domain.name,
        success: true,
        message: msg,
        elapsedMs,
      });
      alert(`✅ ${domain.name} 재색인 완료!\n${msg} (${(elapsedMs / 1000).toFixed(1)}초 소요)`);
    } catch (err: any) {
      const elapsedMs = Math.round(performance.now() - startTime);
      const errorMsg = err?.message || "도메인 재색인 실패";
      addLog({
        type: "DOMAIN",
        target: domain.name,
        success: false,
        message: errorMsg,
        elapsedMs,
      });
      alert(`❌ ${domain.name} 재색인 실패\n${errorMsg}`);
    } finally {
      setLoadingDomain(null);
    }
  };

  return (
    <AdminLayout>
      <Wrapper>
        {/* 설명 안내 배너 */}
        <NoticeBanner>
          <BannerIconWrapper>
            <Database size={24} color="#0284c7" />
          </BannerIconWrapper>
          <BannerTextContent>
            <BannerTitle>검색 엔진(Elasticsearch) 색인 관리</BannerTitle>
            <BannerDesc>
              공지사항, 게시글, 일정 등 통합 검색 대상 데이터를 ES와 동기화합니다.
              <br />
              <strong>동의어(`국장 → 국가장학금`), 형태소 분석기 사전</strong> 변경 사항을 적용하려면
              반드시 <strong>인덱스 재생성(Recreate)</strong>을 켠 후 전체 재색인을 실행해야 합니다.
            </BannerDesc>
          </BannerTextContent>
        </NoticeBanner>

        {/* 전체 재색인 섹션 */}
        <SectionCard>
          <SectionHeader>
            <SectionIconBox $color="#0284c7">
              <Layers size={22} color="#fff" />
            </SectionIconBox>
            <div>
              <SectionTitle>전체 데이터 재색인</SectionTitle>
              <SectionSubDesc>모든 도메인 데이터를 한 번에 Elasticsearch로 백필합니다.</SectionSubDesc>
            </div>
          </SectionHeader>

          {/* Recreate 토글 옵션 */}
          <OptionBox $active={recreate}>
            <OptionTextGroup>
              <OptionLabel>
                인덱스 삭제 후 재생성 (Recreate Indices)
                <Badge $active={recreate}>{recreate ? "권장 (사전 반영)" : "데이터만 동기화"}</Badge>
              </OptionLabel>
              <OptionHelp>
                {recreate ? (
                  <span style={{ color: "#0369a1" }}>
                    ⚠️ 기존 7개 인덱스를 삭제하고 최신 `settings.json` 설정으로 재생성합니다. 형태소/동의어 업데이트 시 필수입니다.
                  </span>
                ) : (
                  <span>기존 인덱스 구조와 설정을 유지하고 RDB 데이터 문서만 갱신합니다.</span>
                )}
              </OptionHelp>
            </OptionTextGroup>
            <Switch checked={recreate} onCheckedChange={setRecreate} />
          </OptionBox>

          <ActionButton
            $variant="primary"
            onClick={handleFullReindex}
            disabled={isFullReindexing || loadingDomain !== null}
          >
            <RefreshCw size={18} className={isFullReindexing ? "spin" : ""} />
            {isFullReindexing
              ? recreate
                ? "인덱스 재생성 및 전체 재색인 중..."
                : "전체 데이터 재색인 중..."
              : recreate
                ? "인덱스 재생성 및 전체 재색인 실행"
                : "전체 데이터 재색인 실행"}
          </ActionButton>
        </SectionCard>

        {/* 도메인별 개별 재색인 섹션 */}
        <SectionCard>
          <SectionHeader>
            <SectionIconBox $color="#4f46e5">
              <Database size={22} color="#fff" />
            </SectionIconBox>
            <div>
              <SectionTitle>도메인별 개별 재색인</SectionTitle>
              <SectionSubDesc>특정 데이터만 부분적으로 갱신이 필요할 때 사용합니다.</SectionSubDesc>
            </div>
          </SectionHeader>

          <DomainGrid>
            {DOMAIN_LIST.map((domain) => {
              const isLoading = loadingDomain === domain.id;
              return (
                <DomainCard key={domain.id}>
                  <DomainIcon $bg={domain.color}>{domain.icon(22)}</DomainIcon>
                  <DomainInfo>
                    <DomainNameRow>
                      <DomainName>{domain.name}</DomainName>
                      <DomainTag>{domain.id}</DomainTag>
                    </DomainNameRow>
                    <DomainDesc>{domain.description}</DomainDesc>
                  </DomainInfo>
                  <DomainButton
                    onClick={() => handleDomainReindex(domain)}
                    disabled={isFullReindexing || loadingDomain !== null}
                  >
                    <RefreshCw size={14} className={isLoading ? "spin" : ""} />
                    {isLoading ? "색인 중" : "재색인"}
                  </DomainButton>
                </DomainCard>
              );
            })}
          </DomainGrid>
        </SectionCard>

        {/* 최근 실행 기록 */}
        <SectionCard>
          <SectionHeader>
            <SectionIconBox $color="#64748b">
              <Clock size={22} color="#fff" />
            </SectionIconBox>
            <div>
              <SectionTitle>최근 작업 결과</SectionTitle>
              <SectionSubDesc>현재 세션에서 실행한 재색인 결과 기록입니다.</SectionSubDesc>
            </div>
          </SectionHeader>

          {logs.length === 0 ? (
            <EmptyLogBox>아직 실행한 재색인 작업이 없습니다.</EmptyLogBox>
          ) : (
            <LogList>
              {logs.map((log) => (
                <LogItem key={log.id} $success={log.success}>
                  <LogHeader>
                    <LogStatusGroup>
                      {log.success ? (
                        <CheckCircle2 size={16} color="#10b981" />
                      ) : (
                        <AlertTriangle size={16} color="#ef4444" />
                      )}
                      <LogTargetText>{log.target}</LogTargetText>
                      <LogBadge $success={log.success}>
                        {log.success ? "성공" : "실패"}
                      </LogBadge>
                    </LogStatusGroup>
                    <LogMeta>
                      <span>{(log.elapsedMs / 1000).toFixed(1)}s</span>
                      <span>{log.timestamp}</span>
                    </LogMeta>
                  </LogHeader>
                  <LogMsg>{log.message}</LogMsg>
                </LogItem>
              ))}
            </LogList>
          )}
        </SectionCard>
      </Wrapper>
    </AdminLayout>
  );
}

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 0 ${MOBILE_PAGE_GUTTER};
  padding: 20px 0 32px;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    margin: 0;
    padding: 32px 48px;
    gap: 28px;
  }

  .spin {
    animation: ${rotate} 1s linear infinite;
  }
`;

const NoticeBanner = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

const BannerIconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.1);
`;

const BannerTextContent = styled.div`
  flex: 1;
`;

const BannerTitle = styled.h4`
  margin: 0 0 6px;
  font-size: 1rem;
  font-weight: 700;
  color: #0369a1;
`;

const BannerDesc = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #0c4a6e;
  line-height: 1.5;
`;

const SectionCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  box-shadow: ${SOFT_CARD_SHADOW};
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const SectionIconBox = styled.div<{ $color: string }>`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background-color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
`;

const SectionSubDesc = styled.p`
  margin: 2px 0 0;
  font-size: 0.85rem;
  color: #64748b;
`;

const OptionBox = styled.div<{ $active: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 14px;
  background-color: ${(props) => (props.$active ? "#f0f9ff" : "#f8fafc")};
  border: 1px solid ${(props) => (props.$active ? "#7dd3fc" : "#e2e8f0")};
  transition: all 0.2s;
`;

const OptionTextGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OptionLabel = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Badge = styled.span<{ $active: boolean }>`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  background-color: ${(props) => (props.$active ? "#0284c7" : "#64748b")};
  color: #ffffff;
`;

const OptionHelp = styled.div`
  font-size: 0.825rem;
  color: #64748b;
  line-height: 1.4;
`;

const ActionButton = styled.button<{ $variant?: "primary" | "secondary" }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.$variant === "primary"
      ? css`
          background-color: #0284c7;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);

          &:hover:not(:disabled) {
            background-color: #0369a1;
            transform: translateY(-1px);
          }
        `
      : css`
          background-color: #f1f5f9;
          color: #334155;

          &:hover:not(:disabled) {
            background-color: #e2e8f0;
          }
        `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const DomainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media ${DESKTOP_MEDIA} {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const DomainCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
  background-color: #f8fafc;
  transition: all 0.2s;

  &:hover {
    background-color: #f1f5f9;
    border-color: #e2e8f0;
  }
`;

const DomainIcon = styled.div<{ $bg: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: ${(props) => props.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const DomainInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DomainNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DomainName = styled.span`
  font-size: 0.925rem;
  font-weight: 700;
  color: #1e293b;
`;

const DomainTag = styled.span`
  font-size: 0.725rem;
  color: #64748b;
  background-color: #e2e8f0;
  padding: 1px 6px;
  border-radius: 4px;
  font-family: monospace;
`;

const DomainDesc = styled.span`
  font-size: 0.775rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DomainButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: #f8fafc;
    border-color: #94a3b8;
    color: #0f172a;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyLogBox = styled.div`
  padding: 32px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.875rem;
  border: 1px dashed #e2e8f0;
  border-radius: 12px;
`;

const LogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LogItem = styled.div<{ $success: boolean }>`
  padding: 12px 16px;
  border-radius: 10px;
  background-color: ${(props) => (props.$success ? "#f0fdf4" : "#fef2f2")};
  border: 1px solid ${(props) => (props.$success ? "#bbf7d0" : "#fecaca")};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const LogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LogStatusGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LogTargetText = styled.span`
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
`;

const LogBadge = styled.span<{ $success: boolean }>`
  font-size: 0.725rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  background-color: ${(props) => (props.$success ? "#10b981" : "#ef4444")};
  color: #ffffff;
`;

const LogMeta = styled.div`
  display: flex;
  gap: 8px;
  font-size: 0.775rem;
  color: #64748b;
`;

const LogMsg = styled.div`
  font-size: 0.825rem;
  color: #334155;
  line-height: 1.4;
`;
