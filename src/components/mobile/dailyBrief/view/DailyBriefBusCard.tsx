import React, { useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export default function DailyBriefBusCard() {
  const navigate = useNavigate();
  const now = new Date();
  const updateTimeString = useMemo(() => {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    const hours = now.getHours();
    const period = hours < 12 ? "오전" : "오후";
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const mins = String(now.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${date} ${displayHour}:${mins} ${period}에 업데이트됨`;
  }, [now]);

  const busRoutes = [
    {
      id: "shuttle-circ",
      name: "송도 캠퍼스 순환 셔틀",
      routeType: "SHUTTLE",
      timeText: "3분 후 도착",
      detail: "공학관 앞 진입 중",
      highlight: true,
    },
    {
      id: "shuttle-station",
      name: "인천대입구역 ↔ 학교 셔틀",
      routeType: "SHUTTLE",
      timeText: "7분 후",
      detail: "역 1번 출구 대기",
      highlight: false,
    },
    {
      id: "bus-8",
      name: "8번 시내버스",
      routeType: "CITY",
      timeText: "5분 후",
      detail: "2번째 전 정류장",
      highlight: false,
    },
    {
      id: "bus-6-1",
      name: "6-1번 시내버스",
      routeType: "CITY",
      timeText: "12분 후",
      detail: "5번째 전 정류장",
      highlight: false,
    },
  ];

  return (
    <SectionWrapper>
      <ContextIntro>
        등하교 버스와 캠퍼스 셔틀 도착 상황을 확인해 보세요.
      </ContextIntro>
      <CardContainer onClick={() => navigate(ROUTES.BUS.ROOT)}>
        <CardHeader>
          <CardTitle>캠퍼스 버스 & 셔틀</CardTitle>
          <BadgeText>실시간</BadgeText>
        </CardHeader>

        <BusList>
          {busRoutes.map((route, idx) => (
            <React.Fragment key={route.id}>
              {idx > 0 && <ListDivider />}
              <BusItemRow>
                <LeftInfo>
                  <BusName>{route.name}</BusName>
                  <BusDetail>{route.detail}</BusDetail>
                </LeftInfo>
                <RightInfo>
                  <TimeText $highlight={route.highlight}>
                    {route.timeText}
                  </TimeText>
                  <StatusIndicator $highlight={route.highlight}>
                    {route.highlight ? "곧 도착" : "운행 중"}
                  </StatusIndicator>
                </RightInfo>
              </BusItemRow>
            </React.Fragment>
          ))}
        </BusList>

        <FooterRow>
          <UpdateTimestamp>{updateTimeString}</UpdateTimestamp>
          <MoreButton
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.BUS.ROOT);
            }}
          >
            버스 정보 더보기
          </MoreButton>
        </FooterRow>
      </CardContainer>
    </SectionWrapper>
  );
}

const SectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`;

const ContextIntro = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding: 0 4px;
  letter-spacing: -0.3px;
  line-height: 1.35;
`;

const CardContainer = styled.div`
  background: #ffffff;
  border-radius: 28px;
  padding: 22px 20px 18px 20px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:active {
    transform: scale(0.985);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitle = styled.h2`
  font-size: 19px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.4px;
  margin: 0;
`;

const BadgeText = styled.span`
  font-size: 12px;
  font-weight: 800;
  color: #2563eb;
  background-color: #eff6ff;
  padding: 3px 8px;
  border-radius: 6px;
`;

const BusList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ListDivider = styled.div`
  height: 1px;
  background-color: #f3f4f6;
  margin: 12px 0;
`;

const BusItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LeftInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const BusName = styled.span`
  font-size: 15.5px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.3px;
`;

const BusDetail = styled.span`
  font-size: 12.5px;
  font-weight: 500;
  color: #6b7280;
`;

const RightInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const TimeText = styled.span<{ $highlight?: boolean }>`
  font-size: 15px;
  font-weight: 800;
  color: ${({ $highlight }) => ($highlight ? "#2563eb" : "#111827")};
  letter-spacing: -0.3px;
`;

const StatusIndicator = styled.span<{ $highlight?: boolean }>`
  font-size: 11.5px;
  font-weight: 600;
  color: ${({ $highlight }) => ($highlight ? "#16a34a" : "#6b7280")};
`;

const FooterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f3f4f6;
  padding-top: 14px;
  margin-top: 2px;
`;

const UpdateTimestamp = styled.span`
  font-size: 11.5px;
  font-weight: 500;
  color: #9ca3af;
`;

const MoreButton = styled.button`
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 700;
  color: #4b5563;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background: #e5e7eb;
  }
`;
