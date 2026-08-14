import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  Calendar,
  Clock,
  X,
  RotateCw,
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

  // API 데이터 상태
  const [historyData, setHistoryData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 주차 오프셋 변경 시 날짜 계산
  const handleWeekOffsetChange = (offset: number) => {
    setWeekOffset(offset);
    const d = new Date();
    d.setDate(d.getDate() - offset * 7);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  // 날짜 직접 선택 시
  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);
    setWeekOffset(-1); // 커스텀 날짜
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

  if (!isOpen) return null;

  // 필터링된 이력 목록
  const filteredRecords = (historyData?.historyRecords ?? []).filter(
    (record: any) => {
      if (selectedRoute === "ALL") return true;
      return record.routeNo === selectedRoute;
    },
  );

  // 요일 한글 변환
  const getDayKorean = (dayOfWeekStr?: string) => {
    switch (dayOfWeekStr) {
      case "MONDAY":
        return "월요일";
      case "TUESDAY":
        return "화요일";
      case "WEDNESDAY":
        return "수요일";
      case "THURSDAY":
        return "목요일";
      case "FRIDAY":
        return "금요일";
      case "SATURDAY":
        return "토요일";
      case "SUNDAY":
        return "일요일";
      default:
        return "";
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <Header>
          <HeaderLeft>
            <HeaderTitleRow>
              <Calendar size={18} color="#2563eb" />
              <HeaderTitle>{stopName}</HeaderTitle>
            </HeaderTitleRow>
            <HeaderSubtitle>실측 도착 이력 및 n주 전 시간표 통계</HeaderSubtitle>
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
            onClick={() => setSelectedRoute("ALL")}
          >
            전체 노선
          </FilterChip>
          {availableRoutes.map((r) => (
            <FilterChip
              key={r}
              active={selectedRoute === r}
              onClick={() => setSelectedRoute(r)}
            >
              {r}번
            </FilterChip>
          ))}
        </RouteFilterBar>

        {/* 통계 요약 카드 */}
        {historyData && (
          <StatsSummaryCard>
            <StatsRow>
              <StatsItem>
                <StatsLabel>조회 기준 요일</StatsLabel>
                <StatsValue>
                  {selectedDate} ({getDayKorean(historyData.dayOfWeek)})
                </StatsValue>
              </StatsItem>
              {historyData.averageIntervalSeconds ? (
                <StatsItem>
                  <StatsLabel>4주간 평균 배차 간격</StatsLabel>
                  <StatsValue>
                    약 {Math.round(historyData.averageIntervalSeconds / 60)}분
                  </StatsValue>
                </StatsItem>
              ) : null}
            </StatsRow>
          </StatsSummaryCard>
        )}

        {/* 도착 이력 타임라인 리스트 */}
        <ListContainer>
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

                return (
                  <TimelineItem key={item.id || idx}>
                    <TimeColumn>
                      <TimeBadge>{arrivalTime}</TimeBadge>
                    </TimeColumn>
                    <BusColumn>
                      <BusCircle
                        number={item.routeNo}
                        tone={getBusCircleTone(item.routeNo)}
                      />
                      <BusInfoWrapper>
                        <BusRouteText>{item.routeNo}번 버스</BusRouteText>
                        <BusSubMeta>
                          {item.busNumPlate ? `차량: ${item.busNumPlate}` : ""}
                          {item.restStopCount
                            ? ` · ${item.restStopCount} 정거장 전 감지`
                            : ""}
                        </BusSubMeta>
                      </BusInfoWrapper>
                    </BusColumn>
                  </TimelineItem>
                );
              })}
            </TimelineList>
          )}
        </ListContainer>
      </ModalContainer>
    </ModalOverlay>
  );
}

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
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
  gap: 6px;
  overflow-x: auto;
`;

const PresetBtn = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  white-space: nowrap;
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
  gap: 6px;
  padding: 10px 20px;
  overflow-x: auto;
  border-bottom: 1px solid #f3f4f6;
`;

const FilterChip = styled.button<{ active: boolean }>`
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid ${({ active }) => (active ? "#2563eb" : "#e5e7eb")};
  background-color: ${({ active }) => (active ? "#eff6ff" : "#ffffff")};
  color: ${({ active }) => (active ? "#2563eb" : "#6b7280")};
  cursor: pointer;
  white-space: nowrap;
`;

const StatsSummaryCard = styled.div`
  margin: 12px 20px 0 20px;
  padding: 12px 14px;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const StatsItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StatsLabel = styled.span`
  font-size: 11px;
  color: #166534;
  font-weight: 600;
`;

const StatsValue = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #14532d;
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

const TimelineItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  gap: 14px;
  transition: background-color 0.15s;

  &:hover {
    background-color: #f9fafb;
  }
`;

const TimeColumn = styled.div`
  display: flex;
  align-items: center;
`;

const TimeBadge = styled.span`
  background-color: #f3f4f6;
  color: #1f2937;
  font-size: 13px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
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

const BusRouteText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;

const BusSubMeta = styled.span`
  font-size: 11px;
  color: #6b7280;
`;
