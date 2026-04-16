import React from "react";
import styled from "styled-components";
import { Drawer } from "vaul";

import Tab from "@/components/mobile/map/Tab.tsx";
import SchoolInfoBox from "@/components/mobile/map/SchoolInfoBox";
import RestInfoBox from "@/components/mobile/map/RestInfoBox";
import CafeInfoBox from "@/components/mobile/map/CafeInfoBox";
import RestaurantInfoBox from "@/components/mobile/map/RestaurantInfoBox";

import PlaceList from "./PlaceList";
import { cafePlaces, places, restaurantPlaces, restPlaces } from "../DB.tsx";
import { setZoom } from "../utils/mapUtils.ts";
import { BOTTOM_SHEET_HEIGHT, TabType } from "../constants/mapConfig";

interface PlaceListPanelProps {
  isOpen: boolean;
  isDesktop?: boolean;
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
  isDesktop = false,
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
  const handleTabClick = (tab: TabType) => {
    setSelectedTab(tab);
    setOpenedMarkerId(null);

    if (setIsTracking) {
      setIsTracking(false);
    }

    setSnap(BOTTOM_SHEET_HEIGHT.DEFAULT);
    setSelectedCoord({ X: 37.374474020920864, Y: 126.63361466845616 });

    if (map) {
      setZoom(map, 4);
    }
  };

  const getPlacesData = () => {
    switch (selectedTab) {
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

  const renderDetail = (place: (typeof places)[number]) => {
    switch (selectedTab) {
      case "학교":
        return <SchoolInfoBox place={place} />;
      case "휴게실":
        return (
          <>
            <RestInfoBox
              title="여성용품 비치"
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
      default:
        return null;
    }
  };

  const panelContent = (
    <PanelSurface $isDesktop={isDesktop}>
      <PlaceListPanelWrapper $isDesktop={isDesktop}>
        {!isDesktop && (
          <DragHeader>
            <HandleWrapper>
              <HandleBar />
            </HandleWrapper>
            <Tab handleTabClick={handleTabClick} selectedTab={selectedTab} />
          </DragHeader>
        )}

        {isDesktop && (
          <>
            <DesktopPanelHeader>
              <DesktopPanelEyebrow>Campus Map</DesktopPanelEyebrow>
              <DesktopPanelTitle>장소 정보</DesktopPanelTitle>
            </DesktopPanelHeader>
            <Tab handleTabClick={handleTabClick} selectedTab={selectedTab} />
          </>
        )}

        <ListViewport
          $isDesktop={isDesktop}
          $snap={snap}
          data-vaul-no-drag={isDesktop ? undefined : ""}
        >
          <PlaceList
            places={getPlacesData()}
            map={map}
            snap={snap}
            selectedTab={selectedTab}
            setSelectedCoord={setSelectedCoord}
            openedMarkerId={openedMarkerId}
            setOpenedMarkerId={setOpenedMarkerId}
            setSnap={setSnap}
            setIsTracking={setIsTracking}
            renderDetail={renderDetail}
          />
        </ListViewport>
      </PlaceListPanelWrapper>
    </PanelSurface>
  );

  if (isDesktop) {
    return <DesktopPanelShell>{panelContent}</DesktopPanelShell>;
  }

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
        <DrawerContent>{panelContent}</DrawerContent>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default PlaceListPanel;

const DesktopPanelShell = styled.aside`
  min-width: 0;
  height: 100%;
  min-height: 0;
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
      `
      : `
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
      `}
`;

const DrawerOverlay = styled(Drawer.Overlay)`
  position: fixed;
  inset: 0;
`;

const DrawerContent = styled(Drawer.Content)`
  height: 100%;
  max-height: 96%;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  outline: none;
  z-index: 1000;
  margin-left: auto;
  margin-right: auto;
`;

const DragHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 10px;
`;

const HandleWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  flex-shrink: 0;
`;

const HandleBar = styled.div`
  width: 40px;
  height: 4px;
  background: #e5e5e5;
  border-radius: 999px;
`;

const PlaceListPanelWrapper = styled.div<{ $isDesktop: boolean }>`
  width: 100%;
  padding: ${({ $isDesktop }) => ($isDesktop ? "24px 24px 20px" : "0 16px")};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const DesktopPanelHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
`;

const DesktopPanelEyebrow = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7d94bb;
`;

const DesktopPanelTitle = styled.h2`
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  color: #20355d;
`;

const ListViewport = styled.div<{
  $isDesktop: boolean;
  $snap: string | number | null;
}>`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  margin-top: ${({ $isDesktop }) => ($isDesktop ? "8px" : "0")};
  max-height: ${({ $isDesktop, $snap }) =>
    $isDesktop
      ? "none"
      : typeof $snap === "number"
        ? `calc(${$snap * 100}dvh - 100px)`
        : "none"};
  transition: ${({ $isDesktop }) =>
    $isDesktop ? "none" : "max-height 0.5s cubic-bezier(0.32, 0.72, 0, 1)"};
`;
