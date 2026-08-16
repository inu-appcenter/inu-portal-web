import { useEffect, useMemo, useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { ChevronLeft, ChevronDown, Clock, RotateCw } from "lucide-react";

import { getBusHistory } from "@/apis/busArrival";
import { getBusCircleTone } from "@/components/mobile/bus/busCircleTone";
import { useSheetBackHandler } from "@/hooks/useSheetBackHandler";

interface BusHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bstopId: string;
  stopName: string;
  defaultRouteNo?: string;
  availableRoutes?: string[];
  routeNextStopMap?: Record<string, string>;
}

interface ColumnInfo {
  key: string;
  title: string;
  headerLabel: string;
  isToday?: boolean;
}

interface RawHistoryRecord {
  id?: string | number;
  routeNo: string;
  busNumPlate?: string;
  arrivalTime: string;
}

interface TimelineItem {
  id: string | number;
  routeNo: string;
  busNumPlate?: string;
  timeStr: string; // "14:23"
  hour: number;
  minutes: number;
}

interface MatrixCellData {
  time: string;
  plate?: string;
}

// 차량 번호판 포맷터 (예: "인천70바1234" -> "70바1234")
const formatBusPlate = (plate?: string) => {
  if (!plate) return "";
  // 앞의 지역명(인천, 경기, 서울 등 2자리)을 제거하고 "70바1234" 형식으로 반환
  return plate.replace(/^[가-힣]{2}(?=\d)/, "").trim();
};

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

// 서버에서 수집하는 모든 시간대 (05시 ~ 23시)
const ALL_COLLECTED_HOURS = [
  5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
];

const ALL_ROUTES_VALUE = "ALL";

