import { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import {
  Calendar,
  Clock,
  X,
  RotateCw,
  Zap,
} from "lucide-react";

import { getBusHistory } from "@/apis/busArrival";
import BusCircle from "@/components/mobile/bus/BusCircle";
import { getBusCircleTone } from "@/components/mobile/bus/busCircleTone";

interface BusHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bstopId: string;
  stopName: string;
  defaultRouteNo?: string;
  availableRoutes?: string[];
}

export default function BusHistoryModal({
  isOpen,
  onClose,
  bstopId,
  stopName,
  defaultRouteNo,
  availableRoutes = [],
}: BusHistoryModalProps) {
  // 날짜 선택 상태 (기본: 오늘 날짜 YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // 주차 간편 프리셋 (0: 오늘, 1: 1주 전, 2: 2주 전, 3: 3주 전, 4: 4주 전)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // 노선 필터 상태
  const [selectedRoute, setSelectedRoute] = useState<string>(
    defaultRouteNo || "ALL",
  );

  // 모달이 열리거나 defaultRouteNo prop이 변경될 때 선택된 노선 동기화
  useEffect(() => {
    if (isOpen) {
      setSelectedRoute(defaultRouteNo || "ALL");
      hasAutoScrolledRef.current = false;
    }
  }, [isOpen, defaultRouteNo]);

  // API 데이터 상태
  const [historyData, setHistoryData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 타깃 아이템 및 컨테이너 자동 스크롤용 ref
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const targetItemRef = useRef<HTMLDivElement | null>(null);
  const hasAutoScrolledRef = useRef<boolean>(false);

  // 현재 시각 (HH:mm)
  const nowTimeStr = useMemo(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }, [isOpen, selectedDate]);

  // 해당 정류장에 실제로 정차하는 유효 노선 목록
  const validAvailableRoutes = useMemo(() => {
    return Array.from(new Set(availableRoutes.filter(Boolean)));
  }, [availableRoutes]);

  // 주차 오프셋 변경 시 날짜 계산
  const handleWeekOffsetChange = (offset: number) => {
    setWeekOffset(offset);
    hasAutoScrolledRef.current = false; // 날짜 탭 변경 시 해당 날짜 위치로 스크롤 허용
    const d = new Date();
    d.setDate(d.getDate() - offset * 7);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  // 날짜 직접 선택 시
  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);
    hasAutoScrolledRef.current = false;
    setWeekOffset(-1); // 커스텀 날짜
  };

  // 노선 필터 변경 시
  const handleRouteChange = (route: string) => {
    setSelectedRoute(route);
    hasAutoScrolledRef.current = false; // 노선 탭 변경 시 해당 노선 위치로 스크롤 허용
  };

  // 데이터 로드
  useEffect(() => {
    if (!isOpen || !bstopId) return;

    let isMounted = true;
    setLoading(true);

    getBusHistory(bstopId, selectedDate)
      .then((data) => {
        if (isMounted) {
          setHistoryData(data);
        }
      })
      .catch((err) => {
        console.error("버스 이력 로드 실패", err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, bstopId, selectedDate]);

  // 필터링된 이력 목록 (해당 정류장에 서지 않는 노선 완벽 제외)
  const filteredRecords = useMemo(() => {
    const raw = historyData?.historyRecords ?? [];
    return raw.filter((record: any) => {
      // 1. 해당 정류장에 정차하는 유효 노선 목록에 포함되는지 확인
      if (
        validAvailableRoutes.length > 0 &&
        record.routeNo &&
        !validAvailableRoutes.includes(record.routeNo)
      ) {
        return false;
      }
      // 2. 선택된 노선 필터 적용
      if (selectedRoute === "ALL") return true;
      return record.routeNo === selectedRoute;
    });
  }, [historyData, selectedRoute, validAvailableRoutes]);

  // 현재 시간 기준 가장 빠른 다음 버스 인덱스 계산 (오늘 날짜 & 현재 시각 이후 도착 예정 버스가 있을 때만)
  const nextArrivalIndex = useMemo(() => {
    if (selectedDate !== todayStr || filteredRecords.length === 0) {
      return -1;
    }

    // 현재 시각 이후(arrivalTime >= nowTimeStr)의 첫 번째 도착 버스 찾기
    const upcomingIdx = filteredRecords.findIndex((r: any) => {
      const timeStr = r.arrivalTime
        ? r.arrivalTime.split("T")[1]?.substring(0, 5) ||
          r.arrivalTime.substring(11, 16)
        : "";
      return timeStr >= nowTimeStr;
    });

    return upcomingIdx; // 현재 시간 이후 버스가 없으면 -1 반환 (과거 버스에 강조 붙지 않음)
  }, [selectedDate, todayStr, filteredRecords, nowTimeStr]);

  useEffect(() => {
    if (!isOpen) {
      hasAutoScrolledRef.current = false;
    }
  }, [isOpen]);

  // 모달 오픈 및 데이터 렌더링 시 현재 시간 기준 가장 빠른 버스 위치로 1회 부드럽게 스크롤
  useEffect(() => {
    if (
      !isOpen ||
      loading ||
      filteredRecords.length === 0 ||
      hasAutoScrolledRef.current
    ) {
      return;
    }

    const timer = setTimeout(() => {
      const container = listContainerRef.current;
      const target = targetItemRef.current;

      if (container) {
        hasAutoScrolledRef.current = true;
        if (target) {
          // 다음 도착 예정 버스가 있는 경우 해당 위치로 스크롤
          const targetOffsetTop = target.offsetTop;
          const scrollToY = Math.max(0, targetOffsetTop - 50);
          container.scrollTo({
            top: scrollToY,
            behavior: "smooth",
          });
        } else if (selectedDate === todayStr && nextArrivalIndex === -1) {
          // 오늘 운행이 모두 종료된 경우 가장 최근 운행 기록(목록 맨 아래)으로 이동
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [isOpen, loading, filteredRecords, nextArrivalIndex, selectedDate, todayStr]);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <Header>
          <HeaderLeft>
            <HeaderTitleRow>
              <Calendar size={18} color="#2563eb" />
              <HeaderTitle>{stopName}</HeaderTitle>
            </HeaderTitleRow>
            <HeaderSubtitle>실측 도착 이력 및 시간표 통계</HeaderSubtitle>
          </HeaderLeft>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        {/* 날짜 선택 및 n주 전 프리셋 바 */}
        <DatePresetBar>
          <PresetButtonGroup>
            {[
              { label: "오늘", offset: 0 },
              { label: "1주 전", offset: 1 },
              { label: "2주 전", offset: 2 },
              { label: "3주 전", offset: 3 },
              { label: "4주 전", offset: 4 },
            ].map((p) => (
              <PresetBtn
                key={p.offset}
                active={weekOffset === p.offset}
                onClick={() => handleWeekOffsetChange(p.offset)}
              >
                {p.label}
              </PresetBtn>
            ))}
          </PresetButtonGroup>

          <DateInputWrapper>
            <DateInput
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </DateInputWrapper>
        </DatePresetBar>

        {/* 노선 필터 칩 */}
        <RouteFilterBar>
          <FilterChip
            active={selectedRoute === "ALL"}
            onClick={() => handleRouteChange("ALL")}
          >
            전체 노선
          </FilterChip>
          {validAvailableRoutes.map((r) => (
            <FilterChip
              key={r}
              active={selectedRoute === r}
              onClick={() => handleRouteChange(r)}
            >
              {r}번
            </FilterChip>
          ))}
        </RouteFilterBar>

        {/* 4주간 평균 배차 간격 요약 배너 */}
        {historyData?.averageIntervalSeconds ? (
          <StatsSummaryCard>
            <StatsRow>
              <StatsLabel>4주간 평균 배차 간격</StatsLabel>
              <StatsValue>
                약 {Math.round(historyData.averageIntervalSeconds / 60)}분
              </StatsValue>
            </StatsRow>
          </StatsSummaryCard>
        ) : null}

        {/* 도착 이력 타임라인 리스트 */}
        <ListContainer ref={listContainerRef}>
          {loading ? (
            <LoadingContainer>
              <RotateCw size={24} className="spin" color="#2563eb" />
              <LoadingText>시간표 데이터를 불러오는 중...</LoadingText>
            </LoadingContainer>
          ) : filteredRecords.length === 0 ? (
            <EmptyContainer>
              <Clock size={36} color="#d1d5db" />
              <EmptyTitle>해당 날짜의 실측 도착 기록이 없습니다.</EmptyTitle>
              <EmptyDesc>
                스케줄러가 30초마다 수집한 도착 로그를 기반으로 시간표가
                표시됩니다.
              </EmptyDesc>
            </EmptyContainer>
          ) : (
            <TimelineList>
              {filteredRecords.map((item: any, idx: number) => {
                const arrivalTime = item.arrivalTime
                  ? item.arrivalTime.split("T")[1]?.substring(0, 5) ||
                    item.arrivalTime.substring(11, 16)
                  : "-";

                let routeDisplay = item.routeNo;
                if (!routeDisplay || /^\d{8,}$/.test(routeDisplay)) {
                  routeDisplay = item.routeId && !/^\d{8,}$/.test(item.routeId) ? item.routeId : "순환";
                }

                const isTarget = idx === nextArrivalIndex;

                return (
                  <TimelineItem
                    key={item.id || idx}
                    ref={isTarget ? targetItemRef : null}
                    isTarget={isTarget}
                  >
                    <TimeColumn>
                      <TimeBadge isTarget={isTarget}>{arrivalTime}</TimeBadge>
                    </TimeColumn>
                    <BusColumn>
                      <BusCircle
                        number={routeDisplay}
                        tone={getBusCircleTone(routeDisplay)}
                      />
                      <BusInfoWrapper>
                        <BusSubMeta>
                          {item.busNumPlate ? `차량: ${item.busNumPlate} · ` : ""}
                          정류소 도착
                        </BusSubMeta>
                      </BusInfoWrapper>
                    </BusColumn>
                    {isTarget && (
                      <CurrentTimeBadge>
                        <Zap size={11} fill="#2563eb" color="#2563eb" />
                        가장 빠른 도착
                      </CurrentTimeBadge>
                    )}
                  </TimelineItem>
                );
              })}
            </TimelineList>
          )}
        </ListContainer>
      </ModalContainer>
    </ModalOverlay>,
    document.body
  );
}

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 16px;
`;


const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 18px 20px;
  border-bottom: 1px solid #f3f4f6;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const HeaderTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #111827;
`;

const HeaderSubtitle = styled.p`
  margin: 0;
  font-size: 12px;
  color: #6b7280;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    color: #4b5563;
  }
`;

const DatePresetBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 20px;
  background-color: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
`;

const PresetButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 0;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const PresetBtn = styled.button<{ active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  min-height: 32px;
  background-color: ${({ active }) => (active ? "#2563eb" : "#ffffff")};
  color: ${({ active }) => (active ? "#ffffff" : "#4b5563")};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ active }) => (active ? "#2563eb" : "#e5e7eb")};
  transition: all 0.15s;

  &:hover {
    background-color: ${({ active }) => (active ? "#1d4ed8" : "#f3f4f6")};
  }
`;

const DateInputWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const DateInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  background-color: white;
  color: #374151;
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const RouteFilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  overflow-x: auto;
  flex-shrink: 0;
  border-bottom: 1px solid #f3f4f6;
  background-color: #ffffff;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterChip = styled.button<{ active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  min-height: 34px;
  line-height: 1;
  border: 1.5px solid ${({ active }) => (active ? "#2563eb" : "#e5e7eb")};
  background-color: ${({ active }) => (active ? "#eff6ff" : "#ffffff")};
  color: ${({ active }) => (active ? "#2563eb" : "#64748b")};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ active }) => (active ? "#1d4ed8" : "#cbd5e1")};
    background-color: ${({ active }) => (active ? "#e0eeff" : "#f8fafc")};
  }
`;

const StatsSummaryCard = styled.div`
  margin: 12px 20px 0 20px;
  padding: 10px 14px;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const StatsLabel = styled.span`
  font-size: 12px;
  color: #166534;
  font-weight: 600;
`;

const StatsValue = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #15803d;
`;

const ListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px;
  min-height: 250px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 12px;

  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  gap: 8px;
  text-align: center;
`;

const EmptyTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
`;

const EmptyDesc = styled.div`
  font-size: 12px;
  color: #9ca3af;
  max-width: 280px;
  line-height: 1.4;
`;

const TimelineList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TimelineItem = styled.div<{ isTarget?: boolean }>`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background-color: ${({ isTarget }) =>
    isTarget ? "#eff6ff" : "#ffffff"};
  border: ${({ isTarget }) =>
    isTarget ? "1.5px solid #3b82f6" : "1px solid #e5e7eb"};
  border-radius: 10px;
  gap: 12px;
  transition: all 0.2s ease;
  box-shadow: ${({ isTarget }) =>
    isTarget ? "0 2px 8px rgba(59, 130, 246, 0.15)" : "none"};

  &:hover {
    background-color: ${({ isTarget }) =>
      isTarget ? "#e0eeff" : "#f9fafb"};
  }
`;

const TimeColumn = styled.div`
  display: flex;
  align-items: center;
`;

const TimeBadge = styled.span<{ isTarget?: boolean }>`
  background-color: ${({ isTarget }) =>
    isTarget ? "#2563eb" : "#f3f4f6"};
  color: ${({ isTarget }) => (isTarget ? "#ffffff" : "#1f2937")};
  font-size: 13px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
`;

const BusColumn = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

const BusInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const BusSubMeta = styled.span`
  font-size: 12px;
  color: #4b5563;
  font-weight: 500;
`;

const CurrentTimeBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  background-color: #dbeafe;
  color: #1d4ed8;
  white-space: nowrap;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.75;
    }
  }
`;

