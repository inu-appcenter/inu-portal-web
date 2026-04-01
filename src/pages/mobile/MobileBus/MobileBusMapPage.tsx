import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { postApiLogs } from "@/apis/members";
import BusUiWelcomeModal from "@/components/mobile/bus/BusUiWelcomeModal";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import BusInteractiveMap from "@/components/mobile/bus/map/BusInteractiveMap";
import BusMapPanel from "@/components/mobile/bus/map/BusMapPanel";
import BusStopSwitcher from "@/components/mobile/bus/map/BusStopSwitcher";
import { BUS_MAP_BOTTOM_SHEET_HEIGHT } from "@/components/mobile/bus/map/busMapSheetConfig";
import {
  BUS_MAP_FALLBACK_COORD,
  getBusMapPageConfig,
  getBusMapStopById,
  getBusMapStops,
  getBusMapTabs,
} from "@/components/mobile/bus/data/busMapConfig";
import { MenuItemType, useHeader } from "@/context/HeaderContext";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import {
  buildBusUiRoute,
  getStoredBusUiVersion,
  hasSeenBusUiWelcomeModal,
  isSwitchableBusInfoType,
  markBusUiWelcomeModalSeen,
  setStoredBusUiVersion,
} from "@/utils/busUiPreference";

const MOBILE_MAP_HEADER_HEIGHT = 100;
const MOBILE_SUBHEADER_OFFSET = 50;
const MOBILE_FULL_HEADER_OFFSET =
  MOBILE_MAP_HEADER_HEIGHT + MOBILE_SUBHEADER_OFFSET;
const MOBILE_HEADER_SAFE_TOP = 16;
const MOBILE_HEADER_OVERLAY_OFFSET =
  MOBILE_FULL_HEADER_OFFSET - MOBILE_HEADER_SAFE_TOP;
const MOBILE_ROUTE_TOP_PADDING = 130;

const STOP_SWITCHER_LABELS: Record<string, string> = {
  "go-school-INU2": "2번 출구",
  "go-school-INU1": "1번 출구",
  "go-school-BIT3": "3번 출구",
  "go-home-main-out": "정문(길 건너)",
  "go-home-main-in": "정문(앞)",
  "go-home-science": "자연대",
  "go-home-engineering": "공과대",
  "go-home-dorm": "기숙사",
};

