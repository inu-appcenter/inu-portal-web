import React, { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useDynamicBusRoutes } from "@/hooks/useDynamicBusRoutes";
import useBusArrival from "@/hooks/useBusArrival";
import useUserStore from "@/stores/useUserStore";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useTimeTables, useTimeTableDetail } from "@/hooks/useTimeTables";
import { getPreferredBusUiRoute } from "@/utils/busUiPreference";
import type { BusData } from "@/types/bus";

// 홈페이지 버스 위젯과 동일한 노선별 컬러 매핑
function getBusColor(busNumber: string): string {
  if (
    [
      "6",
      "6-1",
      "6-2",
      "8",
      "16",
      "43-1",
      "58",
      "순환41",
      "순환42",
      "순환43",
    ].includes(busNumber)
  ) {
    return "#0e4d9d"; // 간선/지선 블루
  }
  if (["46", "41"].includes(busNumber)) {
    return "#00a82f"; // 지선 그린
  }
  if (["1301", "9200", "9201", "M6724"].includes(busNumber)) {
    return "#e60012"; // 광역 레드
  }
  if (busNumber.includes("급행")) {
    return "#6f2a8c"; // 급행 보라
  }
  return "#0061ff"; // 기본 브랜드 블루
}

const BusIcon = ({ color }: { color: string }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M20.64 12.627H6.88V6.88744H20.64M18.92 19.5145C18.4638 19.5145 18.0263 19.3331 17.7038 19.0102C17.3812 18.6873 17.2 18.2493 17.2 17.7926C17.2 17.336 17.3812 16.898 17.7038 16.5751C18.0263 16.2522 18.4638 16.0708 18.92 16.0708C19.3762 16.0708 19.8137 16.2522 20.1362 16.5751C20.4588 16.898 20.64 17.336 20.64 17.7926C20.64 18.2493 20.4588 18.6873 20.1362 19.0102C19.8137 19.3331 19.3762 19.5145 18.92 19.5145ZM8.6 19.5145C8.14383 19.5145 7.70634 19.3331 7.38378 19.0102C7.06122 18.6873 6.88 18.2493 6.88 17.7926C6.88 17.336 7.06122 16.898 7.38378 16.5751C7.70634 16.2522 8.14383 16.0708 8.6 16.0708C9.05618 16.0708 9.49366 16.2522 9.81623 16.5751C10.1388 16.898 10.32 17.336 10.32 17.7926C10.32 18.2493 10.1388 18.6873 9.81623 19.0102C9.49366 19.3331 9.05618 19.5145 8.6 19.5145ZM4.58667 18.3666C4.58667 19.3768 5.03387 20.2836 5.73334 20.915V22.9583C5.73334 23.2627 5.85415 23.5547 6.06919 23.77C6.28423 23.9853 6.57589 24.1062 6.88 24.1062H8.02667C8.33078 24.1062 8.62244 23.9853 8.83749 23.77C9.05253 23.5547 9.17334 23.2627 9.17334 22.9583V21.8104H18.3467V22.9583C18.3467 23.2627 18.4675 23.5547 18.6825 23.77C18.8976 23.9853 19.1892 24.1062 19.4933 24.1062H20.64C20.9441 24.1062 21.2358 23.9853 21.4508 23.77C21.6659 23.5547 21.7867 23.2627 21.7867 22.9583V20.915C22.4861 20.2836 22.9333 19.3768 22.9333 18.3666V6.88744C22.9333 2.86973 18.8283 2.29578 13.76 2.29578C8.69174 2.29578 4.58667 2.86973 4.58667 6.88744V18.3666Z"
      fill={color}
    />
  </svg>
);