export default function BusHistoryModal({
  isOpen,
  onClose,
  bstopId,
  stopName,
  defaultRouteNo,
  availableRoutes = [],
  routeNextStopMap = {},
}: BusHistoryModalProps) {
  // 모바일/브라우저 뒤로가기 핸들러 연동
  useSheetBackHandler(isOpen, onClose);

  // 오늘 요일 인덱스 (0: 일, 1: 월, ..., 6: 토)
  const todayDayIndex = useMemo(() => new Date().getDay(), [isOpen]);

  // 선택된 요일 상태 (기본값: 오늘 요일)
  const [selectedDayIndex, setSelectedDayIndex] =
    useState<number>(todayDayIndex);

  // 선택된 시간대 칩 상태 (기본값: 현재 시간)
  const [selectedHour, setSelectedHour] = useState<number>(() =>
    new Date().getHours(),
  );

  // 선택 가능한 노선 목록 (전체 옵션 포함)
  const validAvailableRoutes = useMemo(() => {
    const uniqueRoutes = Array.from(new Set(availableRoutes.filter(Boolean)));
    if (uniqueRoutes.length > 1) {
      return [ALL_ROUTES_VALUE, ...uniqueRoutes];
    }
    return uniqueRoutes;
  }, [availableRoutes]);

  const [selectedRoute, setSelectedRoute] = useState<string>(() => {
    if (defaultRouteNo && validAvailableRoutes.includes(defaultRouteNo)) {
      return defaultRouteNo;
    }
    return validAvailableRoutes[0] || ALL_ROUTES_VALUE;
  });

  // 모달이 처음 열릴 때 상태 초기화
  const prevIsOpenRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const now = new Date();
      setSelectedDayIndex(now.getDay());
      setSelectedHour(now.getHours());
      if (defaultRouteNo && validAvailableRoutes.includes(defaultRouteNo)) {
        setSelectedRoute(defaultRouteNo);
      } else if (validAvailableRoutes.length > 0) {
        setSelectedRoute(validAvailableRoutes[0]);
      }
      hasAutoScrolledRef.current = false;
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, defaultRouteNo, validAvailableRoutes]);

  // 날짜 및 열(Column) 구성
  const { columns, targetDates } = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const isTodaySelected = selectedDayIndex === currentDay;

    const formatDateStr = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const formatHeaderLabel = (
      d: Date,
      dayLabel: string,
      isTodayLabel = false,
    ) => {
      if (isTodayLabel) {
        return `${d.getMonth() + 1}.${d.getDate()}.(오늘)`;
      }
      return `${d.getMonth() + 1}.${d.getDate()}.(${dayLabel})`;
    };

    const dayLabel =
      DAYS_OF_WEEK.find((item) => item.dayIndex === selectedDayIndex)?.label ||
      "";

    if (isTodaySelected) {
      // 오늘 요일이 선택된 경우: 오늘(w0), 1주 전(w1), 2주 전(w2), 3주 전(w3)
      const d0 = new Date(today);
      const d1 = new Date(today);
      d1.setDate(today.getDate() - 7);
      const d2 = new Date(today);
      d2.setDate(today.getDate() - 14);
      const d3 = new Date(today);
      d3.setDate(today.getDate() - 21);

      const dates = {
        w0: {
          dateStr: formatDateStr(d0),
          headerLabel: formatHeaderLabel(d0, dayLabel, true),
        },
        w1: {
          dateStr: formatDateStr(d1),
          headerLabel: formatHeaderLabel(d1, dayLabel),
        },
        w2: {
          dateStr: formatDateStr(d2),
          headerLabel: formatHeaderLabel(d2, dayLabel),
        },
        w3: {
          dateStr: formatDateStr(d3),
          headerLabel: formatHeaderLabel(d3, dayLabel),
        },
      };

      const cols: ColumnInfo[] = [
        {
          key: "w0",
          title: "오늘",
          headerLabel: dates.w0.headerLabel,
          isToday: true,
        },
        { key: "w1", title: "1주 전", headerLabel: dates.w1.headerLabel },
        { key: "w2", title: "2주 전", headerLabel: dates.w2.headerLabel },
        { key: "w3", title: "3주 전", headerLabel: dates.w3.headerLabel },
      ];

      return { columns: cols, targetDates: dates };
    } else {
      // 다른 요일이 선택된 경우: 가장 최근 해당 요일(w1), 1주 전(w2), 2주 전(w3)
      let diffDays = currentDay - selectedDayIndex;
      if (diffDays < 0) {
        diffDays += 7;
      }
      const baseDate = new Date(today);
      baseDate.setDate(today.getDate() - diffDays);

      const d1 = new Date(baseDate);
      const d2 = new Date(baseDate);
      d2.setDate(baseDate.getDate() - 7);
      const d3 = new Date(baseDate);
      d3.setDate(baseDate.getDate() - 14);

      const dates = {
        w1: {
          dateStr: formatDateStr(d1),
          headerLabel: formatHeaderLabel(d1, dayLabel),
        },
        w2: {
          dateStr: formatDateStr(d2),
          headerLabel: formatHeaderLabel(d2, dayLabel),
        },
        w3: {
          dateStr: formatDateStr(d3),
          headerLabel: formatHeaderLabel(d3, dayLabel),
        },
      };

      const cols: ColumnInfo[] = [
        { key: "w1", title: "1주 전", headerLabel: dates.w1.headerLabel },
        { key: "w2", title: "2주 전", headerLabel: dates.w2.headerLabel },
        { key: "w3", title: "3주 전", headerLabel: dates.w3.headerLabel },
      ];

      return { columns: cols, targetDates: dates };
    }
  }, [selectedDayIndex]);

  // 기록 데이터 상태 (날짜 키별 원본 DTO 리스트)
  const [rawRecordsMap, setRawRecordsMap] = useState<
    Record<string, RawHistoryRecord[]>
  >({});
  const [loading, setLoading] = useState<boolean>(false);

  // 스크롤 및 타깃 참조 ref
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const targetItemRef = useRef<HTMLTableRowElement | HTMLDivElement | null>(
    null,
  );
  const hourRowRefs = useRef<
    Record<number, HTMLTableRowElement | HTMLDivElement | null>
  >({});
  const hourChipRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const hasAutoScrolledRef = useRef<boolean>(false);

  // 현재 시간 (HH:mm)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = currentHour * 60 + now.getMinutes();

  // 날짜별 실측 도착 이력 API 병렬 호출
  useEffect(() => {
    if (!isOpen || !bstopId) return;

    let isMounted = true;
    setLoading(true);

    const keys = Object.keys(targetDates);

    Promise.all(
      keys.map((k) =>
        getBusHistory(bstopId, (targetDates as any)[k].dateStr)
          .then((res) => ({ key: k, res }))
          .catch(() => ({ key: k, res: null })),
      ),
    )
      .then((results) => {
        if (!isMounted) return;

        const newMap: Record<string, RawHistoryRecord[]> = {};
        results.forEach(({ key, res }) => {
          const raw = res?.historyRecords ?? [];
          newMap[key] = raw;
        });
        setRawRecordsMap(newMap);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, bstopId, targetDates]);

  const isAllRoutesMode = selectedRoute === ALL_ROUTES_VALUE;

  // 순환 버스 접두사 유무와 무관하게 동일 노선인지 판별 ("순환41" === "41")
  const isMatchingRoute = (routeA?: string, routeB?: string) => {
    if (!routeA || !routeB) return false;
    if (routeA === routeB) return true;
    const cleanA = routeA.replace(/^순환/, "").trim();
    const cleanB = routeB.replace(/^순환/, "").trim();
    return cleanA === cleanB;
  };

  // 1) 전체 노선 모드일 때: 타임라인 아이템 리스트 생성
  const timelineItems = useMemo(() => {
    if (!isAllRoutesMode) return [];

    // 오늘 요일이면 w0(오늘), 다른 요일이면 w1(가장 최근 해당 요일) 데이터 사용
    const primaryKey = selectedDayIndex === todayDayIndex ? "w0" : "w1";
    const records = rawRecordsMap[primaryKey] || [];

    // 해당 정류장에서 운행/관리 중인 노선 목록으로만 엄격히 필터링
    const allowedRouteList = availableRoutes.filter(Boolean);

    const items: TimelineItem[] = [];
    records.forEach((r, idx) => {
      if (
        allowedRouteList.length > 0 &&
        !allowedRouteList.some((allowed) => isMatchingRoute(allowed, r.routeNo))
      ) {
        return;
      }
      const timeStr = r.arrivalTime
        ? r.arrivalTime.split("T")[1]?.substring(0, 5) ||
          r.arrivalTime.substring(11, 16)
        : "";
      if (!timeStr) return;

      const [h, m] = timeStr.split(":").map(Number);
      items.push({
        id: r.id || `${r.routeNo}_${timeStr}_${idx}`,
        routeNo: r.routeNo,
        busNumPlate: r.busNumPlate,
        timeStr,
        hour: h,
        minutes: h * 60 + m,
      });
    });

    items.sort((a, b) => a.minutes - b.minutes);
    return items;
  }, [
    isAllRoutesMode,
    selectedDayIndex,
    todayDayIndex,
    rawRecordsMap,
    availableRoutes,
  ]);

  // 2) 개별 노선 모드일 때: 다주차 비교 매트릭스 표 생성 (차량 번호 포함)
  const matrixRows = useMemo(() => {
    if (isAllRoutesMode) return [];

    interface CellRecord {
      time: string;
      plate?: string;
      minutes: number;
    }

    const keys = columns.map((c) => c.key);
    const lists: CellRecord[][] = keys.map((k) => {
      const list = rawRecordsMap[k] || [];
      const cells: CellRecord[] = [];
      list.forEach((r) => {
        if (!isMatchingRoute(r.routeNo, selectedRoute)) return;
        const time = r.arrivalTime
          ? r.arrivalTime.split("T")[1]?.substring(0, 5) ||
            r.arrivalTime.substring(11, 16)
          : "";
        if (!time) return;
        const [h, m] = time.split(":").map(Number);
        cells.push({
          time,
          plate: formatBusPlate(r.busNumPlate),
          minutes: h * 60 + m,
        });
      });
      cells.sort((a, b) => a.minutes - b.minutes);
      return cells;
    });

    const pointers = new Array(keys.length).fill(0);

    const rows: Array<{
      hour: number;
      representativeMinutes: number;
      cells: Record<string, MatrixCellData | undefined>;
    }> = [];

    const THRESHOLD = 12;

    while (pointers.some((ptr, idx) => ptr < lists[idx].length)) {
      let minVal = Infinity;
      pointers.forEach((ptr, idx) => {
        if (ptr < lists[idx].length) {
          const m = lists[idx][ptr].minutes;
          if (m < minVal) minVal = m;
        }
      });

      if (minVal === Infinity) break;

      const rowCells: Record<string, MatrixCellData | undefined> = {};
      pointers.forEach((ptr, idx) => {
        if (ptr < lists[idx].length) {
          const cell = lists[idx][ptr];
          if (Math.abs(cell.minutes - minVal) <= THRESHOLD) {
            rowCells[keys[idx]] = {
              time: cell.time,
              plate: cell.plate,
            };
            pointers[idx]++;
          }
        }
      });

      rows.push({
        hour: Math.floor(minVal / 60),
        representativeMinutes: minVal,
        cells: rowCells,
      });
    }

    return rows;
  }, [isAllRoutesMode, selectedRoute, columns, rawRecordsMap]);

  // 타깃 행/아이템 인덱스 (오늘 요일일 때 현재 시각 기준 가장 가까운 항목)
  const targetRowIndex = useMemo(() => {
    if (selectedDayIndex !== todayDayIndex) return -1;

    if (isAllRoutesMode) {
      if (timelineItems.length === 0) return -1;
      const upcomingIdx = timelineItems.findIndex(
        (item) => item.minutes >= currentMinutes,
      );
      return upcomingIdx !== -1 ? upcomingIdx : timelineItems.length - 1;
    } else {
      if (matrixRows.length === 0) return -1;
      const upcomingIdx = matrixRows.findIndex(
        (row) => row.representativeMinutes >= currentMinutes,
      );
      return upcomingIdx !== -1 ? upcomingIdx : matrixRows.length - 1;
    }
  }, [
    isAllRoutesMode,
    timelineItems,
    matrixRows,
    selectedDayIndex,
    todayDayIndex,
    currentMinutes,
  ]);

  // 데이터 변경 시 ref 초기화
  useEffect(() => {
    hourRowRefs.current = {};
  }, [matrixRows, timelineItems, isAllRoutesMode]);

  // 사용 가능한 시간대 칩 목록 (05시~23시)
  const availableHours = useMemo(() => {
    return ALL_COLLECTED_HOURS;
  }, []);

  // 선택된 시간대 칩이 보이도록 칩 바 가로 스크롤
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      const chipEl = hourChipRefs.current[selectedHour];
      if (chipEl) {
        chipEl.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isOpen, selectedHour, selectedDayIndex]);

  // 시간대 칩 클릭 시 해당 시간대로 부드럽게 스크롤
  const handleHourClick = (hour: number) => {
    const container = listContainerRef.current;
    if (!container) return;

    if (isAllRoutesMode) {
      if (timelineItems.length === 0) return;
      const firstHour = timelineItems[0].hour;
      const lastHour = timelineItems[timelineItems.length - 1].hour;

      if (hour <= firstHour) {
        container.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (hour >= lastHour) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
        return;
      }

      let targetIdx = timelineItems.findIndex((item) => item.hour >= hour);
      if (targetIdx === -1) targetIdx = timelineItems.length - 1;

      const targetHour = timelineItems[targetIdx].hour;
      const targetElement = hourRowRefs.current[targetHour];
      if (targetElement) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const relativeTop = targetRect.top - containerRect.top;
        const targetScrollTop = container.scrollTop + relativeTop - 45;
        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: "smooth",
        });
      }
    } else {
      if (matrixRows.length === 0) return;
      const firstHour = matrixRows[0].hour;
      const lastHour = matrixRows[matrixRows.length - 1].hour;

      if (hour <= firstHour) {
        container.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (hour >= lastHour) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
        return;
      }

      let targetIdx = matrixRows.findIndex((r) => r.hour >= hour);
      if (targetIdx === -1) targetIdx = matrixRows.length - 1;

      const targetHour = matrixRows[targetIdx].hour;
      const targetElement = hourRowRefs.current[targetHour];
      if (targetElement) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const relativeTop = targetRect.top - containerRect.top;
        const targetScrollTop = container.scrollTop + relativeTop - 45;
        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: "smooth",
        });
      }
    }
  };

  const handleHourChipClick = (hour: number) => {
    setSelectedHour(hour);
    handleHourClick(hour);
  };

  // 모달 오픈 시 현재 시간 강조 라인으로 자동 스크롤
  useEffect(() => {
    const hasData = isAllRoutesMode
      ? timelineItems.length > 0
      : matrixRows.length > 0;
    if (!isOpen || loading || !hasData || hasAutoScrolledRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      const container = listContainerRef.current;
      hasAutoScrolledRef.current = true;

      if (
        selectedDayIndex === todayDayIndex &&
        targetItemRef.current &&
        container
      ) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetItemRef.current.getBoundingClientRect();
        const relativeTop = targetRect.top - containerRect.top;
        const targetScrollTop = container.scrollTop + relativeTop - 90;

        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: "smooth",
        });
        return;
      }

      handleHourClick(selectedHour);
    }, 120);

    return () => clearTimeout(timer);
  }, [
    isOpen,
    loading,
    matrixRows,
    timelineItems,
    isAllRoutesMode,
    targetRowIndex,
    selectedDayIndex,
    todayDayIndex,
    selectedHour,
  ]);

  const currentDayLabel =
    DAYS_OF_WEEK.find((d) => d.dayIndex === selectedDayIndex)?.label || "";

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <ModalOverlay />
        <ModalContainer>
          {/* 상단 네비게이션 헤더 */}
          <NavHeader>
            <BackButton onClick={onClose} aria-label="뒤로가기">
              <ChevronLeft size={24} color="#111827" />
            </BackButton>
            <Dialog.Title asChild>
              <NavTitle>과거 시간표</NavTitle>
            </Dialog.Title>
            <div style={{ width: 24 }} />
          </NavHeader>

          {/* 정류장 정보 */}
          <StopInfoSection>
            <StopName>{stopName}</StopName>
            <StopMeta>
              {bstopId}
              {routeNextStopMap[selectedRoute]
                ? ` · ${routeNextStopMap[selectedRoute]} 방면`
                : ""}
            </StopMeta>
          </StopInfoSection>

          {/* 노선 선택 드롭다운 / 셀렉터 */}
          <RouteSelectorContainer>
            <RouteSelectWrapper>
              <RouteBadge
                tone={
                  isAllRoutesMode ? "all" : getBusCircleTone(selectedRoute)
                }
              >
                {isAllRoutesMode
                  ? "전체"
                  : selectedRoute.startsWith("순환") ||
                      ["41", "42", "43", "46", "47"].includes(selectedRoute)
                    ? "순환"
                    : selectedRoute.startsWith("M") ||
                        [
                          "1301",
                          "3002",
                          "303-1",
                          "6405",
                          "M6405",
                          "M6464",
                        ].includes(selectedRoute)
                      ? "광역"
                      : "간선"}
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
                    {routeNo === ALL_ROUTES_VALUE
                      ? "전체 노선 도착 순서"
                      : `${routeNo}번`}
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
                  setSelectedHour(
                    item.dayIndex === todayDayIndex
                      ? new Date().getHours()
                      : 9,
                  );
                  hasAutoScrolledRef.current = false;
                }}
              >
                {item.label}
              </DayTabItem>
            ))}
          </DayTabBar>

          {/* 시간대(Hour) 빠른 필터 칩 바 (05시~23시) */}
          <HourFilterBar>
            {availableHours.map((hour) => {
              const isSelected = selectedHour === hour;
              return (
                <HourChip
                  key={hour}
                  ref={(el) => {
                    hourChipRefs.current[hour] = el;
                  }}
                  active={isSelected}
                  onClick={() => handleHourChipClick(hour)}
                >
                  {hour}시
                </HourChip>
              );
            })}
          </HourFilterBar>

          {/* 본문 뷰포트 (전체 노선: 타임라인 뷰 / 개별 노선: 매트릭스 표) */}
          <TableViewport ref={listContainerRef}>
            {loading ? (
              <LoadingBox>
                <RotateCw size={24} className="spin" color="#2563eb" />
                <LoadingText>
                  {isAllRoutesMode
                    ? `${selectedDayIndex === todayDayIndex ? "오늘" : `${currentDayLabel}요일`} 도착 기록을 불러오는 중...`
                    : "시간표 데이터를 불러오는 중..."}
                </LoadingText>
              </LoadingBox>
            ) : isAllRoutesMode ? (
              /* 1. 전체 노선 타임라인 뷰 */
              timelineItems.length === 0 ? (
                <EmptyBox>
                  <Clock size={36} color="#d1d5db" />
                  <EmptyTitle>해당 요일의 도착 기록이 없습니다.</EmptyTitle>
                  <EmptyDesc>
                    운행 시간(05:00~23:59) 중 실측된 버스 도착 기록이 표시됩니다.
                  </EmptyDesc>
                </EmptyBox>
              ) : (
                <TimelineContainer>
                  <TimelineHeaderNotice>
                    <span>
                      {selectedDayIndex === todayDayIndex
                        ? "오늘 정류장을 통과한 전체 버스 실측 도착 순서입니다."
                        : `최근 ${currentDayLabel}요일에 정류장을 통과한 전체 버스 도착 순서입니다.`}
                    </span>
                  </TimelineHeaderNotice>

                  <TimelineList>
                    {timelineItems.map((item, idx) => {
                      const isTarget = idx === targetRowIndex;
                      const isHourFirstItem =
                        idx === 0 || timelineItems[idx - 1].hour !== item.hour;
                      const tone = getBusCircleTone(item.routeNo);

                      return (
                        <TimelineItemWrapper
                          key={item.id}
                          ref={(el) => {
                            if (isTarget) {
                              targetItemRef.current = el;
                            }
                            if (isHourFirstItem) {
                              hourRowRefs.current[item.hour] = el;
                            }
                          }}
                          $isTarget={isTarget}
                        >
                          <TimelineTimeColumn $isTarget={isTarget}>
                            <TimeText>{item.timeStr}</TimeText>
                          </TimelineTimeColumn>

                          <TimelineNodeColumn>
                            <TimelineNode $tone={tone} $isTarget={isTarget} />
                            <TimelineLine />
                          </TimelineNodeColumn>

                          <TimelineContentCard $isTarget={isTarget}>
                            <CardMainRow>
                              <BusBadge tone={tone}>{item.routeNo}번</BusBadge>
                              {item.busNumPlate && (
                                <PlateBadge>
                                  {formatBusPlate(item.busNumPlate)}
                                </PlateBadge>
                              )}
                              {isTarget && selectedDayIndex === todayDayIndex && (
                                <TargetTag>현재 근접</TargetTag>
                              )}
                            </CardMainRow>
                            {routeNextStopMap[item.routeNo] && (
                              <NextStopText>
                                {routeNextStopMap[item.routeNo]} 방면
                              </NextStopText>
                            )}
                          </TimelineContentCard>
                        </TimelineItemWrapper>
                      );
                    })}
                  </TimelineList>
                </TimelineContainer>
              )
            ) : (
              /* 2. 개별 노선 다주차 비교 매트릭스 표 */
              matrixRows.length === 0 ? (
                <EmptyBox>
                  <Clock size={36} color="#d1d5db" />
                  <EmptyTitle>해당 요일의 실측 도착 기록이 없습니다.</EmptyTitle>
                  <EmptyDesc>
                    {selectedDayIndex === todayDayIndex
                      ? "오늘 및 과거 3주간의 도착 이력을 기반으로 시간표가 구성됩니다."
                      : "과거 3주간의 도착 이력을 기반으로 시간표가 구성됩니다."}
                  </EmptyDesc>
                </EmptyBox>
              ) : (
                <MatrixTable>
                  <thead>
                    <tr>
                      {columns.map((col) => (
                        <TableHeaderCell
                          key={col.key}
                          $isToday={col.isToday}
                          $colCount={columns.length}
                        >
                          <div className="title">{col.title}</div>
                          <div className="date">{col.headerLabel}</div>
                        </TableHeaderCell>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixRows.map((row, idx) => {
                      const isTarget = idx === targetRowIndex;
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
                          {columns.map((col) => {
                            const cellData = row.cells[col.key];
                            return (
                              <MatrixTableCell
                                key={col.key}
                                isTarget={isTarget}
                                $isToday={col.isToday}
                              >
                                {cellData ? (
                                  <CellContent>
                                    <span className="time">{cellData.time}</span>
                                    {cellData.plate && (
                                      <span className="plate">
                                        {cellData.plate}
                                      </span>
                                    )}
                                  </CellContent>
                                ) : (
                                  ""
                                )}
                              </MatrixTableCell>
                            );
                          })}
                        </MatrixTableRow>
                      );
                    })}
                  </tbody>
                </MatrixTable>
              )
            )}
          </TableViewport>
        </ModalContainer>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Styled Components & Keyframes
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleUp = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const ModalOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 99999;
  animation: ${fadeIn} 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
`;

const ModalContainer = styled(Dialog.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ffffff;
  border-radius: 18px;
  width: calc(100% - 24px);
  max-width: 440px;
  height: 88vh;
  max-height: 780px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 100000;
  outline: none;
  animation: ${scaleUp} 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
  background-color: ${({ tone }) => {
    if (tone === "all") return "#475569";
    if (tone === "green") return "#16a34a";
    if (tone === "red") return "#dc2626";
    return "#2563eb";
  }};
  color: #ffffff;
  margin-right: 10px;
  flex-shrink: 0;
`;

const RouteSelect = styled.select`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
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

// --- 타임라인 뷰 스타일 ---
const TimelineContainer = styled.div`
  padding: 14px 16px 30px;
`;

const TimelineHeaderNotice = styled.div`
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 16px;
  font-size: 12px;
  color: #64748b;
  text-align: center;
`;

const TimelineList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TimelineItemWrapper = styled.div<{ $isTarget?: boolean }>`
  display: flex;
  align-items: center;
  min-height: 48px;
  background-color: ${({ $isTarget }) =>
    $isTarget ? "rgba(239, 246, 255, 0.7)" : "transparent"};
  border-radius: 10px;
  padding: 4px 8px;
  transition: background-color 0.15s;
`;

const TimelineTimeColumn = styled.div<{ $isTarget?: boolean }>`
  width: 50px;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: ${({ $isTarget }) => ($isTarget ? "800" : "600")};
  color: ${({ $isTarget }) => ($isTarget ? "#2563eb" : "#334155")};
`;

const TimeText = styled.span`
  letter-spacing: -0.2px;
`;

const TimelineNodeColumn = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
  align-self: stretch;
  justify-content: center;
`;

const TimelineNode = styled.div<{ $tone?: string; $isTarget?: boolean }>`
  width: ${({ $isTarget }) => ($isTarget ? "12px" : "8px")};
  height: ${({ $isTarget }) => ($isTarget ? "12px" : "8px")};
  border-radius: 50%;
  background-color: ${({ $tone }) => {
    if ($tone === "green") return "#16a34a";
    if ($tone === "red") return "#dc2626";
    return "#2563eb";
  }};
  z-index: 2;
  box-shadow: ${({ $isTarget }) =>
    $isTarget ? "0 0 0 3px rgba(37, 99, 235, 0.25)" : "none"};
`;

const TimelineLine = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1.5px;
  background-color: #e2e8f0;
  z-index: 1;
`;

const TimelineContentCard = styled.div<{ $isTarget?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 6px 8px;
`;

const CardMainRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const BusBadge = styled.span<{ tone?: string }>`
  font-size: 12.5px;
  font-weight: 700;
  color: ${({ tone }) => {
    if (tone === "green") return "#15803d";
    if (tone === "red") return "#b91c1c";
    return "#1d4ed8";
  }};
`;

const PlateBadge = styled.span`
  font-size: 10.5px;
  font-weight: 600;
  color: #64748b;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 1.5px 5px;
  border-radius: 4px;
`;

const NextStopText = styled.span`
  font-size: 11.5px;
  color: #64748b;
  margin-left: 2px;
`;

const TargetTag = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #2563eb;
  background-color: #dbeafe;
  padding: 2px 6px;
  border-radius: 6px;
  margin-left: auto;
`;

// --- 매트릭스 표 스타일 ---
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

const TableHeaderCell = styled.th<{ $isToday?: boolean; $colCount: number }>`
  padding: 12px 4px;
  border-bottom: 1px solid #e2e8f0;
  border-right: 1px solid #f1f5f9;
  width: ${({ $colCount }) => `${100 / $colCount}%`};
  background-color: ${({ $isToday }) => ($isToday ? "#eff6ff" : "inherit")};

  &:last-child {
    border-right: none;
  }

  .title {
    font-size: 13px;
    font-weight: 700;
    color: ${({ $isToday }) => ($isToday ? "#2563eb" : "#1e293b")};
  }

  .date {
    font-size: 11px;
    font-weight: 500;
    color: ${({ $isToday }) => ($isToday ? "#3b82f6" : "#64748b")};
    margin-top: 2px;
  }
`;

const MatrixTableRow = styled.tr<{ isTarget?: boolean }>`
  background-color: ${({ isTarget }) => (isTarget ? "#eff6ff" : "#ffffff")};
  transition: background-color 0.15s;

  &:hover {
    background-color: ${({ isTarget }) => (isTarget ? "#e0eeff" : "#f8fafc")};
  }
`;

const MatrixTableCell = styled.td<{ isTarget?: boolean; $isToday?: boolean }>`
  padding: 10px 3px;
  font-size: 13.5px;
  font-weight: ${({ isTarget, $isToday }) =>
    isTarget ? "800" : $isToday ? "700" : "600"};
  color: ${({ isTarget, $isToday }) =>
    isTarget ? "#2563eb" : $isToday ? "#1d4ed8" : "#1e293b"};
  border-bottom: 1px solid
    ${({ isTarget }) => (isTarget ? "#bfdbfe" : "#f1f5f9")};
  border-right: 1px solid
    ${({ isTarget }) => (isTarget ? "#bfdbfe" : "#f1f5f9")};
  background-color: ${({ isTarget, $isToday }) =>
    isTarget ? "inherit" : $isToday ? "rgba(239, 246, 255, 0.4)" : "inherit"};

  &:last-child {
    border-right: none;
  }
`;

const CellContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  .time {
    font-size: 13.5px;
    font-weight: inherit;
    color: inherit;
  }

  .plate {
    font-size: 10px;
    font-weight: 500;
    color: #94a3b8;
    background-color: #f8fafc;
    border-radius: 3px;
    padding: 0 3px;
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