export default function MobileBusMapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const type = searchParams.get("type");
  const requestedCategory = searchParams.get("category");

  const pageConfig = useMemo(() => getBusMapPageConfig(type), [type]);
  const tabs = useMemo(() => getBusMapTabs(type), [type]);
  const defaultCategory = tabs[0]?.label ?? "";
  const selectedCategory = tabs.some((tab) => tab.label === requestedCategory)
    ? (requestedCategory ?? defaultCategory)
    : defaultCategory;
  const shouldUseLegacyUi =
    isSwitchableBusInfoType(type) && getStoredBusUiVersion() === "legacy";
  const redirectTarget = shouldUseLegacyUi
    ? buildBusUiRoute({
        type,
        category: selectedCategory,
        version: "legacy",
      })
    : null;
  const activeTab =
    tabs.find((tab) => tab.label === selectedCategory) ?? tabs[0] ?? null;
  const allStopIds = useMemo(
    () => Array.from(new Set(tabs.flatMap((tab) => tab.stopIds))),
    [tabs],
  );
  const visibleStops = useMemo(() => getBusMapStops(allStopIds), [allStopIds]);
  const activeStops = useMemo(
    () => getBusMapStops(activeTab?.stopIds ?? []),
    [activeTab],
  );
  const defaultStop = useMemo(
    () => getBusMapStopById(activeTab?.defaultStopId ?? null),
    [activeTab],
  );

  const [selectedStopId, setSelectedStopId] = useState<string | null>(
    defaultStop?.id ?? null,
  );
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);
  const [snap, setSnap] = useState<string | number | null>(
    BUS_MAP_BOTTOM_SHEET_HEIGHT.DEFAULT,
  );
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(DESKTOP_MEDIA).matches
      : false,
  );
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  const selectedStop =
    visibleStops.find((stop) => stop.id === selectedStopId) ??
    defaultStop ??
    activeStops[0] ??
    visibleStops[0] ??
    null;
  const stopSwitcherOptions = useMemo(
    () =>
      activeStops.map((stop) => ({
        id: stop.id,
        label: STOP_SWITCHER_LABELS[stop.id] ?? stop.stopName,
      })),
    [activeStops],
  );
  const selectedBus =
    selectedStop?.buses.find((bus) => bus.id === selectedBusId) ?? null;

  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={tabs.map((tab) => tab.label)}
        selectedCategory={selectedCategory}
      />
    ),
    [selectedCategory, tabs],
  );

  const menuItems = useMemo<MenuItemType[] | undefined>(() => {
    if (!isSwitchableBusInfoType(type)) {
      return undefined;
    }

    return [
      {
        label: "구버전으로 돌아가기",
        onClick: () => {
          setStoredBusUiVersion("legacy");
          navigate(
            buildBusUiRoute({
              type,
              category: selectedCategory,
              version: "legacy",
            }),
            { replace: true },
          );
        },
      },
    ];
  }, [navigate, selectedCategory, type]);

  useHeader({
    title: pageConfig?.title ?? "버스 지도",
    subHeader: pageConfig ? subHeader : null,
    menuItems,
    floatingSubHeader: true,
  });

  useEffect(() => {
    if (redirectTarget) {
      navigate(redirectTarget, { replace: true });
      return;
    }

    return undefined;
  }, [navigate, redirectTarget]);

  useEffect(() => {
    if (redirectTarget || !isSwitchableBusInfoType(type)) {
      return;
    }

    if (hasSeenBusUiWelcomeModal()) {
      return;
    }

    markBusUiWelcomeModalSeen();
    setIsWelcomeModalOpen(true);
  }, [redirectTarget, type]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA);
    const updateDesktopState = (matches: boolean) => {
      setIsDesktop(matches);
    };

    updateDesktopState(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      updateDesktopState(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (redirectTarget || !pageConfig || !type) {
      return;
    }

    const logApi = async () => {
      await postApiLogs(`/api/buses/${type}/map`);
    };

    void logApi();
  }, [pageConfig, redirectTarget, type]);

  useEffect(() => {
    const isSelectedStopVisible = activeStops.some(
      (stop) => stop.id === selectedStopId,
    );

    if (!isSelectedStopVisible) {
      setSelectedStopId(defaultStop?.id ?? activeStops[0]?.id ?? null);
    }
    setSelectedBusId(null);
    setSnap(BUS_MAP_BOTTOM_SHEET_HEIGHT.DEFAULT);
  }, [activeStops, defaultStop?.id, selectedCategory, selectedStopId]);

  useLayoutEffect(() => {
    if (redirectTarget || !pageConfig || typeof window === "undefined") {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const previousStyles = {
      htmlOverflow: html.style.overflow,
      htmlOverscrollBehavior: html.style.overscrollBehavior,
      htmlHeight: html.style.height,
      bodyOverflow: body.style.overflow,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyHeight: body.style.height,
    };

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    html.style.height = "100%";

    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.height = "100%";

    return () => {
      html.style.overflow = previousStyles.htmlOverflow;
      html.style.overscrollBehavior = previousStyles.htmlOverscrollBehavior;
      html.style.height = previousStyles.htmlHeight;

      body.style.overflow = previousStyles.bodyOverflow;
      body.style.overscrollBehavior = previousStyles.bodyOverscrollBehavior;
      body.style.position = previousStyles.bodyPosition;
      body.style.top = previousStyles.bodyTop;
      body.style.left = previousStyles.bodyLeft;
      body.style.right = previousStyles.bodyRight;
      body.style.width = previousStyles.bodyWidth;
      body.style.height = previousStyles.bodyHeight;

      window.scrollTo(0, scrollY);
    };
  }, [pageConfig, redirectTarget]);

  const center = useMemo(() => {
    if (!selectedStop) {
      return BUS_MAP_FALLBACK_COORD;
    }

    return {
      lat: selectedStop.lat,
      lng: selectedStop.lng,
    };
  }, [selectedStop]);

  const routeViewportPadding = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        top: 40,
        right: 28,
        bottom: 180,
        left: 28,
      };
    }

    if (isDesktop) {
      return {
        top: 52,
        right: 52,
        bottom: 52,
        left: 52,
      };
    }

    const activeSnap =
      typeof snap === "number" ? snap : BUS_MAP_BOTTOM_SHEET_HEIGHT.DEFAULT;
    const mapHeight = Math.max(window.innerHeight, 320);
    const bottomPadding = Math.round(
      Math.min(
        mapHeight * 0.62,
        Math.max(84, mapHeight * (0.16 + activeSnap * 0.46)),
      ),
    );

    return {
      top: MOBILE_ROUTE_TOP_PADDING,
      right: 28,
      bottom: bottomPadding,
      left: 28,
    };
  }, [isDesktop, snap]);

  const handleSelectStop = (stopId: string) => {
    const nextTab = tabs.find((tab) => tab.stopIds.includes(stopId));

    if (nextTab && nextTab.label !== selectedCategory) {
      const params = new URLSearchParams(location.search);
      params.set("category", nextTab.label);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }

    setSelectedStopId(stopId);
    setSelectedBusId(null);
  };

  const handleSelectBus = (busId: number) => {
    setSelectedBusId((prev) => (prev === busId ? null : busId));
    setSnap(BUS_MAP_BOTTOM_SHEET_HEIGHT.DEFAULT);
  };

  if (redirectTarget) {
    return null;
  }

  if (!pageConfig || !selectedStop) {
    return (
      <FallbackWrapper>
        <FallbackCard>
          신버전 지도 UI는 학교 갈래요와 집 갈래요에서 먼저 제공돼요.
        </FallbackCard>
      </FallbackWrapper>
    );
  }

  return (
    <>
      <PageWrapper>
        {isDesktop ? (
          <BusMapPanel
            key={selectedCategory}
            isDesktop
            selectedStop={selectedStop}
            selectedBusId={selectedBusId}
            onSelectBus={handleSelectBus}
            snap={snap}
            setSnap={setSnap}
          />
        ) : null}

        <MapArea>
          {isDesktop ? (
            <DesktopStopSwitcherDock>
              <BusStopSwitcher
                options={stopSwitcherOptions}
                selectedStopId={selectedStop.id}
                onSelectStop={handleSelectStop}
              />
            </DesktopStopSwitcherDock>
          ) : null}

          <BusInteractiveMap
            activeStops={visibleStops}
            selectedStopId={selectedStop.id}
            selectedBus={selectedBus}
            center={center}
            routeViewportPadding={routeViewportPadding}
            onSelectStop={handleSelectStop}
          />
        </MapArea>

        {!isDesktop ? (
          <BusMapPanel
            key={selectedCategory}
            selectedStop={selectedStop}
            selectedBusId={selectedBusId}
            onSelectBus={handleSelectBus}
            stopOptions={stopSwitcherOptions}
            selectedStopId={selectedStop.id}
            onSelectStop={handleSelectStop}
            snap={snap}
            setSnap={setSnap}
          />
        ) : null}
      </PageWrapper>

      <BusUiWelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
      />
    </>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100dvh - ${MOBILE_HEADER_SAFE_TOP}px);
  margin-top: -${MOBILE_HEADER_OVERLAY_OFFSET}px;
  position: relative;
  overflow: hidden;

  @media ${DESKTOP_MEDIA} {
    display: grid;
    grid-template-columns: clamp(340px, 28vw, 410px) minmax(0, 1fr);
    gap: 20px;
    min-height: 720px;
    height: calc(100dvh - 150px);
    margin-top: 0;
    padding-bottom: 12px;
    overflow: visible;
  }
`;

const MapArea = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;

  @media ${DESKTOP_MEDIA} {
    position: relative;
    min-width: 0;
    border-radius: 28px;
    overflow: hidden;
    background: #ffffff;
    box-shadow:
      0 20px 40px rgba(35, 60, 115, 0.08),
      0 4px 12px rgba(35, 60, 115, 0.06);
    border: 1px solid rgba(64, 113, 185, 0.1);
  }
`;

const DesktopStopSwitcherDock = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 2;
  display: flex;
  max-width: min(calc(100% - 40px), 420px);
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
`;

const FallbackWrapper = styled.div`
  padding: 0 16px;
  box-sizing: border-box;
`;

const FallbackCard = styled.div`
  width: 100%;
  padding: 20px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 12px 24px rgba(20, 35, 67, 0.08);
  color: #35506d;
  font-size: 14px;
  line-height: 1.6;
  word-break: keep-all;
`;