export default function DailyBriefBusCard() {
  const navigate = useNavigate();
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayDayOfWeek = (now.getDay() + 6) % 7;

  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken);
  const { timetables, selectedSemester } = useTimetableStore();

  useTimeTables(undefined, undefined, {
    enabled: isLoggedIn,
  });

  // 대표 시간표 조회
  const representativeTimetableId = useMemo(() => {
    if (!isLoggedIn) return null;
    const targetSemester =
      selectedSemester ||
      (timetables.find((t) => t.isRepresentative)?.semester ??
        timetables[0]?.semester);
    const inSemester = targetSemester
      ? timetables.filter((t) => t.semester === targetSemester)
      : timetables;
    return (
      inSemester.find((t) => t.isRepresentative)?.id ??
      inSemester[0]?.id ??
      timetables.find((t) => t.isRepresentative)?.id ??
      timetables[0]?.id ??
      null
    );
  }, [isLoggedIn, selectedSemester, timetables]);

  useTimeTableDetail(representativeTimetableId, {
    enabled: isLoggedIn && representativeTimetableId != null,
  });

  const activeTimetable = useMemo(
    () =>
      timetables.find((timetable) => timetable.id === representativeTimetableId),
    [representativeTimetableId, timetables],
  );

  // 오늘 마지막 수업 종료 시간 계산
  const defaultRecommendedType = useMemo<"go-school" | "go-home">(() => {
    if (activeTimetable && activeTimetable.events) {
      const todayClasses = activeTimetable.events.filter(
        (cls) => cls.day === todayDayOfWeek,
      );

      if (todayClasses.length > 0) {
        // 마지막 수업 찾기
        const lastClass = todayClasses.reduce((prev, curr) =>
          curr.endTime > prev.endTime ? curr : prev,
        );
        const lastClassStartMins = Math.round(lastClass.startTime * 60);

        // 마지막 수업 시작 15분 전부터는 하교 버스를 우선 추천
        if (currentMinutes >= lastClassStartMins - 15) {
          return "go-home";
        }
        return "go-school";
      }
    }

    // 시간표가 없거나 비로그인 시 시계 기준 (14시 이전 등교, 14시 이후 하교)
    return now.getHours() < 14 ? "go-school" : "go-home";
  }, [activeTimetable, todayDayOfWeek, currentMinutes, now]);

  const [busDirection, setBusDirection] = useState<"go-school" | "go-home">(
    defaultRecommendedType,
  );

  useEffect(() => {
    setBusDirection(defaultRecommendedType);
  }, [defaultRecommendedType]);

  const {
    tabs: dynamicTabs,
    stops: dynamicStops,
    isLoading: isRoutesLoading,
  } = useDynamicBusRoutes(busDirection);

  // 대표 정류장 정보 구성
  const primaryStop = useMemo(() => {
    if (
      !dynamicTabs ||
      dynamicTabs.length === 0 ||
      !dynamicStops ||
      dynamicStops.length === 0
    ) {
      return null;
    }
    const tab = dynamicTabs[0];
    const tabStops = dynamicStops.filter((s) => tab.stopIds.includes(s.id));
    const firstStop = tabStops[0];
    const allBuses = tabStops.flatMap((s) => s.buses);
    const uniqueBuses = Array.from(
      new Map(allBuses.map((b) => [b.routeId || b.id, b])).values(),
    );

    return {
      stopName: tab.label,
      sectionLabel: firstStop?.stopName || tab.label,
      bstopId: firstStop?.bstopId || "",
      busList: uniqueBuses,
    };
  }, [dynamicTabs, dynamicStops]);

  // 실시간 버스 도착 정보 조회
  const { busArrivalList, isLoading: isArrivalLoading } = useBusArrival(
    primaryStop?.bstopId || "",
    primaryStop?.busList || [],
    Boolean(primaryStop?.bstopId),
  );

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

  // 상위 4개 실시간 버스 노선 가공
  const displayBuses = useMemo(() => {
    if (!busArrivalList || busArrivalList.length === 0) {
      return [];
    }

    // 셔틀 제외 및 도착 시간 순 정렬
    const sorted = [...busArrivalList].filter((b) => b.number !== "셔틀");

    return sorted.slice(0, 4).map((bus: BusData) => {
      const rawTime = bus.arrivalInfo?.time ?? "정보 없음";
      let arrivalTime = rawTime;
      let isHighlight = false;

      if (
        rawTime.includes("도착 정보 없음") ||
        rawTime.includes("도착정보 없음")
      ) {
        arrivalTime = "정보 없음";
      } else if (rawTime.includes("곧 도착") || rawTime.includes("1분")) {
        isHighlight = true;
      }

      return {
        id: `${bus.routeId ?? bus.id}-${bus.number}`,
        number: bus.number,
        color: getBusColor(bus.number),
        time: arrivalTime,
        detail: bus.sectionLabel || "인천 시내버스",
        isHighlight,
      };
    });
  }, [busArrivalList]);

  const handleCardClick = () => {
    if (primaryStop?.stopName) {
      navigate(getPreferredBusUiRoute(busDirection, primaryStop.stopName));
    } else {
      navigate(ROUTES.BUS.ROOT);
    }
  };

  const handleBusItemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCardClick();
  };

  return (
    <SectionWrapper>
      <ContextIntro>
        {busDirection === "go-school"
          ? "등교 버스 도착 정보를 확인해 보세요."
          : "하교 버스 도착 정보를 확인해 보세요."}
      </ContextIntro>
      <CardContainer onClick={handleCardClick}>
        <CardHeader>
          <HeaderLeft>
            <CardTitle>
              {primaryStop?.stopName
                ? `${primaryStop.stopName} 버스`
                : "실시간 버스"}
            </CardTitle>
            <DirectionToggleGroup onClick={(e) => e.stopPropagation()}>
              <DirectionButton
                $active={busDirection === "go-school"}
                onClick={() => setBusDirection("go-school")}
              >
                등교
              </DirectionButton>
              <DirectionButton
                $active={busDirection === "go-home"}
                onClick={() => setBusDirection("go-home")}
              >
                하교
              </DirectionButton>
            </DirectionToggleGroup>
          </HeaderLeft>
        </CardHeader>

        <BusList>
          {isRoutesLoading || isArrivalLoading ? (
            <LoadingStateText>버스 도착 정보를 불러오는 중...</LoadingStateText>
          ) : displayBuses.length === 0 ? (
            <EmptyText>운행 중인 버스 정보가 없습니다.</EmptyText>
          ) : (
            displayBuses.map((bus, idx) => (
              <React.Fragment key={bus.id || idx}>
                {idx > 0 && <ListDivider />}
                <BusItemRow onClick={handleBusItemClick}>
                  <BusLeftSection>
                    <BusIcon color={bus.color} />
                    <BusNumber>{bus.number}</BusNumber>
                    <BusDetail>{bus.detail}</BusDetail>
                  </BusLeftSection>
                  <BusTime $highlight={bus.isHighlight}>{bus.time}</BusTime>
                </BusItemRow>
              </React.Fragment>
            ))
          )}
        </BusList>

        <FooterRow>
          <UpdateTimestamp>{updateTimeString}</UpdateTimestamp>
          <MoreButton
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            노선 전체보기
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
  background: rgba(255, 255, 255, 0.65);
  border-radius: 28px;
  padding: 22px 20px 18px 20px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.02);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const CardTitle = styled.h2`
  font-size: 19px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.4px;
  margin: 0;
`;

const DirectionToggleGroup = styled.div`
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 12px;
  gap: 2px;
`;

const DirectionButton = styled.button<{ $active: boolean }>`
  border: none;
  background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
  color: ${({ $active }) => ($active ? "#1e293b" : "#64748b")};
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  padding: 3px 9px;
  border-radius: 9px;
  cursor: pointer;
  box-shadow: ${({ $active }) =>
    $active ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none"};
  transition: all 0.15s ease;
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
  padding: 4px 0;
  cursor: pointer;
  border-radius: 8px;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.7;
  }
`;

const BusLeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BusNumber = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.3px;
`;

const BusDetail = styled.span`
  font-size: 12.5px;
  font-weight: 500;
  color: #6b7280;
  margin-left: 2px;
`;

const BusTime = styled.span<{ $highlight?: boolean }>`
  font-size: 14.5px;
  font-weight: 700;
  color: ${({ $highlight }) => ($highlight ? "#2563eb" : "#4b5563")};
  letter-spacing: -0.3px;
`;

const LoadingStateText = styled.p`
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
  margin: 14px 0;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
  margin: 14px 0;
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
