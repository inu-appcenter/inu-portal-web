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
import { MAP_CENTER_OFFSET, TabType } from "../constants/mapConfig";

interface PlaceListPanelProps {
  isOpen: boolean;
  selectedTab: TabType;
  setSelectedTab: React.Dispatch<React.SetStateAction<TabType>>;
  map: any;
  viewXY: { X: number; Y: number };
  setOpenedMarkerId: (id: string | null) => void;
}

const PlaceListPanel = ({
  isOpen,
  selectedTab,
  setSelectedTab,
  map,
  viewXY,
  setOpenedMarkerId,
}: PlaceListPanelProps) => {
  const currentTab = selectedTab; // as TabType 제거 (이미 상단에서 정의됨)

  const handleTabClick = (tab: TabType) => {
    setSelectedTab(tab);
    setOpenedMarkerId(null);

    if (map) {
      const moveLatLon = new window.kakao.maps.LatLng(
        viewXY.X + MAP_CENTER_OFFSET,
        viewXY.Y,
      );
      map.setCenter(moveLatLon);
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
    <Drawer.Root open={isOpen} dismissible={false} modal={false}>
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
            <PlaceList
              places={getPlacesData()}
              map={map}
              selectedTab={currentTab}
              setOpenedMarkerId={setOpenedMarkerId}
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
  height: 40dvh;
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
`;
