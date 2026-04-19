import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Calendar, Users, UserCheck, UserMinus } from "lucide-react";

import useUserStore from "@/stores/useUserStore.ts";
import { getMemberLogs } from "@/apis/admin";
import { MemberLogData } from "@/types/admin";
import { useHeader } from "@/context/HeaderContext";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive.ts";
import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsDashboardCard from "@/components/admin/StatsDashboardCard";
import { ROUTES } from "@/constants/routes";
import { SOFT_CARD_SHADOW } from "@/styles/shadows";

const MobileAdminUserStatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { tokenInfo, userInfo } = useUserStore();

  const [memberLog, setMemberLog] = useState<MemberLogData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [counts, setCounts] = useState({
    login: 0,
    guest: 0,
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
  }, [tokenInfo, userInfo, navigate]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await getMemberLogs(selectedDate);
        setMemberLog(response.data);
        setError("");

        if (response.data?.memberIds) {
          const loginMembers = response.data.memberIds.filter(
            (id: string) => !id.includes("."),
          );
          const guestMembers = response.data.memberIds.filter((id: string) =>
            id.includes("."),
          );
          setCounts({
            login: loginMembers.length,
            guest: guestMembers.length,
          });
        }
      } catch (err) {
        console.error(err);
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (userInfo.role === "admin") {
      fetchLogs();
    }
  }, [selectedDate, userInfo.role]);

  useHeader({
    title: "접속 유저 통계",
  });

  const filteredMembers = useMemo(() => {
    if (!memberLog) return [];
    return memberLog.memberIds.filter(id => id.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [memberLog, searchQuery]);

  // 비율 계산
  const total = counts.login + counts.guest;
  const loginRatio = total > 0 ? (counts.login / total) * 100 : 0;
  const guestRatio = total > 0 ? (counts.guest / total) * 100 : 0;

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
            title="총 방문자"
            value={memberLog?.memberCount || 0}
            icon={Users}
            color="#0f766e"
          />
          <StatsDashboardCard
            title="로그인 유저"
            value={counts.login}
            icon={UserCheck}
            color="#3b82f6"
          />
          <StatsDashboardCard
            title="비로그인 유저"
            value={counts.guest}
            icon={UserMinus}
            color="#64748b"
          />
        </StatsGrid>

        <Row>
          <VisualSection>
            <SectionTitle>유저 분포</SectionTitle>
            <DistributionCard>
              <RatioInfo>
                <RatioItem>
                  <RatioLabel>
                    <ColorDot $color="#3b82f6" />
                    <LabelText>로그인 유저</LabelText>
                  </RatioLabel>
                  <RatioValue $color="#3b82f6">{loginRatio.toFixed(1)}%</RatioValue>
                </RatioItem>
                <RatioItem>
                  <RatioLabel>
                    <ColorDot $color="#cbd5e1" />
                    <LabelText>비로그인</LabelText>
                  </RatioLabel>
                  <RatioValue $color="#94a3b8">{guestRatio.toFixed(1)}%</RatioValue>
                </RatioItem>
              </RatioInfo>
              <ProgressBar>
                <ProgressFill $width={loginRatio} $color="#3b82f6" />
                <ProgressFill $width={guestRatio} $color="#cbd5e1" />
              </ProgressBar>
            </DistributionCard>
          </VisualSection>

          <ListSection>
            <ListHeader>
              <SectionTitle>세부 접속 목록</SectionTitle>
            </ListHeader>
            <MemberList>
              {loading ? (
                <LoadingMsg>데이터 분석 중...</LoadingMsg>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((id, idx) => {
                  const isUser = !id.includes(".");
                  return (
                    <MemberItem key={idx}>
                      <MemberIcon $isUser={isUser}>
                        {isUser ? <UserCheck size={14} /> : <UserMinus size={14} />}
                      </MemberIcon>
                      <MemberInfo>
                        <MemberId>{id}</MemberId>
                        <MemberType>{isUser ? "로그인 유저" : "비로그인"}</MemberType>
                      </MemberInfo>
                    </MemberItem>
                  );
                })
              ) : (
                <EmptyMsg>데이터가 없습니다.</EmptyMsg>
              )}
            </MemberList>
          </ListSection>
        </Row>

        <FloatingSearchBar>
          <MobilePillSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={() => { }}
            placeholder="검색어를 입력하세요."
          />
        </FloatingSearchBar>
      </PageWrapper>
    </AdminLayout>
  );
};

export default MobileAdminUserStatisticsPage;


const PageWrapper = styled.div`
  margin: 0 ${MOBILE_PAGE_GUTTER};
  padding: 20px 0 56px;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    margin: 0;
    padding: 40px 48px 56px 40px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 20px;
  flex-wrap: wrap;
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

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;

  @media (min-width: 1024px) {
    grid-template-columns: 350px 1fr;
  }
`;

const VisualSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #334155;
`;

const DistributionCard = styled.div`
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: ${SOFT_CARD_SHADOW};
`;

const RatioInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RatioItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.925rem;
`;

const RatioLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LabelText = styled.span`
  font-weight: 700;
  color: #475569;
`;

const RatioValue = styled.span<{ $color: string }>`
  color: ${props => props.$color};
  font-weight: 800;
`;

const ColorDot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.$color};
`;

const ProgressBar = styled.div`
  height: 12px;
  border-radius: 6px;
  background-color: #f1f5f9;
  display: flex;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $width: number; $color: string }>`
  width: ${props => props.$width}%;
  height: 100%;
  background-color: ${props => props.$color};
  transition: width 0.5s ease-out;
`;

const ListSection = styled.div``;

const ListHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;

  @media ${DESKTOP_MEDIA} {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
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

const MemberList = styled.div`
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  max-height: 500px;
  overflow-y: auto;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.2s;

  &:hover { background-color: #f8fafc; }
  &:last-child { border-bottom: none; }
`;

const MemberIcon = styled.div<{ $isUser: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.$isUser ? "#eff6ff" : "#f1f5f9"};
  color: ${props => props.$isUser ? "#3b82f6" : "#64748b"};
`;

const MemberInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const MemberId = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
`;

const MemberType = styled.span`
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
`;

const LoadingMsg = styled.div`
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
`;

const EmptyMsg = styled.div`
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
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
