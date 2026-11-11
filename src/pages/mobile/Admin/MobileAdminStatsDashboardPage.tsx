import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, CalendarPlus, UserCheck, Users } from "lucide-react";

import { getAdminStats } from "@/apis/admin";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsDashboardCard from "@/components/admin/StatsDashboardCard";
import { ROUTES } from "@/constants/routes";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { typography } from "@/styles/typography";
import {
  ServerStatsApiTrend,
  ServerStatsDailyPoint,
  StatsLogStatus,
  isAdminUser,
} from "@/types/admin";

const PERIODS = [
  { days: 30, label: "30일" },
  { days: 90, label: "90일" },
  { days: 180, label: "180일" },
  { days: 365, label: "1년" },
] as const;

const LOG_STATUS_LABEL: Record<StatsLogStatus, string> = {
  SUMMARY: "",
  RAW: "집계 중",
  MISSING: "로그 없음",
};

/** 기기 시간대 기준 yyyy-MM-dd. toISOString()은 UTC라 한국 0~9시에 전날이 된다. */
const toLocalDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const shortDate = (date: string) => `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`;

const formatNumber = (n: number) => n.toLocaleString("ko-KR");

interface DailyChartRow extends ServerStatsDailyPoint {
  label: string;
  /** 로그가 없는 날은 null로 두어 선을 끊는다 */
  login: number | null;
  avg7: number | null;
}

/** 로그가 있는 날만으로 7일 이동 평균. 한 주에 로그가 있는 날이 4일 미만이면 비운다. */
const withMovingAverage = (daily: ServerStatsDailyPoint[]): DailyChartRow[] =>
  daily.map((p, i) => {
    const window = daily
      .slice(Math.max(0, i - 6), i + 1)
      .filter((d) => d.logStatus !== "MISSING");
    const avg =
      i >= 6 && window.length >= 4
        ? Math.round(window.reduce((sum, d) => sum + d.loginUsers, 0) / window.length)
        : null;
    return {
      ...p,
      label: shortDate(p.date),
      login: p.logStatus === "MISSING" ? null : p.loginUsers,
      avg7: avg,
    };
  });

