import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Tab from "@/components/mobile/map/Tab.tsx";
import RestroomList from "@/components/mobile/map/RestroomList.tsx";
import SchoolList from "@/components/mobile/map/SchoolList.tsx";
import CafeList from "@/components/mobile/map/CafeList.tsx";
import RestaurantList from "@/components/mobile/map/RestaurantList.tsx";
import { places, restPlaces, cafePlaces, restaurantPlaces } from "../DB.tsx";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import { closeInfoWindow } from "../utils/markerUtils.ts";
import { setZoom } from "../utils/mapUtils.ts";

interface PlaceListPanelProps {
  isOpen: boolean;
  selectedTab?: string;
  setSelectedTab?: React.Dispatch<React.SetStateAction<string>>;
  map: any;
  markers: any;
  viewXY: { X: number; Y: number };
}

const PlaceListPanel = ({
  isOpen,
  selectedTab,
  setSelectedTab,
  map,
  markers,
  viewXY,
}: PlaceListPanelProps) => {
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    const screenHeight = window.innerHeight;
    setMaxHeight(screenHeight * 0.35);
  }, []);

  const handleTabClick = (tab: string) => {
    setSelectedTab?.(tab);
    closeInfoWindow();

    const moveLatLon = new window.kakao.maps.LatLng(viewXY.X, viewXY.Y);

    // 맵의 중심을 moveLatLon 위치로 설정
    map.setCenter(moveLatLon);
    setZoom(map, 4);
  };

  const placesToRender =
    selectedTab === "학교"
      ? places
      : selectedTab === "휴게실"
        ? restPlaces
        : selectedTab === "카페"
          ? cafePlaces
          : selectedTab === "식당"
            ? restaurantPlaces
            : [];

  // URL 경로에 따라 높이 계산
  const isMobile = window.location.pathname.includes("/m");

  return (
    <BottomSheet
      open={isOpen}
      maxHeight={maxHeight}
      // snapPoints={() => {
      //   // 임의의 값으로 스냅 포인트 설정
      //   const snapPoint1 = 300; // 최소 스냅 포인트
      //   const snapPoint2 = { maxHeight }; // 중간 스냅 포인트
      //
      //   return [snapPoint1, snapPoint2]; // 임의의 값을 배열로 반환
      // }}
      blocking={false}
      onDismiss={() => {}}
    >
      <PlaceListPanelWrapper
        style={{ marginBottom: isMobile ? "50px" : "auto" }}
      >
        <Tab handleTabClick={handleTabClick} selectedTab={selectedTab} />
        {selectedTab === "학교" && (
          <SchoolList
            placesToRender={placesToRender}
            map={map}
            markers={markers}
          />
        )}
        {selectedTab === "휴게실" && (
          <RestroomList placesToRender={placesToRender} map={map} />
        )}
        {selectedTab === "카페" && (
          <CafeList placesToRender={placesToRender} map={map} />
        )}
        {selectedTab === "식당" && (
          <RestaurantList placesToRender={placesToRender} map={map} />
        )}
      </PlaceListPanelWrapper>
    </BottomSheet>
  );
};

export default PlaceListPanel;

// styled components
const PlaceListPanelWrapper = styled.div`
  width: 100%;
  padding: 0 20px 20px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
