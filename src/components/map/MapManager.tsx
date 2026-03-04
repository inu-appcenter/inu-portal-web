import styled from "styled-components";
import Map from "@/components/map/components/KakaoMap.tsx";
import { useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import PlaceListPanel from "./components/PlaceListPanel.tsx";
import { TabType } from "./constants/mapConfig";

interface XY {
  X: number;
  Y: number;
}

export default function MapManager() {
  const [selectedTab, setSelectedTab] = useState<TabType>("학교");
  const [map, setMap] = useState<any>(null);
  const [openedMarkerId, setOpenedMarkerId] = useState<string | null>(null);

  const location = useLocation();

  // 현재 경로에 "/campus"가 포함될 때만 isOpen을 true로 설정
  const isOpen = useMemo(
    () => location.pathname.includes("/campus"),
    [location.pathname],
  );

  // 캠퍼스맵 실행 시 학교 위치
  const viewXY: XY = {
    X: 37.374474020920864,
    Y: 126.63361466845616,
  };

  return (
    <>
      <MapWrapper>
        <Map
          selectedTab={selectedTab}
          viewXY={viewXY}
          setMap={setMap}
          openedMarkerId={openedMarkerId}
          setOpenedMarkerId={setOpenedMarkerId}
        />
      </MapWrapper>

      {/* 바텀시트 장소목록 */}
      <PlaceListPanel
        isOpen={isOpen}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        map={map}
        viewXY={viewXY}
        setOpenedMarkerId={setOpenedMarkerId}
      />
    </>
  );
}

const MapWrapper = styled.div`
  height: 70dvh;
  width: 100%;
  overflow: hidden;
  min-width: 0;

  @media (max-width: 768px) {
    height: 100%;
  }
`;
