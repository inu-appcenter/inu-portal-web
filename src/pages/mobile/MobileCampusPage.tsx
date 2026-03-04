import styled from "styled-components";
import Map from "@/components/map/components/KakaoMap";
import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import PlaceListPanel from "@/components/map/components/PlaceListPanel";
import {
  BOTTOM_SHEET_HEIGHT,
  TabType,
} from "@/components/map/constants/mapConfig";
import { useHeader } from "@/context/HeaderContext";
import { postApiLogs } from "@/apis/members";

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

  const [selectedCoord, setSelectedCoord] = useState<XY>(SCHOOL_COORD);

  const location = useLocation();

  const isCampus = useMemo(
    () => location.pathname.includes("/campus"),
    [location.pathname],
  );

  // 핀 클릭 핸들러
  const handleMarkerClick = (markerId: string | null) => {
    setOpenedMarkerId(markerId);
    if (markerId) {
      // 핀 클릭 시 바텀시트만 목록이 보이는 높이로 올림
      setSnap(BOTTOM_SHEET_HEIGHT.DEFAULT);
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
    if (isCampus) {
      const logApi = async () => {
        console.log("캠퍼스맵 로그");
        await postApiLogs("/api/campusmap");
      };
      logApi();

      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    }
  }, [isCampus]);

  // 바텀시트 높이에 따른 지도 중심점 보정값 계산
  const offset = useMemo(() => {
    const currentSnap =
      typeof snap === "number" ? snap : BOTTOM_SHEET_HEIGHT.DEFAULT;
    // 0.0022에서 0.0018로 하향 조정하여 마커 위치를 조금 더 아래(중앙 방향)로 내림
    return currentSnap * 0.0018;
  }, [snap]);

  // 최종적으로 지도에 전달할 중심점 (보정됨)
  const viewXY = useMemo(
    () => ({
      X: selectedCoord.X - offset,
      Y: selectedCoord.Y,
    }),
    [selectedCoord, offset],
  );

  return (
    <MobileCampusPageWrapper>
      <MapWrapper>
        <Map
          selectedTab={selectedTab}
          viewXY={viewXY}
          setMap={setMap}
          openedMarkerId={openedMarkerId}
          setOpenedMarkerId={handleMarkerClick}
        />
      </MapWrapper>

      <PlaceListPanel
        isOpen={isCampus}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        map={map}
        setSelectedCoord={setSelectedCoord}
        openedMarkerId={openedMarkerId}
        setOpenedMarkerId={setOpenedMarkerId}
        snap={snap}
        setSnap={setSnap}
        offset={offset}
      />
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
`;

const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
`;