const MobileAdminStatsDashboardPage = () => {
  const navigate = useNavigate();
  const { tokenInfo, userInfo } = useUserStore();
  const [days, setDays] = useState<number>(30);

  useHeader({ title: "통계 대시보드" });

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

  const range = useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - (days - 1));
    return { from: toLocalDateString(from), to: toLocalDateString(to) };
  }, [days]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["admin-stats", range.from, range.to],
    queryFn: () => getAdminStats({ ...range, apiLimit: 15 }).then((res) => res.data),
    enabled: isAdminUser(userInfo.role),
    staleTime: 1000 * 60 * 5,
  });

  const server = data?.server;
  const stats = server?.status === "OK" ? server.data : null;
  const dailyRows = useMemo(() => (stats ? withMovingAverage(stats.daily) : []), [stats]);
  const cohortRows = useMemo(
    () =>
      (stats?.signupCohorts ?? []).map((c) => ({
        ...c,
        label: `${Number(c.month.slice(5))}월${c.partial ? "*" : ""}`,
        rate: c.signups > 0 ? Math.round((c.activeMembers30d / c.signups) * 100) : 0,
      })),
    [stats],
  );
  const missingDays = stats?.daily.filter((d) => d.logStatus === "MISSING").length ?? 0;
  const hasPartialCohort = cohortRows.some((c) => c.partial);

  return (
    <AdminLayout>
      <PageWrapper>
        <Toolbar>
          <PeriodTabs role="tablist" aria-label="조회 기간">
            {PERIODS.map((p) => (
              <PeriodTab
                key={p.days}
                role="tab"
                aria-selected={days === p.days}
                $active={days === p.days}
                onClick={() => setDays(p.days)}
              >
                {p.label}
              </PeriodTab>
            ))}
          </PeriodTabs>
          <RangeText>
            {range.from} ~ {range.to}
            {isFetching && !isLoading ? " · 불러오는 중" : ""}
          </RangeText>
        </Toolbar>

        {isLoading && <Notice>통계를 불러오는 중입니다.</Notice>}
        {(isError || server?.status === "FAILED") && (
          <Notice $tone="error">
            {server?.message ?? "통계를 불러오지 못했습니다."} 잠시 후 다시 시도해 주세요.
          </Notice>
        )}

        {stats && (
          <>
            <StatsGrid>
              <StatsDashboardCard
                title="전체 회원"
                value={formatNumber(stats.summary.totalMembers)}
                icon={(size) => <Users size={size} />}
                color="var(--interactive-primary)"
              />
              <StatsDashboardCard
                title="최근 7일 접속 회원"
                value={formatNumber(stats.summary.activeMembers7d)}
                icon={(size) => <UserCheck size={size} />}
                color="var(--interactive-primary)"
              />
              <StatsDashboardCard
                title="최근 30일 접속 회원"
                value={formatNumber(stats.summary.activeMembers30d)}
                icon={(size) => <Activity size={size} />}
                color="var(--interactive-primary)"
              />
              <StatsDashboardCard
                title="기간 내 가입"
                value={formatNumber(stats.summary.signups)}
                icon={(size) => <CalendarPlus size={size} />}
                color="var(--interactive-primary)"
              />
            </StatsGrid>

            <Section>
              <SectionTitle>일별 로그인 사용자</SectionTitle>
              <SectionDesc>
                하루 한 번 이상 접속한 회원 수입니다. 비로그인 방문자와 가입자 수는 그래프를 누르면 보입니다.
                {missingDays > 0 && ` 로그가 없는 ${missingDays}일은 선이 끊겨 있습니다.`}
              </SectionDesc>
              <ChartBox $height={260}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--border-default)" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      minTickGap={24}
                      tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={36}
                      allowDecimals={false}
                      tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
                    />
                    <Tooltip content={<DailyTooltip />} cursor={{ stroke: "var(--border-strong)" }} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={28}
                      iconType="plainline"
                      wrapperStyle={{ fontSize: 12 }}
                      formatter={(value) => <LegendText>{value}</LegendText>}
                    />
                    <Line
                      name="일별"
                      type="linear"
                      dataKey="login"
                      stroke="var(--border-brand-subtle)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, stroke: "var(--bg-base)", strokeWidth: 2 }}
                      isAnimationActive={false}
                    />
                    <Line
                      name="7일 평균"
                      type="monotone"
                      dataKey="avg7"
                      stroke="var(--interactive-primary)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartBox>
            </Section>

            <Section>
              <SectionTitle>일별 가입자</SectionTitle>
              <ChartBox $height={180}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--border-default)" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      minTickGap={24}
                      tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={36}
                      allowDecimals={false}
                      tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
                    />
                    <Tooltip content={<DailyTooltip />} cursor={{ fill: "var(--bg-muted)" }} />
                    <Bar
                      name="가입자"
                      dataKey="signups"
                      fill="var(--interactive-primary)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={16}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartBox>
            </Section>

            <Section>
              <SectionTitle>가입 월별 잔존율</SectionTitle>
              <SectionDesc>
                그 달 가입자 중 최근 30일 안에 접속한 비율입니다.
                {hasPartialCohort && " *는 조회 기간에 일부 날짜만 포함된 달입니다."}
              </SectionDesc>
              {cohortRows.length === 0 ? (
                <Empty>기간 내 가입자가 없습니다.</Empty>
              ) : (
                <ChartBox $height={200}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cohortRows} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="var(--border-default)" />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        width={36}
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
                      />
                      <Tooltip content={<CohortTooltip />} cursor={{ fill: "var(--bg-muted)" }} />
                      <Bar
                        name="잔존율"
                        dataKey="rate"
                        fill="var(--interactive-primary)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                        // 막대가 많으면 숫자가 겹쳐서 값은 툴팁으로만 보여 준다
                        label={
                          cohortRows.length <= 8
                            ? {
                                position: "top",
                                fontSize: 11,
                                fill: "var(--text-secondary)",
                                formatter: (v: unknown) => `${String(v)}%`,
                              }
                            : false
                        }
                        isAnimationActive={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartBox>
              )}
            </Section>

            <Section>
              <SectionTitle>API 호출 추이</SectionTitle>
              <SectionDesc>
                기간 내 호출이 많은 순입니다. 서버는 하루 상위 20개 API만 저장해서, 순위 밖인 날은 0으로 보입니다.
                첫 등장일은 처음 하루 상위 20위에 든 날이라 실제 출시일과 다를 수 있습니다.
              </SectionDesc>
              <ApiTable>
                <thead>
                  <tr>
                    <th>API</th>
                    <th>추이</th>
                    <th className="num">합계</th>
                    <th className="date">첫 등장</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.apiTrends.map((t) => (
                    <tr key={`${t.method} ${t.uri}`}>
                      <td>
                        <ApiName>
                          <Method>{t.method}</Method>
                          <Uri title={t.uri}>{t.uri}</Uri>
                        </ApiName>
                      </td>
                      <td>
                        <Sparkline trend={t} />
                      </td>
                      <td className="num">{formatNumber(t.total)}</td>
                      <td className="date">{t.firstSeen ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </ApiTable>
            </Section>
          </>
        )}

        {data && data.mixpanel.status !== "OK" && (
          <Section>
            <SectionTitle>Mixpanel</SectionTitle>
            <Notice $tone={data.mixpanel.status === "FAILED" ? "error" : "muted"}>
              {data.mixpanel.status === "FAILED"
                ? data.mixpanel.message ?? "Mixpanel 통계를 불러오지 못했습니다."
                : "Mixpanel 연동 전입니다. 앱·브라우저 비교와 재방문율은 연동 후 이곳에 표시됩니다."}
            </Notice>
          </Section>
        )}
      </PageWrapper>
    </AdminLayout>
  );
};

