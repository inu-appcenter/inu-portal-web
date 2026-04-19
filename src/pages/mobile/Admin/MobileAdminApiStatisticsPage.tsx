import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Calendar, Activity, Zap, BarChart3 } from "lucide-react";

import useUserStore from "@/stores/useUserStore.ts";
import { getApiLogs } from "@/apis/admin";
import { ApiLogData } from "@/types/admin";
import { useHeader } from "@/context/HeaderContext";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsDashboardCard from "@/components/admin/StatsDashboardCard";
import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";
import { ROUTES } from "@/constants/routes";
import { SOFT_CARD_SHADOW } from "@/styles/shadows";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";

const METHOD_COLORS: Record<string, string> = {
  GET: "#10b981",
  POST: "#3b82f6",
  PUT: "#f59e0b",
  DELETE: "#ef4444",
  PATCH: "#8b5cf6",
};

const MobileAdminApiStatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { tokenInfo, userInfo } = useUserStore();

  const [apiLogs, setApiLogs] = useState<ApiLogData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const hasStoredToken = Boolean(localStorage.getItem("tokenInfo"));
    if (!tokenInfo.accessToken && !hasStoredToken) {
      navigate(ROUTES.HOME, { replace: true });
      return;
    }
    if (tokenInfo.accessToken && userInfo.role && userInfo.role !== "admin") {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [tokenInfo, userInfo, navigate]);

  useEffect(() => {
    const fetchApiLogs = async () => {
      try {
        setLoading(true);
        const response = await getApiLogs(selectedDate);
        if (Array.isArray(response.data)) {
          setApiLogs(response.data);
        } else {
          setApiLogs([]);
        }
        setError("");
      } catch (err) {
        console.error(err);
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (userInfo.role === "admin") {
      fetchApiLogs();
    }
  }, [selectedDate, userInfo.role]);

  useHeader({
    title: "API 사용 통계",
  });

  const totalCalls = useMemo(() => {
    return apiLogs.reduce((acc, curr) => acc + curr.apiCount, 0);
  }, [apiLogs]);

  const topEndpoint = useMemo(() => {
    if (apiLogs.length === 0) return null;
    return apiLogs[0];
  }, [apiLogs]);

  const filteredLogs = useMemo(() => {
    return apiLogs.filter(log =>
      log.uri.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.method.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [apiLogs, searchQuery]);

  return (
    <AdminLayout>
      <PageWrapper>
        <PageHeader>
          <DateSelector>
            <Calendar size={18} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </DateSelector>
        </PageHeader>

        {error && <ErrorBox>{error}</ErrorBox>}

        <StatsGrid>
          <StatsDashboardCard
            title="총 API 호출"
            value={totalCalls.toLocaleString()}
            icon={Activity}
            color="#0f766e"
            description="오늘 발생한 총 요청"
          />
          <StatsDashboardCard
            title="가장 많이 호출됨"
            value={topEndpoint ? topEndpoint.apiCount.toLocaleString() : 0}
            icon={Zap}
            color="#f59e0b"
            description={topEndpoint ? topEndpoint.uri : "데이터 없음"}
          />
          <StatsDashboardCard
            title="엔드포인트 개수"
            value={apiLogs.length}
            icon={BarChart3}
            color="#3b82f6"
            description="활성 API 경로 수"
          />
        </StatsGrid>

        <LogsSection>
          <LogsHeader>
            <SectionTitle>상세 호출 로그</SectionTitle>
          </LogsHeader>

          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th style={{ width: "60px", textAlign: "center", whiteSpace: "nowrap" }}>순위</th>
                  <th style={{ width: "80px" }}>메소드</th>
                  <th>엔드포인트 (URI)</th>
                  <th style={{ width: "100px", textAlign: "right", paddingRight: "16px", whiteSpace: "nowrap" }}>호출 횟수</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="loading">데이터 로딩 중...</td>
                  </tr>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log, idx) => (
                    <tr key={idx}>
                      <td className="rank">{idx + 1}</td>
                      <td>
                        <MethodBadge $method={log.method}>
                          {log.method}
                        </MethodBadge>
                      </td>
                      <td className="uri">
                        <span>{log.uri}</span>
                      </td>
                      <td className="count">{log.apiCount.toLocaleString()} <small>회</small></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="empty">조회된 데이터가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>
          <SearchSpacer />
        </LogsSection>

        <FloatingSearchBar>
          <MobilePillSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={() => { }}
            placeholder="메소드 또는 엔드포인트를 검색하세요."
          />
        </FloatingSearchBar>
      </PageWrapper>
    </AdminLayout>
  );
};

export default MobileAdminApiStatisticsPage;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;



const DateSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  color: #64748b;

  input {
    border: none;
    font-size: 0.95rem;
    font-weight: 700;
    color: #1e293b;
    outline: none;
    cursor: pointer;
    background: transparent;
  }
`;

const PageWrapper = styled.div`
  margin: 0 ${MOBILE_PAGE_GUTTER};
  padding: 20px 0 24px;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    margin: 0;
    padding: 40px 48px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(90px, 100%), 1fr));
  gap: 8px;
  margin-bottom: 32px;

  @media ${DESKTOP_MEDIA} {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
`;

const LogsSection = styled.div``;

const LogsHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  margin-bottom: 20px;

  @media ${DESKTOP_MEDIA} {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
`;

const SearchSpacer = styled.div`
  height: 88px;
`;

const FloatingSearchBar = styled.div`
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  z-index: 100;

  @media ${DESKTOP_MEDIA} {
    width: min(calc(100% - 48px), 760px);
  }
`;



const TableContainer = styled.div`
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  box-shadow: ${SOFT_CARD_SHADOW};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  thead {
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    
    th {
      padding: 12px 8px;
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      
      @media ${DESKTOP_MEDIA} {
        padding: 16px 24px;
        font-size: 0.8125rem;
      }
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.2s;
      &:hover { background-color: #f8fafc; }
      &:last-child { border-bottom: none; }
    }

    td {
      padding: 12px 8px;
      font-size: 0.875rem;
      color: #334155;

      @media ${DESKTOP_MEDIA} {
        padding: 16px 24px;
        font-size: 0.9375rem;
      }
    }

    .rank { font-weight: 700; color: #94a3b8; white-space: nowrap; text-align: center; }
    .uri { font-family: monospace; font-weight: 500; color: #0f172a; }
    .count { font-weight: 800; color: #0f766e; text-align: right; 
      small { font-weight: 500; color: #94a3b8; font-size: 0.75rem; }
    }
    .loading, .empty { text-align: center; padding: 60px; color: #94a3b8; }
  }
`;

const MethodBadge = styled.span<{ $method: string }>`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 800;
  background-color: ${props => METHOD_COLORS[props.$method] || "#64748b"}20;
  color: ${props => METHOD_COLORS[props.$method] || "#64748b"};
  display: inline-block;
  min-width: 60px;
  text-align: center;
`;

const ErrorBox = styled.div`
  background-color: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 0.875rem;
  font-weight: 600;
`;
