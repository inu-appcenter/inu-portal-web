import React from "react";
import styled from "styled-components";
import Tab from "@/components/mobile/map/Tab.tsx";
import PlaceList from "./PlaceList";
import SchoolInfoBox from "@/components/mobile/map/SchoolInfoBox";
import RestInfoBox from "@/components/mobile/map/RestInfoBox";
import CafeInfoBox from "@/components/mobile/map/CafeInfoBox";
import RestaurantInfoBox from "@/components/mobile/map/RestaurantInfoBox";
import { cafePlaces, places, restaurantPlaces, restPlaces } from "../DB.tsx";
import { Drawer } from "vaul";
import { setZoom } from "../utils/mapUtils.ts";
import { BOTTOM_SHEET_HEIGHT, TabType } from "../constants/mapConfig";

interface PlaceListPanelProps {
  isOpen: boolean;
  selectedTab: TabType;
  setSelectedTab: React.Dispatch<React.SetStateAction<TabType>>;
  map: any;
  setSelectedCoord: (coord: { X: number; Y: number }) => void;
  openedMarkerId: string | null;
  setOpenedMarkerId: (id: string | null) => void;
  snap: string | number | null;
  setSnap: (snap: string | number | null) => void;
  setIsTracking?: (isTracking: boolean) => void;
}

const PlaceListPanel = ({
  isOpen,
  selectedTab,
  setSelectedTab,
  map,
  setSelectedCoord,
  openedMarkerId,
  setOpenedMarkerId,
  snap,
  setSnap,
  setIsTracking,
}: PlaceListPanelProps) => {
  const currentTab = selectedTab;

  const handleTabClick = (tab: TabType) => {
    setSelectedTab(tab);
    setOpenedMarkerId(null);

    // 탭 클릭 시 현위치 트래킹 해제
    if (setIsTracking) {
      setIsTracking(false);
    }

    // 탭 클릭 시 기본 높이로 바텀시트 올림
    setSnap(BOTTOM_SHEET_HEIGHT.DEFAULT);

    // 학교 원본 위치로 좌표 상태 업데이트
    setSelectedCoord({ X: 37.374474020920864, Y: 126.63361466845616 });

    if (map) {
      setZoom(map, 4);
    }
  };

  const getPlacesData = () => {
    switch (currentTab) {
      case "학교":
        return places;
      case "휴게실":
        return restPlaces;
      case "카페":
        return cafePlaces;
      case "식당":
        return restaurantPlaces;
      default:
        return [];
    }
  };

  return (
    <Drawer.Root
      open={isOpen}
      dismissible={false}
      modal={false}
      snapPoints={[
        BOTTOM_SHEET_HEIGHT.MIN,
        BOTTOM_SHEET_HEIGHT.DEFAULT,
        BOTTOM_SHEET_HEIGHT.MAX,
      ]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <Drawer.Portal>
        <DrawerOverlay />
        <DrawerContent>
          <HandleWrapper>
            <div
              style={{
                width: "40px",
                height: "4px",
                background: "#E5E5E5",
                borderRadius: "2px",
              }}
            />
          </HandleWrapper>
          <PlaceListPanelWrapper>
            <Tab handleTabClick={handleTabClick} selectedTab={selectedTab} />
            <div
              style={{
                flex: 1,
                overflow: "hidden",
                display: "flex",
                // 현재 snap 포인트 높이에서 탭과 핸들 높이(약 100px)를 뺀 만큼만 높이 할당
                maxHeight:
                  typeof snap === "number"
                    ? `calc(${snap * 100}dvh - 100px)`
                    : "none",
                transition: "max-height 0.5s cubic-bezier(0.32, 0.72, 0, 1)", // vaul의 기본 애니메이션과 맞춤
              }}
            >
              <PlaceList
                places={getPlacesData()}
                map={map}
                selectedTab={currentTab}
                setSelectedCoord={setSelectedCoord}
                openedMarkerId={openedMarkerId}
                setOpenedMarkerId={setOpenedMarkerId}
                setSnap={setSnap}
                setIsTracking={setIsTracking}
                renderDetail={(place) => {
                  switch (currentTab) {
                    case "학교":
                      return <SchoolInfoBox place={place} />;
                    case "휴게실":
                      return (
                        <>
                          <RestInfoBox
                            title="여성용품 배치"
                            isExist={place.restareaInfo?.hasFemaleProducts}
                          />
                          <RestInfoBox
                            title="침대, 빈백(개)"
                            num={place.restareaInfo?.bedCount}
                          />
                          <RestInfoBox
                            title="샤워실"
                            isExist={place.restareaInfo?.hasShowerRoom}
                          />
                        </>
                      );
                    case "카페":
                      return <CafeInfoBox place={place} />;
                    case "식당":
                      return <RestaurantInfoBox place={place} />;
                  }
                }}
              />
            </div>
          </PlaceListPanelWrapper>
        </DrawerContent>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default PlaceListPanel;

const DrawerOverlay = styled(Drawer.Overlay)`
  position: fixed;
  inset: 0;
`;

const DrawerContent = styled(Drawer.Content)`
  background-color: white;
  display: flex;
  flex-direction: column;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  height: 100%;
  max-height: 96%; // 상단 약간의 여백
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  outline: none;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 768px;
  margin-left: auto;
  margin-right: auto;
`;

const HandleWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  flex-shrink: 0;
`;

const PlaceListPanelWrapper = styled.div`
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden; // 내부 스크롤을 위해
`;