export default MobileAdminStatsDashboardPage;

interface TooltipProps<T> {
  active?: boolean;
  payload?: { payload: T }[];
}

const DailyTooltip = ({ active, payload }: TooltipProps<DailyChartRow>) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const statusLabel = LOG_STATUS_LABEL[p.logStatus];
  return (
    <TooltipCard>
      <TooltipTitle>
        {p.date}
        {statusLabel && <StatusTag>{statusLabel}</StatusTag>}
      </TooltipTitle>
      {p.logStatus === "MISSING" ? (
        <TooltipRow>
          <span>접속 기록</span>
          <b>없음</b>
        </TooltipRow>
      ) : (
        <>
          <TooltipRow>
            <span>로그인 사용자</span>
            <b>{formatNumber(p.loginUsers)}</b>
          </TooltipRow>
          {p.avg7 !== null && (
            <TooltipRow>
              <span>7일 평균</span>
              <b>{formatNumber(p.avg7)}</b>
            </TooltipRow>
          )}
          <TooltipRow>
            <span>비로그인 방문자</span>
            <b>{formatNumber(p.guestUsers)}</b>
          </TooltipRow>
        </>
      )}
      <TooltipRow>
        <span>가입자</span>
        <b>{formatNumber(p.signups)}</b>
      </TooltipRow>
    </TooltipCard>
  );
};

const CohortTooltip = ({
  active,
  payload,
}: TooltipProps<{ month: string; signups: number; activeMembers30d: number; rate: number; partial: boolean }>) => {
  if (!active || !payload?.length) return null;
  const c = payload[0].payload;
  return (
    <TooltipCard>
      <TooltipTitle>
        {c.month} 가입
        {c.partial && <StatusTag>일부 기간</StatusTag>}
      </TooltipTitle>
      <TooltipRow>
        <span>가입자</span>
        <b>{formatNumber(c.signups)}</b>
      </TooltipRow>
      <TooltipRow>
        <span>최근 30일 접속</span>
        <b>
          {formatNumber(c.activeMembers30d)} ({c.rate}%)
        </b>
      </TooltipRow>
    </TooltipCard>
  );
};

