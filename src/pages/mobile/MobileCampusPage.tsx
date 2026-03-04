import styled from "styled-components";
import Map from "@/components/map/components/KakaoMap";
import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import PlaceListPanel from "@/components/map/components/PlaceListPanel";
import { TabType } from "@/components/map/constants/mapConfig";
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
  const [snap, setSnap] = useState<string | number | null>(0.4); // 0.45 -> 0.4

  // 현재 선택된 장소의 원본 좌표 (보정 전)
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
      // 핀 클릭 시 바텀시트를 목록이 보이는 높이로 올림
      setSnap(0.4); // 0.45 -> 0.4
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

      // 페이지 진입 시 바디 스크롤 방지
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    }
  }, [isCampus]);

  // 바텀시트 높이에 따른 지도 중심점 보정값 계산
  // 바텀시트 가용 영역(1 - snap)의 중앙에 마커를 위치시키기 위해
  // 지도 중심을 아래(남쪽, -)로 밀어 올림
  const offset = useMemo(() => {
    const currentSnap = typeof snap === "number" ? snap : 0.4;
    // snap이 0.4(40%)일 때, 화면의 20%만큼 지도를 아래로 내려서
    // 마커가 상단 60% 영역의 중앙(상단에서 30% 지점)에 오게 함
    return currentSnap * 0.0022;
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
          setOpenedMarkerId={handleMarkerClick} // 수정
        />
      </MapWrapper>

      <PlaceListPanel
        isOpen={isCampus}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        map={map}
        viewXY={selectedCoord}
        setSelectedCoord={setSelectedCoord}
        openedMarkerId={openedMarkerId} // 추가
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
  height: calc(
    100dvh - 100px
  ); // SubLayout의 paddingTop(100px)을 고려한 고정 높이
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
