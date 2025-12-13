import styled from "styled-components";
import useUserStore from "../../../stores/useUserStore.ts";
import { useEffect, useState } from "react";
import useMobileNavigate from "../../../hooks/useMobileNavigate.ts";
import MobileHeader from "../../../containers/mobile/common/MobileHeader.tsx";
import { getApiLogs } from "@/apis/admin";
import { ApiLogData } from "@/types/admin";

const MobileAdminApiStatisticsPage: React.FC = () => {
  const mobilenavigate = useMobileNavigate();
  const { tokenInfo, userInfo } = useUserStore();

  const [apiLogs, setApiLogs] = useState<ApiLogData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    // 관리자 권한 체크
    if (!tokenInfo.accessToken || userInfo.role !== "admin") {
      mobilenavigate("/home");
    }
  }, [tokenInfo, userInfo, mobilenavigate]);

  useEffect(() => {
    const fetchApiLogs = async () => {
      try {
        setLoading(true);
        const response = await getApiLogs(selectedDate);
        // 응답 데이터가 배열인지 확인
        if (Array.isArray(response.data)) {
          setApiLogs(response.data);
        } else {
          setApiLogs([]);
        }
        setError("");
      } catch (err) {
        console.error(err);
        setError("API 호출 순위 조회에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (tokenInfo.accessToken && userInfo.role === "admin") {
      fetchApiLogs();
    }
  }, [selectedDate, tokenInfo, userInfo]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  return (
    <Wrapper>
      <MobileHeader title={"서비스 사용 통계"} />
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

        {apiLogs && !loading && (
          <StatsCard>
            <ApiListContainer>
              <ListHeader>
                {/*<ApiListTitle>API 호출 순위</ApiListTitle>*/}
                <ListDescription>
                  선택한 날짜의 호출 횟수 상위 20개 API 목록입니다.(중복 카운팅
                  가능)
                </ListDescription>
              </ListHeader>
              <ApiList>
                {apiLogs.length > 0 ? (
                  apiLogs.map((log, index) => (
                    <ApiItem key={index}>
                      <ApiRank>{index + 1}.</ApiRank>
                      <ApiInfo>
                        <ApiMethod>{log.method}</ApiMethod>
                        <ApiUri>{log.uri}</ApiUri>
                      </ApiInfo>
                      <ApiCount>{log.apiCount} 회</ApiCount>
                    </ApiItem>
                  ))
                ) : (
                  <NoData>해당 날짜에 호출된 API가 없습니다.</NoData>
                )}
              </ApiList>
            </ApiListContainer>
          </StatsCard>
        )}
      </Content>
    </Wrapper>
  );
};

export default MobileAdminApiStatisticsPage;

// 스타일
export const Wrapper = styled.div`
  padding: 30px 16px;
  padding-top: 50px;
  box-sizing: border-box;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
`;

const Content = styled.div`
  margin-top: 20px;
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

const ApiListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ListHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// const ApiListTitle = styled.h3`
//   font-size: 1.1rem;
//   color: #333;
//   font-weight: 600;
//   margin: 0;
// `;

const ListDescription = styled.p`
  font-size: 0.9rem;
  color: #777;
  margin: 0;
`;

const ApiList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 10px;
  background-color: #fcfcfc;
`;

const ApiItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
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

const ApiRank = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: #007bff;
  min-width: 30px;
  text-align: right;
`;

const ApiInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const ApiMethod = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: #6c757d;
  text-transform: uppercase;
`;

const ApiUri = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  color: #444;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ApiCount = styled.strong`
  font-size: 0.95rem;
  font-weight: 600;
  color: #28a745;
  white-space: nowrap;
`;

const NoData = styled.p`
  font-size: 0.9rem;
  color: #999;
  text-align: center;
  padding: 20px;
`;