/** 표 안의 작은 추세선. 축 없이 모양만 보여 주고, 정확한 값은 합계 칸으로 본다. */
const Sparkline = ({ trend }: { trend: ServerStatsApiTrend }) => {
  const width = 96;
  const height = 24;
  const max = Math.max(...trend.daily, 1);
  const step = trend.daily.length > 1 ? width / (trend.daily.length - 1) : 0;
  const points = trend.daily
    .map((v, i) => `${(i * step).toFixed(1)},${(height - 2 - (v / max) * (height - 4)).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={width} height={height} role="img" aria-label={`${trend.uri} 일별 호출 추이`}>
      <polyline points={points} fill="none" stroke="var(--interactive-primary)" strokeWidth={1.5} />
    </svg>
  );
};

const PageWrapper = styled.div`
  margin: 0 ${MOBILE_PAGE_GUTTER};
  padding: 20px 0 56px;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    margin: 0;
    padding: 40px 48px 56px 40px;
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-bottom: 16px;
`;

const PeriodTabs = styled.div`
  display: inline-flex;
  padding: 4px;
  gap: 4px;
  border-radius: 12px;
  background: var(--bg-muted);
`;

const PeriodTab = styled.button<{ $active: boolean }>`
  ${typography.label2}
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  cursor: pointer;
  background: ${({ $active }) => ($active ? "var(--bg-base)" : "transparent")};
  color: ${({ $active }) => ($active ? "var(--text-primary)" : "var(--text-tertiary)")};
`;

const RangeText = styled.span`
  ${typography.caption1}
  color: var(--text-tertiary);
`;

const Notice = styled.div<{ $tone?: "error" | "muted" }>`
  ${typography.body2}
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  background: ${({ $tone }) => ($tone === "error" ? "var(--bg-error)" : "var(--bg-subtle)")};
  color: ${({ $tone }) => ($tone === "error" ? "var(--text-error)" : "var(--text-secondary)")};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 24px;

  @media ${DESKTOP_MEDIA} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
  }
`;

const Section = styled.section`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;

  @media ${DESKTOP_MEDIA} {
    padding: 24px;
  }

  .recharts-surface:focus:not(:focus-visible),
  .recharts-wrapper:focus:not(:focus-visible) {
    outline: none;
  }
`;

const SectionTitle = styled.h2`
  ${typography.title4}
  margin: 0;
  color: var(--text-primary);
`;

const SectionDesc = styled.p`
  ${typography.caption1}
  margin: 4px 0 0;
  color: var(--text-tertiary);
`;

const LegendText = styled.span`
  color: var(--text-secondary);
`;

const ChartBox = styled.div<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => $height}px;
  margin-top: 12px;
`;

const Empty = styled.p`
  ${typography.body2}
  margin: 12px 0 0;
  color: var(--text-tertiary);
`;

const TooltipCard = styled.div`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: 10px;
  padding: 10px 12px;
  min-width: 150px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const TooltipTitle = styled.div`
  ${typography.label3}
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  color: var(--text-primary);
`;

const StatusTag = styled.span`
  ${typography.caption1}
  padding: 0 6px;
  border-radius: 4px;
  background: var(--bg-warn);
  color: var(--text-warn);
`;

const TooltipRow = styled.div`
  ${typography.caption1}
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: var(--text-secondary);

  b {
    color: var(--text-primary);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
`;

const ApiTable = styled.table`
  width: 100%;
  margin-top: 12px;
  border-collapse: collapse;
  table-layout: fixed;

  th {
    ${typography.caption1}
    color: var(--text-tertiary);
    text-align: left;
    padding: 0 4px 8px;
    border-bottom: 1px solid var(--border-default);
  }

  td {
    ${typography.caption1}
    color: var(--text-primary);
    padding: 8px 4px;
    border-bottom: 1px solid var(--border-default);
    vertical-align: middle;
  }

  th:nth-child(2),
  td:nth-child(2) {
    width: 104px;
  }

  .num {
    width: 64px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  /* 모바일 폭에서는 첫 등장일 칸을 숨겨 API 이름 자리를 확보한다 */
  .date {
    display: none;
    width: 88px;
    text-align: right;
    color: var(--text-secondary);
  }

  @media ${DESKTOP_MEDIA} {
    .date {
      display: table-cell;
    }
  }
`;

const ApiName = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const Method = styled.span`
  ${typography.caption1}
  flex-shrink: 0;
  padding: 0 4px;
  border-radius: 4px;
  background: var(--bg-muted);
  color: var(--text-secondary);
`;

const Uri = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
