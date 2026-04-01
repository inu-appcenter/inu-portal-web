import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { Drawer } from "vaul";
import { RotateCw } from "lucide-react";
import { FiChevronRight } from "react-icons/fi";
import BusCircle from "@/components/mobile/bus/BusCircle";
import BusRouteBar from "@/components/mobile/bus/BusRouteBar";
import { BUS_MAP_BOTTOM_SHEET_HEIGHT } from "@/components/mobile/bus/map/busMapSheetConfig";
import Skeleton from "@/components/common/Skeleton";
import useBusArrival from "@/hooks/useBusArrival";
import { ROUTES } from "@/constants/routes";
import type { BusData } from "@/types/bus";
import type { BusMapStop } from "@/components/mobile/bus/data/busMapConfig";
import { getArrivalStationText } from "@/components/mobile/bus/busArrivalDisplay";

interface BusMapPanelProps {
  isDesktop?: boolean;
  selectedStop: BusMapStop | null;
  selectedBusId: number | null;
  onSelectBus: (busId: number) => void;
  stopOptions?: { id: string; label: string }[];
  selectedStopId?: string | null;
  onSelectStop?: (stopId: string) => void;
  snap: string | number | null;
  setSnap: (snap: string | number | null) => void;
}

export default function BusMapPanel({
  isDesktop = false,
  selectedStop,
  selectedBusId,
  onSelectBus,
  stopOptions = [],
  selectedStopId = null,
  onSelectStop,
  snap,
  setSnap,
}: BusMapPanelProps) {
  const navigate = useNavigate();
  const busListRef = useRef<HTMLDivElement | null>(null);
  const busItemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const previousSnapRef = useRef<string | number | null>(snap);
  const refreshCooldownTimeoutsRef = useRef<Record<string, number>>({});
  const liveBuses = selectedStop?.supportsLiveArrival ? selectedStop.buses : [];
  const { busArrivalList, isLoading, isFetching, refetch, lastUpdated } =
    useBusArrival(selectedStop?.bstopId ?? "", liveBuses);
  const [cooldownsByStopKey, setCooldownsByStopKey] = useState<
    Record<string, boolean>
  >({});
  const shouldShowStopSwitcher =
    Boolean(onSelectStop) &&
    (stopOptions.length > 1 ||
      (stopOptions.length === 1 && stopOptions[0]?.label.includes("출구")));
  const selectedStopCooldownKey = selectedStop?.bstopId ?? selectedStop?.id ?? "";
  const isSelectedStopCooldown = selectedStopCooldownKey
    ? Boolean(cooldownsByStopKey[selectedStopCooldownKey])
    : false;

  const displayedBuses = useMemo(() => {
    if (!selectedStop) {
      return [];
    }

    return selectedStop.supportsLiveArrival
      ? busArrivalList
      : selectedStop.buses;
  }, [busArrivalList, selectedStop]);
  const displayedBusSections = useMemo(() => {
    if (!selectedStop) {
      return [];
    }

    const busLookup = new Map(displayedBuses.map((bus) => [bus.id, bus]));

    return selectedStop.busSections
      .map((section) => ({
        ...section,
        buses: section.buses
          .map((bus) => busLookup.get(bus.id) ?? bus)
          .filter((bus): bus is BusData => Boolean(bus)),
      }))
      .filter((section) => section.buses.length > 0);
  }, [displayedBuses, selectedStop]);

  const startRefreshCooldown = useCallback((stopKey: string) => {
    if (!stopKey) {
      return;
    }

    const existingTimeout = refreshCooldownTimeoutsRef.current[stopKey];
    if (existingTimeout) {
      window.clearTimeout(existingTimeout);
    }

    setCooldownsByStopKey((prev) => ({
      ...prev,
      [stopKey]: true,
    }));

    refreshCooldownTimeoutsRef.current[stopKey] = window.setTimeout(() => {
      setCooldownsByStopKey((prev) => ({
        ...prev,
        [stopKey]: false,
      }));
      delete refreshCooldownTimeoutsRef.current[stopKey];
    }, 10000);
  }, []);

  const handleRefresh = useCallback(() => {
    if (
      !selectedStop?.supportsLiveArrival ||
      isSelectedStopCooldown ||
      isFetching
    ) {
      return;
    }

    refetch();
    startRefreshCooldown(selectedStopCooldownKey);
  }, [
    isFetching,
    isSelectedStopCooldown,
    refetch,
    selectedStop?.supportsLiveArrival,
    selectedStopCooldownKey,
    startRefreshCooldown,
  ]);

  const handleBusClick = useCallback(
    (bus: BusData) => {
      if (bus.number === "셔틀") {
        navigate(`${ROUTES.BUS.INFO}?type=shuttle&category=인천대입구 셔틀`);
        return;
      }

      onSelectBus(bus.id);
    },
    [navigate, onSelectBus],
  );

  const setBusItemRef = useCallback(
    (busId: number) => (node: HTMLDivElement | null) => {
      busItemRefs.current[busId] = node;
    },
    [],
  );

  useEffect(() => {
    if (isDesktop || selectedBusId === null) {
      return;
    }

    const listElement = busListRef.current;
    const itemElement = busItemRefs.current[selectedBusId];

    if (!listElement || !itemElement) {
      return;
    }

    const shouldWaitForSheetResize =
      typeof previousSnapRef.current === "number" &&
      previousSnapRef.current !== BUS_MAP_BOTTOM_SHEET_HEIGHT.DEFAULT;

    let nestedFrameId = 0;
    let frameId = 0;
    let timeoutId = 0;
    const scrollSelectedBusIntoView = () => {
      frameId = window.requestAnimationFrame(() => {
        nestedFrameId = window.requestAnimationFrame(() => {
          const listRect = listElement.getBoundingClientRect();
          const itemRect = itemElement.getBoundingClientRect();
          const nextTop = Math.max(
            0,
            listElement.scrollTop + (itemRect.top - listRect.top),
          );

          listElement.scrollTo({
            top: nextTop,
            behavior: "smooth",
          });
        });
      });
    };

    if (shouldWaitForSheetResize) {
      timeoutId = window.setTimeout(scrollSelectedBusIntoView, 520);
    } else {
      scrollSelectedBusIntoView();
    }

    return () => {
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(nestedFrameId);
    };
  }, [isDesktop, selectedBusId, selectedStop?.id]);

  useEffect(() => {
    previousSnapRef.current = snap;
  }, [snap]);

  useEffect(() => {
    return () => {
      Object.values(refreshCooldownTimeoutsRef.current).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  useEffect(() => {
    const listElement = busListRef.current;

    if (!listElement) {
      return;
    }

    listElement.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [selectedStop?.id]);

  const panelContent = (
    <PanelSurface $isDesktop={isDesktop}>
      <PanelInner $isDesktop={isDesktop}>
        {!isDesktop ? (
          <DragHeader>
            <HandleBar />
          </DragHeader>
        ) : null}

        {selectedStop ? (
          <>
            <PanelHeader>
              <PanelTitle>{selectedStop.stopName}</PanelTitle>
              <PanelDescription>{selectedStop.stopNotice}</PanelDescription>
            </PanelHeader>

            <RefreshRow>
              <LastUpdatedText>
                업데이트: {formatTime(lastUpdated)}
              </LastUpdatedText>
              <RefreshButton
                type="button"
                onClick={handleRefresh}
                $isFetching={isFetching}
                $isCooldown={isSelectedStopCooldown}
                disabled={isSelectedStopCooldown || isFetching}
              >
                <RotateCw size={12} />
              </RefreshButton>
            </RefreshRow>

            <ListViewport
              $isDesktop={isDesktop}
              $snap={snap}
              data-vaul-no-drag={isDesktop ? undefined : ""}
            >
              <BusList
                ref={busListRef}
                data-vaul-no-drag={isDesktop ? undefined : ""}
              >
                {isLoading
                  ? selectedStop.busSections.map((section) => (
                      <BusSection key={section.id}>
                        {section.label ? (
                          <BusSectionHeading>{section.label}</BusSectionHeading>
                        ) : null}
                        {Array.from({
                          length: Math.max(section.buses.length, 1),
                        }).map((_, index) => (
                          <BusCardSkeleton
                            key={`${section.id}-skeleton-${index}`}
                          />
                        ))}
                      </BusSection>
                    ))
                  : displayedBusSections.map((section) => (
                      <BusSection key={section.id}>
                        {section.label ? (
                          <BusSectionHeading>{section.label}</BusSectionHeading>
                        ) : null}
                        {section.buses.map((bus) => {
                          const isSelected = selectedBusId === bus.id;
                          const statusContent = renderBusStatus(
                            bus,
                            selectedStop.supportsLiveArrival,
                          );
                          const canShowRouteProgress =
                            isSelected &&
                            selectedStop.supportsLiveArrival &&
                            Boolean(selectedStop.bstopId && bus.lastStopId);

                          return (
                            <BusCardItem
                              key={bus.id}
                              ref={setBusItemRef(bus.id)}
                              $selected={isSelected}
                            >
                              <BusCardButton
                                type="button"
                                onClick={() => handleBusClick(bus)}
                              >
                                <BusCardButtonInnerWrapper>
                                  <RouteDescription>
                                    {formatRouteText(bus)}
                                  </RouteDescription>
                                  <BusMainRow>
                                    <BusCircle
                                      number={bus.number}
                                      isGreen={
                                        bus.number === "41" ||
                                        bus.number === "46"
                                      }
                                    />
                                    <ArrivalInfo>
                                      <ArrivalWrapper>
                                        <ArrivalTime>
                                          {getBusDisplayTime(
                                            bus,
                                            selectedStop.supportsLiveArrival,
                                          )}
                                        </ArrivalTime>
                                        {statusContent ? (
                                          <StatusBadge>
                                            {statusContent}
                                          </StatusBadge>
                                        ) : null}
                                      </ArrivalWrapper>
                                    </ArrivalInfo>
                                  </BusMainRow>
                                </BusCardButtonInnerWrapper>
                                <ChevronIcon $selected={isSelected}>
                                  <FiChevronRight strokeWidth={3} />
                                </ChevronIcon>
                              </BusCardButton>

                              {canShowRouteProgress ? (
                                <BusRouteBar
                                  embedded
                                  bus={bus}
                                  bstopId={selectedStop.bstopId ?? ""}
                                  currentArrival={{
                                    arrivalInfo: bus.arrivalInfo,
                                    isFetching,
                                    lastUpdated,
                                    refetch,
                                    isCooldown: isSelectedStopCooldown,
                                    startCooldown: () =>
                                      startRefreshCooldown(selectedStopCooldownKey),
                                  }}
                                />
                              ) : null}
                            </BusCardItem>
                          );
                        })}
                      </BusSection>
                    ))}
              </BusList>
            </ListViewport>
          </>
        ) : (
          <EmptyPanelMessage>
            지도 위에서 정류장을 눌러 버스 정보를 확인해 주세요.
          </EmptyPanelMessage>
        )}
      </PanelInner>
    </PanelSurface>
  );

  if (isDesktop) {
    return <DesktopPanelShell>{panelContent}</DesktopPanelShell>;
  }

  return (
    <Drawer.Root
      open={true}
      dismissible={false}
      modal={false}
      snapPoints={[
        BUS_MAP_BOTTOM_SHEET_HEIGHT.MIN,
        BUS_MAP_BOTTOM_SHEET_HEIGHT.DEFAULT,
        BUS_MAP_BOTTOM_SHEET_HEIGHT.MAX,
      ]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <Drawer.Portal>
        <DrawerContent>
          <MobileSheetShell>
            {shouldShowStopSwitcher ? (
              <StopSwitcherDock data-vaul-no-drag="">
                <StopSwitcherRail data-vaul-no-drag="">
                  {stopOptions.map((stop) => {
                    const isSelected = stop.id === selectedStopId;

                    return (
                      <StopSwitcherButton
                        key={stop.id}
                        type="button"
                        $selected={isSelected}
                        aria-pressed={isSelected}
                        data-vaul-no-drag=""
                        onClick={() => onSelectStop?.(stop.id)}
                      >
                        {stop.label}
                      </StopSwitcherButton>
                    );
                  })}
                </StopSwitcherRail>
              </StopSwitcherDock>
            ) : null}

            {panelContent}
          </MobileSheetShell>
        </DrawerContent>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function formatRouteText(bus: BusData) {
  return bus.routeNotice ?? bus.route.filter(Boolean).join(" -> ");
}

function getBusDisplayTime(bus: BusData, supportsLiveArrival: boolean) {
  if (bus.arrivalInfo?.time) {
    return bus.arrivalInfo.time;
  }

  return supportsLiveArrival ? "정보 확인" : "노선 보기";
}

function renderBusStatus(bus: BusData, supportsLiveArrival: boolean) {
  if (!supportsLiveArrival) {
    return "실시간 미지원";
  }

  if (!bus.arrivalInfo) {
    return null;
  }

  const { status, isLastBus } = bus.arrivalInfo;
  const stationText = getArrivalStationText(bus.arrivalInfo);

  if (!stationText && !status && !isLastBus) {
    return null;
  }

  return (
    <>
      {stationText ? `${stationText} ` : ""}
      {isLastBus ? (
        <LastBus>막차운행</LastBus>
      ) : status ? (
        <StatusText $status={status}>{status}</StatusText>
      ) : null}
    </>
  );
}

function formatTime(date: Date) {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
}

function BusCardSkeleton() {
  return (
    <SkeletonCard>
      <Skeleton width="62%" height={12} />
      <SkeletonMainRow>
        <Skeleton width={42} height={42} circle />
        <SkeletonInfo>
          <Skeleton width={84} height={18} />
          <Skeleton width="70%" height={12} />
        </SkeletonInfo>
        <Skeleton width={62} height={26} />
      </SkeletonMainRow>
    </SkeletonCard>
  );
}

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const DesktopPanelShell = styled.aside`
  min-width: 0;
  height: 100%;
  min-height: 0;
`;

const DrawerContent = styled(Drawer.Content)`
  height: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  max-height: 96%;
  outline: none;
  margin-left: auto;
  margin-right: auto;
  overflow: visible;
`;

const MobileSheetShell = styled.div`
  position: relative;
  height: 100%;
`;

const StopSwitcherDock = styled.div`
  position: absolute;
  top: -8px;
  left: 16px;
  right: 16px;
  z-index: 1;
  display: flex;
  justify-content: flex-start;
  pointer-events: none;
  transform: translateY(-100%);
`;

const StopSwitcherRail = styled.div`
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 10px 24px rgba(22, 40, 74, 0.14);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  overflow-x: auto;
  pointer-events: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const StopSwitcherButton = styled.button<{ $selected: boolean }>`
  border: 0;
  flex-shrink: 0;
  min-width: 0;
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  color: ${({ $selected }) => ($selected ? "#ffffff" : "#35506d")};
  background: ${({ $selected }) =>
    $selected ? "#1f5fbc" : "rgba(240, 245, 252, 0.92)"};
  box-shadow: ${({ $selected }) =>
    $selected ? "0 8px 16px rgba(31, 95, 188, 0.24)" : "none"};
  transition:
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const PanelSurface = styled.div<{ $isDesktop: boolean }>`
  background: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;

  ${({ $isDesktop }) =>
    $isDesktop
      ? `
        border-radius: 28px;
        border: 1px solid rgba(64, 113, 185, 0.1);
        box-shadow:
          0 20px 40px rgba(35, 60, 115, 0.08),
          0 4px 12px rgba(35, 60, 115, 0.06);
      `
      : `
        border-top-left-radius: 24px;
        border-top-right-radius: 24px;
      `}
`;

const PanelInner = styled.div<{ $isDesktop: boolean }>`
  width: 100%;
  padding: ${({ $isDesktop }) => ($isDesktop ? "24px 24px 20px" : "0 16px")};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const DragHeader = styled.div`
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  //margin-bottom: 8px;
`;

const HandleBar = styled.div`
  width: 42px;
  height: 4px;
  border-radius: 999px;
  background: #d9e3f5;
`;

const PanelHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
`;

const PanelTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  color: #20355d;
  word-break: keep-all;
`;

const PanelDescription = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #516a86;
  white-space: pre-wrap;
  word-break: keep-all;
`;

const RefreshRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  //margin-top: 8px;
  flex-shrink: 0;
`;

const LastUpdatedText = styled.span`
  font-size: 11px;
  color: #70839d;
`;

const RefreshButton = styled.button<{
  $isFetching: boolean;
  $isCooldown: boolean;
}>`
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: ${({ $isCooldown }) => ($isCooldown ? "#a6bad9" : "#2b62b8")};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;

  ${({ $isFetching }) =>
    $isFetching &&
    css`
      animation: ${rotate} 1s linear infinite;
    `}

  &:disabled {
    cursor: not-allowed;
  }
`;

const ListViewport = styled.div<{
  $isDesktop: boolean;
  $snap: string | number | null;
}>`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  margin-top: ${({ $isDesktop }) => ($isDesktop ? "12px" : "4px")};
  max-height: ${({ $isDesktop, $snap }) =>
    $isDesktop
      ? "none"
      : typeof $snap === "number"
        ? `clamp(0px, calc(${$snap * 100}dvh - 130px), 100dvh)`
        : "none"};
  transition: ${({ $isDesktop }) =>
    $isDesktop ? "none" : "max-height 0.5s cubic-bezier(0.32, 0.72, 0, 1)"};
`;

const BusList = styled.div`
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  //padding: 12px 8px 24px;
  padding-bottom: 64px;
  box-sizing: border-box;

  & > * {
    flex-shrink: 0;
  }
`;

const BusSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BusSectionHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #1f5fbc;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  word-break: keep-all;

  &::after {
    content: "";
    flex: 1;
    min-width: 24px;
    height: 1px;
    background: rgba(31, 95, 188, 0.18);
  }
`;

const BusCardItem = styled.div<{ $selected: boolean }>`
  width: 100%;
  flex-shrink: 0;
  border-radius: 20px;
  background: #ffffff;
  overflow: hidden;
  box-shadow: inset 0 0 0 ${({ $selected }) => ($selected ? "2px" : "1px")}
    ${({ $selected }) => ($selected ? "#5e92f0" : "rgba(14, 77, 157, 0.08)")};
  transition:
    box-shadow 0.18s ease,
    transform 0.18s ease;
  padding: 20px;
`;

const BusCardButton = styled.button`
  width: 100%;
  border: 0;
  background: transparent;
  //padding: 20px 20px 12px;
  box-sizing: border-box;
  text-align: left;
  cursor: pointer;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  &:active {
    transform: scale(0.99);
  }
`;

const BusCardButtonInnerWrapper = styled.div`
  width: 100%;
`;

const RouteDescription = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #0e4d9d;
  word-break: keep-all;
`;

const BusMainRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 4px;
`;

const ArrivalInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ArrivalWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 32px;
  min-width: 0;
`;

const ArrivalTime = styled.span`
  font-weight: 500;
  font-size: 15px;
  line-height: 1.2;
  color: #202020;
  white-space: nowrap;
`;

const StatusBadge = styled.span`
  font-size: 12px;
  color: #666666;
  font-weight: 400;
  border-radius: 2px;
  border: 0.5px solid #cecece;
  padding: 2px 4px;
  word-break: keep-all;
  min-width: 0;
`;

const ChevronIcon = styled.span<{ $selected: boolean }>`
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ $selected }) => ($selected ? "#5e92f0" : "#8ca0bb")};
`;

const StatusText = styled.span<{ $status?: string }>`
  color: ${({ $status }) => {
    switch ($status) {
      case "여유":
        return "#006f1e";
      case "보통":
        return "#0e4d9d";
      case "혼잡":
        return "#d10000";
      default:
        return "inherit";
    }
  }};
`;

const LastBus = styled.span`
  font-weight: 500;
  color: #d10000;
`;

const SkeletonCard = styled.div`
  border-radius: 20px;
  background: #ffffff;
  flex-shrink: 0;
  padding: 20px;
  box-sizing: border-box;
  box-shadow: inset 0 0 0 1px rgba(14, 77, 157, 0.08);
`;

const SkeletonMainRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 4px;
`;

const SkeletonInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 32px;
`;

const EmptyPanelMessage = styled.div`
  height: 100%;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #6c819d;
  font-size: 14px;
  line-height: 1.6;
  word-break: keep-all;
`;
