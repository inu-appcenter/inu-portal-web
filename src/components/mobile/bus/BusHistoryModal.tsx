import { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import {
  ChevronLeft,
  ChevronDown,
  Clock,
  RotateCw,
} from "lucide-react";

import { getBusHistory } from "@/apis/busArrival";
import { getBusCircleTone } from "@/components/mobile/bus/busCircleTone";

interface BusHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bstopId: string;
  stopName: string;
  defaultRouteNo?: string;
  availableRoutes?: string[];
}

interface MatrixRow {
  hour: number;
  timeW1?: string; // 1주 전
  timeW2?: string; // 2주 전
  timeW3?: string; // 3주 전
  representativeMinutes: number; // 분 단위 (HH * 60 + MM)
}

// 요일 정보 매핑
const DAYS_OF_WEEK = [
  { dayIndex: 1, label: "월" },
  { dayIndex: 2, label: "화" },
  { dayIndex: 3, label: "수" },
  { dayIndex: 4, label: "목" },
  { dayIndex: 5, label: "금" },
  { dayIndex: 6, label: "토" },
  { dayIndex: 0, label: "일" },
];

export default function BusHistoryModal({
  isOpen,
  onClose,
  bstopId,
  stopName,
  defaultRouteNo,
  availableRoutes = [],
}: BusHistoryModalProps) {
  // 오늘 요일 인덱스 (0: 일, 1: 월, ..., 6: 토)
  const todayDayIndex = useMemo(() => new Date().getDay(), [isOpen]);

  // 선택된 요일 상태 (기본값: 오늘 요일)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(todayDayIndex);

  // 선택된 노선 상태
  const validAvailableRoutes = useMemo(() => {
    return Array.from(new Set(availableRoutes.filter(Boolean)));
  }, [availableRoutes]);

  const [selectedRoute, setSelectedRoute] = useState<string>(() => {
    if (defaultRouteNo && validAvailableRoutes.includes(defaultRouteNo)) {
      return defaultRouteNo;
    }
    return validAvailableRoutes[0] || "순환";
  });

  // 모달 열리거나 defaultRouteNo 변경 시 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedDayIndex(new Date().getDay());
      if (defaultRouteNo && validAvailableRoutes.includes(defaultRouteNo)) {
        setSelectedRoute(defaultRouteNo);
      } else if (validAvailableRoutes.length > 0) {
        setSelectedRoute(validAvailableRoutes[0]);
      }
      hasAutoScrolledRef.current = false;
    }
  }, [isOpen, defaultRouteNo, validAvailableRoutes]);

  // 1주 전, 2주 전, 3주 전 날짜 계산 함수
  const targetDates = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0(일) ~ 6(토)

    // 선택된 요일까지의 차이 계산 (가장 최근 과거의 해당 요일 기준)
    let diffDays = currentDay - selectedDayIndex;
    if (diffDays < 0) {
      diffDays += 7;
    }

    const baseDate = new Date(today);
    baseDate.setDate(today.getDate() - diffDays);

    const getWeekDate = (weeksAgo: number) => {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - weeksAgo * 7);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dayLabel = DAYS_OF_WEEK.find((item) => item.dayIndex === selectedDayIndex)?.label || "";

      return {
        dateStr: `${yyyy}-${mm}-${dd}`,
        headerLabel: `${d.getMonth() + 1}.${d.getDate()}.(${dayLabel})`,
      };
    };

    return {
      w1: getWeekDate(1),
      w2: getWeekDate(2),
      w3: getWeekDate(3),
    };
  }, [selectedDayIndex]);

  // 3주치 데이터 상태
  const [w1Records, setW1Records] = useState<string[]>([]);
  const [w2Records, setW2Records] = useState<string[]>([]);
  const [w3Records, setW3Records] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 스크롤 및 타깃 참조 ref
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const targetItemRef = useRef<HTMLTableRowElement | null>(null);
  const hourRowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});
  const hasAutoScrolledRef = useRef<boolean>(false);

  // 현재 시간 (HH:mm)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = currentHour * 60 + now.getMinutes();

  // 3주치 과거 이력 API 병렬 호출
  useEffect(() => {
    if (!isOpen || !bstopId) return;

    let isMounted = true;
    setLoading(true);

    Promise.all([
      getBusHistory(bstopId, targetDates.w1.dateStr).catch(() => null),
      getBusHistory(bstopId, targetDates.w2.dateStr).catch(() => null),
      getBusHistory(bstopId, targetDates.w3.dateStr).catch(() => null),
    ])
      .then(([res1, res2, res3]) => {
        if (!isMounted) return;

        const extractTimes = (res: any) => {
          const raw = res?.historyRecords ?? [];
          return raw
            .filter((r: any) => {
              if (!selectedRoute) return true;
              return r.routeNo === selectedRoute;
            })
            .map((r: any) => {
              return r.arrivalTime
                ? r.arrivalTime.split("T")[1]?.substring(0, 5) ||
                    r.arrivalTime.substring(11, 16)
                : "";
            })
            .filter(Boolean)
            .sort();
        };

        setW1Records(extractTimes(res1));
        setW2Records(extractTimes(res2));
        setW3Records(extractTimes(res3));
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, bstopId, targetDates, selectedRoute]);

  // 다주차 시간표 매트릭스 표 생성 알고리즘
  const matrixRows = useMemo(() => {
    const toMin = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const list1 = [...w1Records];
    const list2 = [...w2Records];
    const list3 = [...w3Records];

    const rows: MatrixRow[] = [];
    let i = 0,
      j = 0,
      k = 0;

    while (i < list1.length || j < list2.length || k < list3.length) {
      const m1 = i < list1.length ? toMin(list1[i]) : Infinity;
      const m2 = j < list2.length ? toMin(list2[j]) : Infinity;
      const m3 = k < list3.length ? toMin(list3[k]) : Infinity;

      const minVal = Math.min(m1, m2, m3);
      const THRESHOLD = 12; // 12분 이내의 유사 도착 시간대는 동일 행으로 정렬

      let w1Val: string | undefined = undefined;
      let w2Val: string | undefined = undefined;
      let w3Val: string | undefined = undefined;

      if (m1 !== Infinity && Math.abs(m1 - minVal) <= THRESHOLD) {
        w1Val = list1[i++];
      }
      if (m2 !== Infinity && Math.abs(m2 - minVal) <= THRESHOLD) {
        w2Val = list2[j++];
      }
      if (m3 !== Infinity && Math.abs(m3 - minVal) <= THRESHOLD) {
        w3Val = list3[k++];
      }

      rows.push({
        hour: Math.floor(minVal / 60),
        timeW1: w1Val,
        timeW2: w2Val,
        timeW3: w3Val,
        representativeMinutes: minVal,
      });
    }

    return rows;
  }, [w1Records, w2Records, w3Records]);

  // 현재 시간과 비교하여 가장 유사/가까운 행 인덱스 계산
  const targetRowIndex = useMemo(() => {
    if (matrixRows.length === 0) return -1;
    if (selectedDayIndex !== todayDayIndex) return -1; // 오늘 요일일 때만 하이라이트

    // 1. 현재 시각 이후 도착 시간 중 가장 가까운 행
    const upcomingIdx = matrixRows.findIndex(
      (row) => row.representativeMinutes >= currentMinutes,
    );

    if (upcomingIdx !== -1) {
      return upcomingIdx;
    }

    // 2. 이미 막차가 지난 경우 마지막 행
    return matrixRows.length - 1;
  }, [matrixRows, selectedDayIndex, todayDayIndex, currentMinutes]);

  // 사용 가능한 시간대(Hour) 칩 목록 (예: 6시 ~ 23시)
  const availableHours = useMemo(() => {
    const hours = Array.from(new Set(matrixRows.map((r) => r.hour))).sort(
      (a, b) => a - b,
    );
    if (hours.length === 0) {
      return [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    }
    return hours;
  }, [matrixRows]);

  // 시간대 칩 클릭 시 해당 시간대로 부드럽게 스크롤
  const handleHourClick = (hour: number) => {
    const targetElement = hourRowRefs.current[hour];
    const container = listContainerRef.current;
    if (container && targetElement) {
      const topPos = targetElement.offsetTop - 45;
      container.scrollTo({
        top: Math.max(0, topPos),
        behavior: "smooth",
      });
    }
  };

  // 모달 오픈 시 현재 시간 강조 라인으로 자동 스크롤
  useEffect(() => {
    if (
      !isOpen ||
      loading ||
      matrixRows.length === 0 ||
      hasAutoScrolledRef.current
    ) {
      return;
    }

    const timer = setTimeout(() => {
      const container = listContainerRef.current;
      const target = targetItemRef.current;

      if (container && target) {
        hasAutoScrolledRef.current = true;
        const topPos = target.offsetTop - 90;
        container.scrollTo({
          top: Math.max(0, topPos),
          behavior: "smooth",
        });
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [isOpen, loading, matrixRows, targetRowIndex]);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* 상단 네비게이션 헤더 */}
        <NavHeader>
          <BackButton onClick={onClose}>
            <ChevronLeft size={24} color="#111827" />
          </BackButton>
          <NavTitle>과거 시간표</NavTitle>
          <div style={{ width: 24 }} />
        </NavHeader>

        {/* 정류장 정보 */}
        <StopInfoSection>
          <StopName>{stopName}</StopName>
          <StopMeta>
            {bstopId} · 인천대 방면 실측 도착 시간표
          </StopMeta>
        </StopInfoSection>

        {/* 노선 선택 드롭다운 / 셀렉터 */}
        <RouteSelectorContainer>
          <RouteSelectWrapper>
            <RouteBadge tone={getBusCircleTone(selectedRoute)}>
              {selectedRoute.startsWith("순환") ? "순환" : "간선"}
            </RouteBadge>
            <RouteSelect
              value={selectedRoute}
              onChange={(e) => {
                setSelectedRoute(e.target.value);
                hasAutoScrolledRef.current = false;
              }}
            >
              {validAvailableRoutes.map((routeNo) => (
                <option key={routeNo} value={routeNo}>
                  {routeNo}번
                </option>
              ))}
            </RouteSelect>
            <SelectArrow>
              <ChevronDown size={18} color="#6b7280" />
            </SelectArrow>
          </RouteSelectWrapper>
        </RouteSelectorContainer>

        {/* 요일 탭 바 */}
        <DayTabBar>
          {DAYS_OF_WEEK.map((item) => (
            <DayTabItem
              key={item.dayIndex}
              active={selectedDayIndex === item.dayIndex}
              onClick={() => {
                setSelectedDayIndex(item.dayIndex);
                hasAutoScrolledRef.current = false;
              }}
            >
              {item.label}
            </DayTabItem>
          ))}
        </DayTabBar>

        {/* 시간대(Hour) 빠른 필터 칩 바 */}
        <HourFilterBar>
          {availableHours.map((hour) => {
            const isCurrentHour =
              selectedDayIndex === todayDayIndex && hour === currentHour;
            return (
              <HourChip
                key={hour}
                active={isCurrentHour}
                onClick={() => handleHourClick(hour)}
              >
                {hour}시
              </HourChip>
            );
          })}
        </HourFilterBar>

        {/* 다주차 시간표 매트릭스 테이블 */}
        <TableViewport ref={listContainerRef}>
          {loading ? (
            <LoadingBox>
              <RotateCw size={24} className="spin" color="#2563eb" />
              <LoadingText>3주간의 시간표 데이터를 불러오는 중...</LoadingText>
            </LoadingBox>
          ) : matrixRows.length === 0 ? (
            <EmptyBox>
              <Clock size={36} color="#d1d5db" />
              <EmptyTitle>해당 요일의 실측 도착 기록이 없습니다.</EmptyTitle>
              <EmptyDesc>
                스케줄러가 수집한 1~3주 전 도착 이력을 기반으로 시간표가 구성됩니다.
              </EmptyDesc>
            </EmptyBox>
          ) : (
            <MatrixTable>
              <thead>
                <tr>
                  <TableHeaderCell>
                    <div className="title">1주 전</div>
                    <div className="date">{targetDates.w1.headerLabel}</div>
                  </TableHeaderCell>
                  <TableHeaderCell>
                    <div className="title">2주 전</div>
                    <div className="date">{targetDates.w2.headerLabel}</div>
                  </TableHeaderCell>
                  <TableHeaderCell>
                    <div className="title">3주 전</div>
                    <div className="date">{targetDates.w3.headerLabel}</div>
                  </TableHeaderCell>
                </tr>
              </thead>
              <tbody>
                {matrixRows.map((row, idx) => {
                  const isTarget = idx === targetRowIndex;

                  // 각 시간대의 첫 번째 행인 경우 ref 저장
                  const isHourFirstRow =
                    idx === 0 || matrixRows[idx - 1].hour !== row.hour;

                  return (
                    <MatrixTableRow
                      key={idx}
                      ref={(el) => {
                        if (isTarget) {
                          targetItemRef.current = el;
                        }
                        if (isHourFirstRow) {
                          hourRowRefs.current[row.hour] = el;
                        }
                      }}
                      isTarget={isTarget}
                    >
                      <MatrixTableCell isTarget={isTarget}>
                        {row.timeW1 || ""}
                      </MatrixTableCell>
                      <MatrixTableCell isTarget={isTarget}>
                        {row.timeW2 || ""}
                      </MatrixTableCell>
                      <MatrixTableCell isTarget={isTarget}>
                        {row.timeW3 || ""}
                      </MatrixTableCell>
                    </MatrixTableRow>
                  );
                })}
              </tbody>
            </MatrixTable>
          )}
        </TableViewport>
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
  padding: 12px;
`;

const ModalContainer = styled.div`
  background: #ffffff;
  border-radius: 18px;
  width: 100%;
  max-width: 440px;
  height: 88vh;
  max-height: 780px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
`;

const NavHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e293b;
`;

const NavTitle = styled.h2`
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
`;

const StopInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 20px 10px 20px;
  text-align: center;
`;

const StopName = styled.h3`
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
`;

const StopMeta = styled.p`
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #64748b;
`;

const RouteSelectorContainer = styled.div`
  padding: 8px 20px 12px 20px;
`;

const RouteSelectWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 14px;
  background-color: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  position: relative;
  transition: all 0.2s;

  &:focus-within {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const RouteBadge = styled.span<{ tone?: string }>`
  font-size: 11px;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 4px;
  background-color: #2563eb;
  color: #ffffff;
  margin-right: 10px;
`;

const RouteSelect = styled.select`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
`;

const SelectArrow = styled.div`
  position: absolute;
  right: 14px;
  pointer-events: none;
  display: flex;
  align-items: center;
`;

const DayTabBar = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background-color: #ffffff;
`;

const DayTabItem = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px 0;
  font-size: 14px;
  font-weight: ${({ active }) => (active ? "800" : "500")};
  color: ${({ active }) => (active ? "#0f172a" : "#94a3b8")};
  background: transparent;
  border: none;
  border-bottom: 2.5px solid
    ${({ active }) => (active ? "#0f172a" : "transparent")};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    color: #0f172a;
  }
`;

const HourFilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  overflow-x: auto;
  flex-shrink: 0;
  border-bottom: 1px solid #f1f5f9;
  background-color: #f8fafc;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const HourChip = styled.button<{ active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 12px;
  border-radius: 18px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid ${({ active }) => (active ? "#2563eb" : "#e2e8f0")};
  background-color: ${({ active }) => (active ? "#dbeafe" : "#ffffff")};
  color: ${({ active }) => (active ? "#2563eb" : "#64748b")};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #2563eb;
  }
`;

const TableViewport = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: #ffffff;
  position: relative;
`;

const MatrixTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;

  thead {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #f8fafc;
  }
`;

const TableHeaderCell = styled.th`
  padding: 12px 6px;
  border-bottom: 1px solid #e2e8f0;
  border-right: 1px solid #f1f5f9;
  width: 33.333%;

  &:last-child {
    border-right: none;
  }

  .title {
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
  }

  .date {
    font-size: 11px;
    font-weight: 500;
    color: #64748b;
    margin-top: 2px;
  }
`;

const MatrixTableRow = styled.tr<{ isTarget?: boolean }>`
  background-color: ${({ isTarget }) =>
    isTarget ? "#eff6ff" : "#ffffff"};
  transition: background-color 0.15s;

  &:hover {
    background-color: ${({ isTarget }) =>
      isTarget ? "#e0eeff" : "#f8fafc"};
  }
`;

const MatrixTableCell = styled.td<{ isTarget?: boolean }>`
  padding: 15px 6px;
  font-size: 14px;
  font-weight: ${({ isTarget }) => (isTarget ? "800" : "600")};
  color: ${({ isTarget }) => (isTarget ? "#2563eb" : "#1e293b")};
  border-bottom: 1px solid ${({ isTarget }) => (isTarget ? "#bfdbfe" : "#f1f5f9")};
  border-right: 1px solid ${({ isTarget }) => (isTarget ? "#bfdbfe" : "#f1f5f9")};

  &:last-child {
    border-right: none;
  }
`;

const LoadingBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 70px 0;
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
  color: #64748b;
`;

const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 8px;
  text-align: center;
`;

const EmptyTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #475569;
`;

const EmptyDesc = styled.div`
  font-size: 12px;
  color: #94a3b8;
  max-width: 280px;
  line-height: 1.4;
`;
