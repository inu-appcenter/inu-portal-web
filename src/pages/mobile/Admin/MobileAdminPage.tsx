import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Users, Activity, Bell, Flag, ArrowRight } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsDashboardCard from "@/components/admin/StatsDashboardCard";
import { getMemberLogs, getApiLogs } from "@/apis/admin";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

const adminPages = [
  {
    label: "접속 유저 통계",
    path: ROUTES.ADMIN.USER_STAT,
    description: "전체 활성 유저 및 유형별 유입 통계",
    icon: Users,
    color: "#3b82f6",
  },
  {
    label: "API 사용 통계",
    path: ROUTES.ADMIN.API_STAT,
    description: "엔드포인트별 호출 빈도 및 트래픽 분석",
    icon: Activity,
    color: "#10b981",
  },
  {
    label: "푸시 알림 전송",
    path: ROUTES.ADMIN.USER_NOTIFICATIION,
    description: "전체 또는 타겟별 맞춤형 푸시 자동화",
    icon: Bell,
    color: "#f59e0b",
  },
  {
    label: "Feature Flag 관리",
    path: ROUTES.ADMIN.FEATURE_FLAGS,
    description: "배포 없이 즉각적인 신규 기능 제어",
    icon: Flag,
    color: "#8b5cf6",
  },
];

const MobileAdminPage = () => {
  const navigate = useNavigate();
  const { tokenInfo, userInfo } = useUserStore();
  const { data: featureFlags } = useFeatureFlags();

  const [stats, setStats] = useState({
    todayUsers: 0,
    apiCalls: 0,
    activeFlags: 0,
  });

  useEffect(() => {
    const hasStoredToken = Boolean(localStorage.getItem("tokenInfo"));

    if (!tokenInfo.accessToken && !hasStoredToken) {
      navigate(ROUTES.HOME, { replace: true });
      return;
    }

    if (tokenInfo.accessToken && userInfo.role && userInfo.role !== "admin") {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [navigate, tokenInfo.accessToken, userInfo.role]);

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const [memberRes, apiRes] = await Promise.all([
          getMemberLogs(today),
          getApiLogs(today),
        ]);

        const totalApiCalls = apiRes.data.reduce(
          (acc, curr) => acc + curr.apiCount,
          0,
        );
        const activeFlagsCount = featureFlags
          ? Object.values(featureFlags).filter((v) => v).length
          : 0;

        setStats({
          todayUsers: memberRes.data.memberCount,
          apiCalls: totalApiCalls,
          activeFlags: activeFlagsCount,
        });
      } catch (err) {
        console.error("퀵 통계 로딩 실패", err);
      }
    };

    if (userInfo.role === "admin") {
      fetchQuickStats();
    }
  }, [userInfo.role, featureFlags]);

  useHeader({
    title: "관리자 페이지",
  });

  return (
    <AdminLayout>
      <Wrapper>


        <StatsGrid>
          <StatsDashboardCard
            title="오늘의 방문자"
            value={stats.todayUsers}
            icon={Users}
            color="#3b82f6"
            trend={{ value: 12, isUp: true }}
            description="어제보다 12% 증가"
            onClick={() => navigate(ROUTES.ADMIN.USER_STAT)}
          />
          <StatsDashboardCard
            title="오늘의 API 호출"
            value={stats.apiCalls.toLocaleString()}
            icon={Activity}
            color="#10b981"
            trend={{ value: 5, isUp: true }}
            onClick={() => navigate(ROUTES.ADMIN.API_STAT)}
          />
          <StatsDashboardCard
            title="활성 기능 플래그"
            value={stats.activeFlags}
            icon={Flag}
            color="#818cf8"
            description="현재 적용 중인 주요 기능"
            onClick={() => navigate(ROUTES.ADMIN.FEATURE_FLAGS)}
          />
        </StatsGrid>

        <SectionTitle>관리 도구</SectionTitle>
        <MenuGrid>
          {adminPages.map((page) => (
            <MenuCard key={page.path} onClick={() => navigate(page.path)}>
              <CardIcon $bg={page.color}>
                <page.icon size={28} color="#fff" />
              </CardIcon>
              <CardText>
                <CardTitle>{page.label}</CardTitle>
                <CardDescription>{page.description}</CardDescription>
              </CardText>
              <ArrowIcon>
                <ArrowRight size={20} />
              </ArrowIcon>
            </MenuCard>
          ))}
        </MenuGrid>
      </Wrapper>
    </AdminLayout>
  );
};

export default MobileAdminPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 0 ${MOBILE_PAGE_GUTTER};
  padding: 20px 0 24px;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    margin: 0;
    padding: 40px 48px;
    gap: 32px;
  }
`;


const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(90px, 100%), 1fr));
  gap: 8px;

  @media ${DESKTOP_MEDIA} {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px;
`;

const MenuCard = styled.div`
  background: #ffffff;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #cbd5e1;
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);

    & > div:last-child {
      transform: translateX(4px);
      color: #0f172a;
    }
  }
`;

const CardIcon = styled.div<{ $bg: string }>`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background-color: ${(props) => props.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 16px -4px ${(props) => props.$bg}40;
`;

const CardText = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardTitle = styled.h4`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
`;

const ArrowIcon = styled.div`
  color: #cbd5e1;
  transition: all 0.2s;
  flex-shrink: 0;
`;
