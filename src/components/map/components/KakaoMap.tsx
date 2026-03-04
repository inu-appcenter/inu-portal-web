import React, { useMemo, useState, useEffect } from "react";
import { Map, MapTypeControl, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";
import styled from "styled-components";
import { Navigation } from "lucide-react"; // 내 위치 아이콘용
import { cafePlaces, places, restaurantPlaces, restPlaces } from "../DB";
import { MAP_TAB_CONFIG, TabType } from "../constants/mapConfig";

interface Props {
  selectedTab: string;
  viewXY: { X: number; Y: number };
  setMap: any;
  openedMarkerId: string | null;
  setOpenedMarkerId: (id: string | null) => void;
}

const KakaoMap = ({
  selectedTab,
  viewXY,
  setMap,
  openedMarkerId,
  setOpenedMarkerId,
}: Props) => {
  const [mapInstance, setInternalMap] = useState<kakao.maps.Map | null>(null);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const currentTab = selectedTab as TabType;
  const config = MAP_TAB_CONFIG[currentTab];

  // 1. 실시간 위치 추적
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMyLocation({ lat: latitude, lng: longitude });
        
        // 추적 모드일 경우 지도 중심 이동
        if (isTracking && mapInstance) {
          mapInstance.panTo(new window.kakao.maps.LatLng(latitude, longitude));
        }
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isTracking, mapInstance]);

  // 2. 기기 방향(Heading) 감지
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // @ts-ignore (webkitCompassHeading은 iOS 전용)
      const compass = e.webkitCompassHeading || (360 - (e.alpha || 0));
      if (compass) setHeading(compass);
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  const handleMyLocationClick = () => {
    if (!myLocation) {
      alert("위치 정보를 불러오는 중입니다...");
      return;
    }
    
    if (mapInstance) {
      mapInstance.panTo(new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng));
      mapInstance.setLevel(3);
    }
    setIsTracking(true);
  };

  // 지도 드래그 시 추적 모드 해제
  const handleDragStart = () => {
    if (isTracking) setIsTracking(false);
  };

  const placesToRender = useMemo(() => {
    switch (currentTab) {
      case "학교": return places;
      case "휴게실": return restPlaces;
      case "카페": return cafePlaces;
      case "식당": return restaurantPlaces;
      default: return [];
    }
  }, [currentTab]);

  return (
    <Container>
      <Map
        center={{ lat: viewXY.X, lng: viewXY.Y }}
        level={4}
        style={{ width: "100%", height: "100%" }}
        onCreate={(map) => {
          setMap(map);
          setInternalMap(map);
          setTimeout(() => map.relayout(), 100);
        }}
        onDragStart={handleDragStart}
      >
        {/* 기존 장소 마커들 */}
        {placesToRender.map((place) => {
          const markerId = config.getMarkerId(place);
          const isOpen = openedMarkerId === markerId;

          return (
            <React.Fragment key={markerId}>
              <MapMarker
                position={{ lat: Number(place.latitude), lng: Number(place.longitude) }}
                image={{
                  src: config.getIcon(place),
                  size: { width: 24, height: 35 },
                }}
                onClick={() => {
                  setOpenedMarkerId(isOpen ? null : markerId);
                  setIsTracking(false); // 장소 클릭 시 위치 추적 일시 중지
                }}
                infoWindowOptions={{ removable: true }}
              >
                {isOpen && (
                  <div
                    style={{ cursor: "default", padding: "5px", color: "#000" }}
                    dangerouslySetInnerHTML={{ __html: config.getInfoWindowHtml(place) }}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </MapMarker>
            </React.Fragment>
          );
        })}

        {/* 내 위치 마커 (빨간색 원 + 방향 표시) */}
        {myLocation && (
          <CustomOverlayMap position={myLocation} zIndex={10}>
            <MyLocationMarker>
              {heading !== null && (
                <DirectionShadow style={{ transform: `rotate(${heading}deg)` }} />
              )}
              <PulseDot />
              <MainDot />
            </MyLocationMarker>
          </CustomOverlayMap>
        )}

        {window.kakao?.maps && (
          <MapTypeControl position={window.kakao.maps.ControlPosition.TOPRIGHT} />
        )}
      </Map>

      {/* 내 위치 이동 버튼 */}
      <MyLocationButton onClick={handleMyLocationClick} $active={isTracking}>
        <Navigation size={20} fill={isTracking ? "#3E69D1" : "none"} />
      </MyLocationButton>
    </Container>
  );
};

export default KakaoMap;

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const MyLocationButton = styled.button<{ $active: boolean }>`
  position: absolute;
  top: 60px; // 지도 타입 컨트롤 아래 배치
  right: 10px;
  z-index: 10;
  width: 36px;
  height: 36px;
  background: white;
  border: 1px solid #919191;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  color: ${props => props.$active ? "#3E69D1" : "#555"};
  
  &:active {
    background: #f5f5f5;
  }
`;

const MyLocationMarker = styled.div`
  position: relative;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MainDot = styled.div`
  width: 14px;
  height: 14px;
  background: #FF4B4B; // 빨간색 포인트
  border: 2px solid white;
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 0 5px rgba(0,0,0,0.3);
`;

const PulseDot = styled.div`
  position: absolute;
  width: 30px;
  height: 30px;
  background: rgba(255, 75, 75, 0.2);
  border-radius: 50%;
  z-index: 1;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% { transform: scale(0.5); opacity: 1; }
    100% { transform: scale(1.5); opacity: 0; }
  }
`;

const DirectionShadow = styled.div`
  position: absolute;
  top: -20px;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle at 50% 100%, rgba(255, 75, 75, 0.3) 0%, rgba(255, 75, 75, 0) 70%);
  clip-path: polygon(50% 100%, 20% 0%, 80% 0%); // 부채꼴 모양
  z-index: 0;
  transform-origin: 50% 100%;
`;
