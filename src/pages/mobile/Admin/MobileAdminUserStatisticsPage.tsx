import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import useUserStore from "../../../stores/useUserStore.ts";
import { useEffect, useState } from "react";
import { getMemberLogs } from "@/apis/admin";
import { MemberLogData } from "@/types/admin";
import { useHeader } from "@/context/HeaderContext";

const MobileAdminUserStatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { tokenInfo, userInfo } = useUserStore();

  const [memberLog, setMemberLog] = useState<MemberLogData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  // 추가: 로그인/비로그인 유저 수 상태
  const [loginCount, setLoginCount] = useState<number>(0);
  const [guestCount, setGuestCount] = useState<number>(0);

  useEffect(() => {
    if (!tokenInfo.accessToken || userInfo.role !== "admin") {
      navigate("/home");
    }
  }, [tokenInfo, userInfo]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await getMemberLogs(selectedDate);
        setMemberLog(response.data);
        setError("");

        // 추가: 데이터 분류 및 집계
        if (response.data?.memberIds) {
          const loginMembers = response.data.memberIds.filter(
            (id: string) => !id.includes("."),
          );
          const guestMembers = response.data.memberIds.filter((id: string) =>
            id.includes("."),
          );
          setLoginCount(loginMembers.length);
          setGuestCount(guestMembers.length);
        }
      } catch (err) {
        console.error(err);
        setError("접속 유저 통계 조회에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (tokenInfo.accessToken && userInfo.role === "admin") {
      fetchLogs();
    }
  }, [selectedDate, tokenInfo, userInfo]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  // 헤더 설정 주입
  useHeader({
    title: "접속 유저 통계",
  });

  return (
    <Wrapper>
      <Content>
        <DatePickerContainer>
          <label htmlFor="date">조회 날짜</label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={handleDateChange}
          />
        </DatePickerContainer>

        {loading && <Message>로딩 중...</Message>}
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {memberLog && !loading && (
          <StatsCard>
            <StatHeader>
              <StatLabel>총 접속 유저</StatLabel>
              <StatCount>{memberLog.memberCount}</StatCount>
            </StatHeader>
            <DetailedStatsContainer>
              <StatItem>
                <StatItemLabel>로그인 유저</StatItemLabel>
                <StatItemCount>{loginCount}</StatItemCount>
              </StatItem>
              <StatItem>
                <StatItemLabel>비로그인 유저</StatItemLabel>
                <StatItemCount>{guestCount}</StatItemCount>
              </StatItem>
            </DetailedStatsContainer>
            <MemberListContainer>
              <ListHeader>
                <MemberListTitle>접속 유저 목록</MemberListTitle>
                <ListDescription>
                  로그인한 사용자는 userId로, 비로그인 사용자는 IP주소로
                  표시됩니다.
                </ListDescription>
              </ListHeader>
              <MemberList>
                {memberLog.memberIds.length > 0 ? (
                  memberLog.memberIds.map((id, index) => {
                    const isUser = !id.includes("."); // IP 주소에는 보통 '.'이 포함됨
                    return (
                      <MemberItem key={index}>
                        <MemberId>{id}</MemberId>
                        <Tag isUser={isUser}>
                          {isUser ? "로그인 유저" : "비로그인 유저"}
                        </Tag>
                      </MemberItem>
                    );
                  })
                ) : (
                  <NoMembers>해당 날짜에 접속한 회원이 없습니다.</NoMembers>
                )}
              </MemberList>
            </MemberListContainer>
          </StatsCard>
        )}
      </Content>
    </Wrapper>
  );
};

export default MobileAdminUserStatisticsPage;

// 스타일
export const Wrapper = styled.div`
  padding: 0 16px;

  box-sizing: border-box;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
`;

const Content = styled.div`
`;

const DatePickerContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  gap: 12px;

  label {
    font-weight: 600;
    font-size: 1rem;
    color: #444;
  }

  input[type="date"] {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #ddd;
    font-size: 14px;
    color: #555;
    background-color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: #007bff;
    }
    &:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
  }
`;

const Message = styled.p`
  text-align: center;
  margin-top: 40px;
  font-size: 1rem;
  color: #666;
`;

const ErrorMessage = styled(Message)`
  color: #e74c3c;
`;

const StatsCard = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
`;

const StatLabel = styled.span`
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
`;

const StatCount = styled.strong`
  font-size: 1.8rem;
  font-weight: 700;
  color: #007bff;
`;

const DetailedStatsContainer = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
`;

const StatItem = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #eee;
`;

const StatItemLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
`;

const StatItemCount = styled.strong`
  font-size: 1.2rem;
  font-weight: 700;
  color: #34495e;
`;

const MemberListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ListHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MemberListTitle = styled.h3`
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
  margin: 0;
`;

const ListDescription = styled.p`
  font-size: 0.9rem;
  color: #777;
  margin: 0;
`;

const MemberList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 10px;
  background-color: #fcfcfc;
`;

const MemberItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const MemberId = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  color: #444;
`;

const Tag = styled.span<{ isUser: boolean }>`
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  color: #fff;
  background-color: ${(props) => (props.isUser ? "#28a745" : "#6c757d")};
`;

const NoMembers = styled.p`
  font-size: 0.9rem;
  color: #999;
  text-align: center;
  padding: 20px;
`;
