import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";

import { postApiLogs } from "@/apis/members";
import Map from "@/components/map/components/KakaoMap";
import PlaceListPanel from "@/components/map/components/PlaceListPanel";
import {
  BOTTOM_SHEET_HEIGHT,
  TabType,
} from "@/components/map/constants/mapConfig";
import { useHeader } from "@/context/HeaderContext";
import { DESKTOP_MEDIA } from "@/styles/responsive";

interface XY {
  X: number;
  Y: number;
}

const SCHOOL_COORD: XY = {
  X: 37.374474020920864,
  Y: 126.63361466845616,
};

export default function MobileCampusPage() {
  const [selectedTab, setSelectedTab] = useState<TabType>("학교");
  const [map, setMap] = useState<any>(null);
  const [openedMarkerId, setOpenedMarkerId] = useState<string | null>(null);
  const [snap, setSnap] = useState<string | number | null>(
    BOTTOM_SHEET_HEIGHT.DEFAULT,
  );
  const [isTracking, setIsTracking] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(DESKTOP_MEDIA).matches
      : false,
  );
  const [selectedCoord, setSelectedCoord] = useState<XY>(SCHOOL_COORD);

  const location = useLocation();

  const isCampus = useMemo(
    () => location.pathname.includes("/campus"),
    [location.pathname],
  );

  const handleMarkerClick = (markerId: string | null, coord?: XY) => {
    setOpenedMarkerId(markerId);

    if (!markerId) {
      return;
    }

    setSnap(BOTTOM_SHEET_HEIGHT.DEFAULT);

    if (coord) {
      setSelectedCoord(coord);
    }
  };

  useHeader(
    isCampus
      ? {
          title: "캠퍼스맵",
        }
      : undefined,
  );

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
    if (!isCampus) {
      return;
    }

    const logApi = async () => {
      await postApiLogs("/api/campusmap");
    };

    logApi();

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCampus]);

  const offset = useMemo(() => {
    if (isDesktop) {
      return 0;
    }

    const currentSnap =
      typeof snap === "number" ? snap : BOTTOM_SHEET_HEIGHT.DEFAULT;

    return currentSnap * 0.0018;
  }, [isDesktop, snap]);

  const viewXY = useMemo(
    () => ({
      X: selectedCoord.X - offset,
      Y: selectedCoord.Y,
    }),
    [selectedCoord, offset],
  );

  return (
    <MobileCampusPageWrapper>
      {isDesktop && (
        <PlaceListPanel
          isOpen={isCampus}
          isDesktop={isDesktop}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          map={map}
          setSelectedCoord={setSelectedCoord}
          openedMarkerId={openedMarkerId}
          setOpenedMarkerId={setOpenedMarkerId}
          snap={snap}
          setSnap={setSnap}
          setIsTracking={setIsTracking}
        />
      )}

      <MapWrapper>
        <Map
          selectedTab={selectedTab}
          viewXY={viewXY}
          setMap={setMap}
          setSelectedCoord={setSelectedCoord}
          openedMarkerId={openedMarkerId}
          setOpenedMarkerId={handleMarkerClick}
          offset={offset}
          isTracking={isTracking}
          setIsTracking={setIsTracking}
        />
      </MapWrapper>

      {!isDesktop && (
        <PlaceListPanel
          isOpen={isCampus}
          isDesktop={isDesktop}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          map={map}
          setSelectedCoord={setSelectedCoord}
          openedMarkerId={openedMarkerId}
          setOpenedMarkerId={setOpenedMarkerId}
          snap={snap}
          setSnap={setSnap}
          setIsTracking={setIsTracking}
        />
      )}
    </MobileCampusPageWrapper>
  );
}

const MobileCampusPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100dvh - 100px);
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  @media ${DESKTOP_MEDIA} {
    display: grid;
    grid-template-columns: clamp(340px, 27vw, 400px) minmax(0, 1fr);
    gap: 20px;
    height: calc(100dvh - 140px);
    min-height: 720px;
    padding-bottom: 12px;
    overflow: visible;
  }
`;

const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
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
