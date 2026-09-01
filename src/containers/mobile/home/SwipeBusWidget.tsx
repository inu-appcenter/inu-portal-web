import { useEffect, useState, useMemo, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import useBusArrival from "@/hooks/useBusArrival";
import { ROUTES } from "@/constants/routes";
import { getPreferredBusUiRoute } from "@/utils/busUiPreference";
import Skeleton from "@/components/common/Skeleton";
import { useDynamicBusRoutes } from "@/hooks/useDynamicBusRoutes";
import type { BusData } from "@/types/bus";

// 버스 노선 유형별 테마 컬러 매핑 함수
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
      "셔틀",
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
    width="20"
    height="20"
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

// 셔틀버스 운영 여부 판별 및 표시 시간 파싱 유틸
function parseShuttleTime(timeStr: string, isMorning: boolean): string {
  if (!timeStr) return "정보 없음";

  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  if (isMorning) {
    // 등교 셔틀 포맷 예: "08:30 ~ 10:20"
    const rangeMatch = timeStr.match(/(\d{2}):(\d{2})\s*~\s*(\d{2}):(\d{2})/);
    if (rangeMatch) {
      const startHour = parseInt(rangeMatch[1], 10);
      const startMin = parseInt(rangeMatch[2], 10);
      const endHour = parseInt(rangeMatch[3], 10);
      const endMin = parseInt(rangeMatch[4], 10);

      const startTimeMin = startHour * 60 + startMin;
      const endTimeMin = endHour * 60 + endMin;

      if (currentMin >= startTimeMin && currentMin <= endTimeMin) {
        return "운영 중";
      }
    }
    return timeStr;
  } else {
    // 하교 셔틀 포맷 예: "18:00, 18:15, 18:30"
    const times = timeStr.split(",").map((t) => t.trim());
    const timeObjects = times
      .map((t) => {
        const match = t.match(/(\d{2}):(\d{2})/);
        if (match) {
          const hour = parseInt(match[1], 10);
          const min = parseInt(match[2], 10);
          return {
            text: t,
            minutes: hour * 60 + min,
          };
        }
        return null;
      })
      .filter(
        (item): item is { text: string; minutes: number } => item !== null,
      );

    if (timeObjects.length > 0) {
      timeObjects.sort((a, b) => a.minutes - b.minutes);
      const nextShuttle = timeObjects.find((t) => t.minutes >= currentMin);
      if (nextShuttle) {
        return nextShuttle.text;
      } else {
        return "운행종료";
      }
    }
    return timeStr;
  }
}

function isShuttleActive(parsedTime: string, isMorning: boolean): boolean {
  if (isMorning) {
    return parsedTime === "운영 중";
  } else {
    return parsedTime !== "운행종료" && parsedTime !== "정보 없음";
  }
}

function getBusArrivalPriority(bus: BusData) {
  if (bus.number === "셔틀") {
    return {
      bucket: -1, // 활성화된 셔틀은 최우선순위
      seconds: 0,
    };
  }

  const arrivalInfo = bus.arrivalInfo;

  if (
    arrivalInfo &&
    typeof arrivalInfo.seconds === "number" &&
    typeof arrivalInfo.restCount === "number"
  ) {
    return {
      bucket: 0,
      seconds: arrivalInfo.seconds,
    };
  }

  if (arrivalInfo) {
    return {
      bucket: 1,
      seconds: Number.MAX_SAFE_INTEGER,
    };
  }

  return {
    bucket: 2,
    seconds: Number.MAX_SAFE_INTEGER,
  };
}

function compareBusesByArrival(
  left: BusData,
  right: BusData,
  orderLookup: Map<number | string, number>,
) {
  const leftPriority = getBusArrivalPriority(left);
  const rightPriority = getBusArrivalPriority(right);

  if (leftPriority.bucket !== rightPriority.bucket) {
    return leftPriority.bucket - rightPriority.bucket;
  }

  if (leftPriority.seconds !== rightPriority.seconds) {
    return leftPriority.seconds - rightPriority.seconds;
  }

  const leftKey = left.routeId ?? left.id;
  const rightKey = right.routeId ?? right.id;

  return (
    (orderLookup.get(leftKey) ?? Number.MAX_SAFE_INTEGER) -
    (orderLookup.get(rightKey) ?? Number.MAX_SAFE_INTEGER)
  );
}

interface BusStopCardProps {
  stopName: string;
  sectionLabel: string;
  bstopId: string;
  busList: BusData[];
  isMorning: boolean;
  onClick: (type: string, category: string) => void;
  onBusClick: (bus: BusData) => void;
}

// 개별 정류장 실시간 도착 표출 카드 컴포넌트
function BusStopCard({
  stopName,
  sectionLabel,
  bstopId,
  busList,
  isMorning,
  onClick,
  onBusClick,
}: BusStopCardProps) {
  const { busArrivalList, isLoading } = useBusArrival(bstopId, busList);

  const filteredBuses = useMemo(() => {
    return busArrivalList.filter((bus) => {
      if (bus.number === "셔틀") {
        const rawTime = bus.arrivalInfo?.time ?? "";
        const parsedTime = parseShuttleTime(rawTime, isMorning);
        return isShuttleActive(parsedTime, isMorning);
      }
      return true;
    });
  }, [busArrivalList, isMorning]);

  // 실시간 남은 시간(seconds) 기준 오름차순 정렬 (미배차/정보 없음은 최하위 배치, 운행 셔틀은 최우선순위)
  const sortedBuses = useMemo(() => {
    const orderLookup = new Map(
      busList.map((bus, index) => [bus.routeId ?? bus.id, index]),
    );
    return [...filteredBuses].sort((left, right) =>
      compareBusesByArrival(left, right, orderLookup),
    );
  }, [filteredBuses, busList]);

  // 상위 3개 노선만 슬라이싱
  const displayBuses = useMemo(() => {
    return sortedBuses.slice(0, 3);
  }, [sortedBuses]);

  return (
    <SlideContent
      onClick={() => onClick(isMorning ? "go-school" : "go-home", stopName)}
    >
      <WidgetHeader>
        <WidgetTitle>{stopName}</WidgetTitle>
        <WidgetSubTitle>{sectionLabel}</WidgetSubTitle>
      </WidgetHeader>

      <BusInfoList>
        {isLoading ? (
          <SkeletonContainer>
            <Skeleton width="100%" height={16} />
            <Skeleton width="100%" height={16} />
            <Skeleton width="100%" height={16} />
          </SkeletonContainer>
        ) : displayBuses.length === 0 ? (
          <EmptyText>운행 중인 버스가 없습니다.</EmptyText>
        ) : (
          displayBuses.map((bus) => {
            const rawTime = bus.arrivalInfo?.time ?? "정보 없음";
            let arrivalTime = rawTime;

            if (bus.number === "셔틀") {
              arrivalTime = parseShuttleTime(rawTime, isMorning);
            } else if (
              rawTime.includes("도착 정보 없음") ||
              rawTime.includes("도착정보 없음")
            ) {
              arrivalTime = "정보 없음";
            }

            const busColor = getBusColor(bus.number);

            return (
              <BusInfoRow
                key={`${bus.routeId ?? bus.id}-${bus.number}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onBusClick(bus);
                }}
                style={{ cursor: "pointer" }}
              >
                <BusLeftSection>
                  <BusIcon color={busColor} />
                  <BusNumber>{bus.number}</BusNumber>
                </BusLeftSection>
                <BusTime>{arrivalTime}</BusTime>
              </BusInfoRow>
            );
          })
        )}
      </BusInfoList>
    </SlideContent>
  );
}

export default function SwipeBusWidget() {
  const navigate = useNavigate();
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const fadeTimeoutRef = useRef<any>(null);

  const showPagination = () => {
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
    }
    paginationRef.current?.classList.add("show");
    fadeTimeoutRef.current = setTimeout(() => {
      paginationRef.current?.classList.remove("show");
    }, 1000);
  };

  useEffect(() => {
    showPagination();
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  // 등교/하교 기준 시간대 판별 (14:00 이전 등교, 이후 하교)
  const isMorning = useMemo(() => {
    const now = new Date();
    return now.getHours() < 14;
  }, []);

  const currentType = isMorning ? "go-school" : "go-home";
  const { tabs: dynamicTabs, stops: dynamicStops } = useDynamicBusRoutes(currentType);

  // 시간대 기준 정류장 데이터 구성 (순수 서버 API 데이터 기반)
  const busStops = useMemo(() => {
    if (!dynamicTabs || dynamicTabs.length === 0 || !dynamicStops || dynamicStops.length === 0) {
      return [];
    }

    return dynamicTabs.map((tab) => {
      const tabStops = dynamicStops.filter((s) => tab.stopIds.includes(s.id));
      const firstStop = tabStops[0];
      const allBuses = tabStops.flatMap((s) => s.buses);
      // 중복 버스 제거
      const uniqueBuses = Array.from(
        new Map(allBuses.map((b) => [b.routeId || b.id, b])).values(),
      );

      return {
        key: `${currentType}-${tab.label}`,
        stopName: tab.label,
        sectionLabel: firstStop?.stopName || tab.label,
        bstopId: firstStop?.bstopId || "",
        busList: uniqueBuses,
      };
    });
  }, [currentType, dynamicTabs, dynamicStops]);


  const storageKey = isMorning
    ? "swipe_bus_index_morning"
    : "swipe_bus_index_afternoon";

  const initialActiveIndex = useMemo(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (parsed >= 0 && parsed < busStops.length) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to read bus swipe index", e);
    }
    return 0;
  }, [busStops.length, storageKey]);

  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

  const handleCardClick = (type: string, category: string) => {
    if (isDraggingRef.current) return;
    navigate(getPreferredBusUiRoute(type, category));
  };

  const handleBusClick = (bus: BusData, stopName: string) => {
    if (isDraggingRef.current) return;
    if (bus.number === "셔틀") {
      navigate(`${ROUTES.BUS.INFO}?type=shuttle&category=인천대입구 셔틀`);
    } else {
      const type = isMorning ? "go-school" : "go-home";
      const baseRoute = getPreferredBusUiRoute(type, stopName);
      navigate(baseRoute);
    }
  };

  return (
    <WidgetContainer ref={widgetContainerRef}>
      <CardWrapper>
        <SwiperContainer
          initialSlide={initialActiveIndex}
          slidesPerView={1}
          spaceBetween={0}
          speed={300}
          onSwiper={(swiper) => setSwiperInstance(swiper)}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
            try {
              localStorage.setItem(storageKey, swiper.activeIndex.toString());
            } catch (e) {
              console.error("Failed to save bus swipe index", e);
            }
            showPagination();
          }}
          onTouchStart={() => {
            hasMovedRef.current = false;
            widgetContainerRef.current?.classList.add("swiping");
            showPagination();
          }}
          onSliderMove={() => {
            hasMovedRef.current = true;
            isDraggingRef.current = true;
            showPagination();
          }}
          onTransitionStart={() => {
            hasMovedRef.current = true;
            isDraggingRef.current = true;
            widgetContainerRef.current?.classList.add("swiping");
            showPagination();
          }}
          onTouchEnd={() => {
            if (!hasMovedRef.current) {
              widgetContainerRef.current?.classList.remove("swiping");
            }
            setTimeout(() => {
              isDraggingRef.current = false;
            }, 100);
          }}
          onTransitionEnd={() => {
            widgetContainerRef.current?.classList.remove("swiping");
            isDraggingRef.current = false;
          }}
        >
          {busStops.map((stop) => (
            <SwiperSlide key={stop.key}>
              <BusStopCard
                stopName={stop.stopName}
                sectionLabel={stop.sectionLabel}
                bstopId={stop.bstopId}
                busList={stop.busList}
                isMorning={isMorning}
                onClick={handleCardClick}
                onBusClick={(bus) => handleBusClick(bus, stop.stopName)}
              />
            </SwiperSlide>
          ))}
        </SwiperContainer>
      </CardWrapper>

      <PaginationDots ref={paginationRef} aria-label="버스 위젯 페이지네이션">
        {busStops.map((stop, index) => (
          <PaginationDot
            key={stop.key}
            type="button"
            $active={index === activeIndex}
            onClick={() => {
              swiperInstance?.slideTo(index);
            }}
            aria-label={`${stop.stopName} 버스 보기`}
            aria-current={index === activeIndex}
          />
        ))}
      </PaginationDots>
    </WidgetContainer>
  );
}

// --- Styled Components ---

const WidgetContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 20px;

  /* 그림자는 overflow가 없는 WidgetContainer 구역에 단독 상시 적용하여 잘림 차단 */
  box-shadow: 0px 4px 24px 0px #3B82F63D;


  will-change: transform;

  /* 클릭(active) 반응 시 부드러운 스케일 모션 */
  transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);

  transform: scale(1);

  &:active {
    transform: scale(0.98);
  }

  &.swiping {
    /* 스와이프 도중 부모 컨테이너(그림자)는 축소하지 않고 scale(1.0) 고정 */
  }
`;

const CardWrapper = styled.div`
  background: transparent;
  border: 1px solid transparent;
  border-radius: 20px;
  padding: 0px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 마스킹용 상시 hidden */

  will-change: background-color, border-color;

  transition:
    background-color 0.25s ease-in-out,
    border-color 0.25s ease-in-out;

  /* WidgetContainer가 swiping 클래스를 가지고 있을 때 */
  .swiping & {
    background-color: rgba(255, 255, 255, 0.35);
    border-color: rgba(255, 255, 255, 0.6);
  }
`;

const SwiperContainer = styled(Swiper)`
  overflow: hidden;
  width: 100%;
  height: 100%;
`;

const SlideContent = styled.div`
  background-color: #ffffff;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  padding: 16px 16px 24px 16px;
  gap: 12px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;

  transform: scale(1);
  transform-origin: center center;

  transition:
    transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1),
    border-radius 0.25s ease-in-out;

  /* CardWrapper가 swiping 클래스를 가지고 있을 때 내부 SlideContent 축소 */
  .swiping & {
    border-radius: 16px;
    transform: scale(0.95);
  }
`;

const PaginationDots = styled.div`
  position: absolute;
  left: 50%;
  bottom: 8px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  transform: translateX(-50%);

  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease-in-out;

  &.show {
    opacity: 1;
    pointer-events: auto;
  }
`;

const PaginationDot = styled.button<{ $active: boolean }>`
  display: block;
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.$active ? "var(--text-brand, #0061ff)" : "rgba(0, 0, 0, 0.15)"};
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
  transform: ${(props) => (props.$active ? "scale(1.15)" : "scale(1.0)")};
  border: none;
  padding: 0;
  cursor: pointer;
`;

const WidgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  min-width: 0;
  gap: 8px;
`;

const WidgetTitle = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: -0.2px;
  white-space: nowrap;
  flex-shrink: 0;
`;

const WidgetSubTitle = styled.span`
  color: var(--text-brand, #0061ff);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
`;

const BusInfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 72px; /* 3줄 분량 높이 안전 확보 */
  min-width: 0;
`;

const BusInfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
  gap: 12px;
`;

const BusLeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const BusNumber = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 15px;
  font-weight: 700;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BusTime = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-tertiary, #8b95a1);
  white-space: nowrap;
  text-align: right;
  flex-shrink: 0;
`;

const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const EmptyText = styled.span`
  font-size: 14px;
  color: var(--text-tertiary, #8b95a1);
  text-align: center;
  width: 100%;
`;
