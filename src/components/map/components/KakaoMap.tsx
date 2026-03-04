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
    if (!navigator.geolocation) {
      console.error("이 브라우저에서는 위치 서비스를 지원하지 않습니다.");
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    // 초기 위치를 즉시 한 번 가져오기
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMyLocation({ lat: latitude, lng: longitude });
      },
      (err) => {
        console.error("초기 위치 가져오기 실패:", err.message);
      },
      options
    );

    // 지속적인 위치 변화 감지
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMyLocation({ lat: latitude, lng: longitude });
        
        if (isTracking && mapInstance) {
          mapInstance.panTo(new window.kakao.maps.LatLng(latitude, longitude));
        }
      },
      (err) => {
        let errorMsg = "위치 정보를 가져올 수 없습니다.";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = "위치 권한이 거부되었습니다. 설정에서 허용해주세요.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = "위치 정보를 사용할 수 없습니다 (GPS 신호 약함).";
            break;
          case err.TIMEOUT:
            errorMsg = "위치 요청 시간이 초과되었습니다.";
            break;
        }
        console.error(errorMsg);
      },
      options
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
const handleMyLocationClick = async () => {
  // iOS 13+ 방향 센서 권한 요청
  if (
    typeof (DeviceOrientationEvent as any).requestPermission === "function"
  ) {
    try {
      const permission = await (
        DeviceOrientationEvent as any
      ).requestPermission();
      if (permission !== "granted") {
        console.warn("방향 센서 권한이 거부되었습니다.");
      }
    } catch (error) {
      console.error("방향 센서 권한 요청 중 오류 발생:", error);
    }
  }

  if (!myLocation) {
    alert("위치 정보를 불러오는 중입니다...");
    return;
  }

  if (mapInstance) {
    mapInstance.panTo(
      new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng),
    );
    mapInstance.setLevel(3);
  }
  setIsTracking(true);
};

  // 지도 드래그 시 추적 모드 해제
  const handleDragStart = () => {
    if (isTracking) setIsTracking(false);
  };

  // 3. 외부 viewXY 변경 감지 및 지도 이동
  useEffect(() => {
    if (mapInstance && viewXY) {
      mapInstance.panTo(new window.kakao.maps.LatLng(viewXY.X, viewXY.Y));
    }
  }, [viewXY, mapInstance]);

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
                onClick={(marker) => {
                  const latLng = marker.getPosition();
                  mapInstance?.panTo(latLng);
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
  /* 마커가 좌표의 정확히 위에 오도록 앵커 포인트 조정 */
  transform: translate(-50%, -50%); 
`;

const MainDot = styled.div`
  width: 14px;
  height: 14px;
  background: #FF4B4B;
  border: 2px solid white;
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 0 5px rgba(0,0,0,0.3);
  position: relative;
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
  bottom: 50%; // 원의 중심에서 시작
  left: 50%;
  width: 100px; // 더 긴 도달 거리
  height: 100px;
  background: radial-gradient(circle at 50% 100%, rgba(255, 75, 75, 0.4) 0%, rgba(255, 75, 75, 0) 70%);
  clip-path: polygon(50% 100%, 15% 0%, 85% 0%); // 더 좁고 선명한 부채꼴
  z-index: 0;
  transform-origin: 50% 100%; // 부채꼴의 하단 중앙(원의 중심)을 기준으로 회전
  margin-left: -50px; // 가로 중앙 정렬
  pointer-events: none;
`;
