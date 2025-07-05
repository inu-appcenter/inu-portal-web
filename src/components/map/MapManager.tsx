import styled from "styled-components";
import Map from "components/map/components/KakaoMap.tsx";
import { useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import PlaceListPanel from "./components/PlaceListPanel.tsx";
import { deleteMarkers } from "components/map/utils/markerUtils.ts";

interface XY {
  X: number;
  Y: number;
}

let markers: any[] = []; // any 타입 명시

export default function MapManager() {
  const [selectedTab, setSelectedTab] = useState<string>("학교");
  const [map, setMap] = useState<any>(null);

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
          setSelectedTab={setSelectedTab}
          viewXY={viewXY}
          map={map}
          setMap={setMap}
          markers={markers}
          deleteMarkers={deleteMarkers}
        />
      </MapWrapper>

      {/* 바텀시트 장소목록 */}
      <PlaceListPanel
        isOpen={isOpen}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        map={map}
        markers={markers}
        viewXY={viewXY}
      />
    </>
  );
}

const MapWrapper = styled.div`
  height: 70dvh;
  width: 100%;
`;
