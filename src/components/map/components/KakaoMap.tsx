import { useMemo, useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { Navigation } from "lucide-react"; // 내 위치 아이콘용
import { cafePlaces, places, restaurantPlaces, restPlaces } from "../DB";
import { MAP_TAB_CONFIG, TabType } from "../constants/mapConfig";
import { useKakaoMapLoader } from "@/hooks/useKakaoMapLoader";

import { mixpanelTrack } from "@/utils/mixpanel";

type HeadingSource = "gps" | "compass" | null;

const GPS_HEADING_MIN_SPEED = 0.8;
const GPS_HEADING_HOLD_MS = 2500;
const GPS_HEADING_SMOOTHING = 0.35;
const COMPASS_HEADING_SMOOTHING = 0.18;

const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;

const getShortestAngleDelta = (from: number, to: number) =>
  ((to - from + 540) % 360) - 180;

const smoothHeading = (
  previous: number | null,
  next: number,
  smoothingFactor: number,
) => {
  if (previous === null) {
    return normalizeAngle(next);
  }

  return normalizeAngle(
    previous + getShortestAngleDelta(previous, next) * smoothingFactor,
  );
};

const getScreenOrientationAngle = () => {
  if (typeof window === "undefined") {
    return 0;
  }

  if (
    window.screen?.orientation &&
    typeof window.screen.orientation.angle === "number"
  ) {
    return window.screen.orientation.angle;
  }

  const legacyOrientation = (window as Window & { orientation?: number })
    .orientation;

  return typeof legacyOrientation === "number" ? legacyOrientation : 0;
};

const getCompassHeading = (event: DeviceOrientationEvent) => {
  const iosEvent = event as DeviceOrientationEvent & {
    webkitCompassHeading?: number;
  };

  if (
    typeof iosEvent.webkitCompassHeading === "number" &&
    !Number.isNaN(iosEvent.webkitCompassHeading)
  ) {
    return normalizeAngle(iosEvent.webkitCompassHeading);
  }

  if (typeof event.alpha !== "number" || Number.isNaN(event.alpha)) {
    return null;
  }

  return normalizeAngle(360 - event.alpha + getScreenOrientationAngle());
};

const getGpsHeading = (coords: GeolocationCoordinates) => {
  if (typeof coords.heading !== "number" || Number.isNaN(coords.heading)) {
    return null;
  }

  if (typeof coords.speed === "number" && coords.speed < GPS_HEADING_MIN_SPEED) {
    return null;
  }

  return normalizeAngle(coords.heading);
};

interface Props {
  selectedTab: string;
  viewXY: { X: number; Y: number };
  mapMoveTrigger: number;
  setMap: any;
  setSelectedCoord?: (coord: { X: number; Y: number }, enableOffset?: boolean) => void;
  openedMarkerId: string | null;
  setOpenedMarkerId: (id: string | null, coord?: { X: number; Y: number }) => void;
  isTracking?: boolean;
  setIsTracking?: (isTracking: boolean) => void;
}

const KakaoMap = ({
  selectedTab,
  viewXY,
  mapMoveTrigger,
  setMap,
  setSelectedCoord,
  openedMarkerId,
  setOpenedMarkerId,
  isTracking = false,
  setIsTracking,
}: Props) => {
  const { loading, error } = useKakaoMapLoader();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const [mapInstance, setInternalMap] = useState<kakao.maps.Map | null>(null);

  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [headingSource, setHeadingSource] = useState<HeadingSource>(null);
  const [showHeadingHint, setShowHeadingHint] = useState(false);
  
  const lastGpsHeadingAtRef = useRef(0);
  const hasShownHeadingHintRef = useRef(false);
  const isDraggingRef = useRef(false);

  const currentTab = selectedTab as TabType;
  const config = MAP_TAB_CONFIG[currentTab];

  // 1. 지도 초기화 및 이벤트 등록
  useEffect(() => {
    if (loading || error || !containerRef.current || mapRef.current) return;
    if (!window.kakao?.maps) return;

    const options = {
      center: new window.kakao.maps.LatLng(viewXY.X, viewXY.Y),
      level: 4,
    };

    const map = new window.kakao.maps.Map(containerRef.current, options);
    mapRef.current = map;
    setInternalMap(map);
    setMap(map);

    // 스카이뷰/지도 타입 전환 컨트롤 추가
    const mapTypeControl = new window.kakao.maps.MapTypeControl();
    map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

    // 레이아웃 지연 보정 및 중심점 복원
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.relayout();
        mapRef.current.setCenter(new window.kakao.maps.LatLng(viewXY.X, viewXY.Y));
      }
    }, 100);

    // 드래그/움직임 관련 트래킹 해제 리스너 등록
    window.kakao.maps.event.addListener(map, "dragstart", () => {
      isDraggingRef.current = true;
      if (setIsTracking) setIsTracking(false);
    });

    window.kakao.maps.event.addListener(map, "dragend", () => {
      isDraggingRef.current = false;
    });

    window.kakao.maps.event.addListener(map, "idle", () => {
      isDraggingRef.current = false;
      if (isTracking && setIsTracking) setIsTracking(false);
    });
  }, [loading, error]);



  // 2. 외부 이동 트리거 감지 시 panTo 이동
  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapMoveTrigger === 0) return;

    const targetLatLng = new window.kakao.maps.LatLng(viewXY.X, viewXY.Y);
    map.panTo(targetLatLng);
  }, [mapMoveTrigger]);

  // 3. 실시간 위치 추적
  useEffect(() => {
    if (!navigator.geolocation) return;

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMyLocation({ lat: latitude, lng: longitude });
      },
      (err) => console.error(err),
      options
    );

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed } = pos.coords;
        setMyLocation((prev) =>
          prev &&
          Math.abs(prev.lat - latitude) < 0.0000001 &&
          Math.abs(prev.lng - longitude) < 0.0000001
            ? prev
            : { lat: latitude, lng: longitude },
        );

        if (!isTracking || isDraggingRef.current) {
          return;
        }

        const gpsHeading = getGpsHeading(pos.coords);
        if (gpsHeading !== null) {
          lastGpsHeadingAtRef.current = Date.now();
          setHeading((prev) =>
            smoothHeading(prev, gpsHeading, GPS_HEADING_SMOOTHING),
          );
          setHeadingSource("gps");
        } else if (typeof speed === "number" && speed < GPS_HEADING_MIN_SPEED) {
          lastGpsHeadingAtRef.current = 0;
        }
      },
      (err) => console.error(err),
      options
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isTracking]);

  // 4. 기기 방향 감지
  useEffect(() => {
    if (!isTracking) {
      return;
    }

    const orientationEventName =
      "ondeviceorientationabsolute" in window
        ? "deviceorientationabsolute"
        : "deviceorientation";

    const handleOrientation = (event: Event) => {
      if (isDraggingRef.current) {
        return;
      }

      const compassHeading = getCompassHeading(event as DeviceOrientationEvent);
      if (compassHeading === null) {
        return;
      }

      if (Date.now() - lastGpsHeadingAtRef.current < GPS_HEADING_HOLD_MS) {
        return;
      }

      setHeading((prev) =>
        smoothHeading(prev, compassHeading, COMPASS_HEADING_SMOOTHING),
      );
      setHeadingSource("compass");
    };

    window.addEventListener(orientationEventName, handleOrientation, true);

    return () => {
      window.removeEventListener(orientationEventName, handleOrientation, true);
    };
  }, [isTracking]);

  useEffect(() => {
    if (!isTracking) {
      hasShownHeadingHintRef.current = false;
      setShowHeadingHint(false);
      return;
    }

    if (headingSource !== "compass") {
      setShowHeadingHint(false);
      return;
    }

    if (hasShownHeadingHintRef.current) {
      return;
    }

    hasShownHeadingHintRef.current = true;
    setShowHeadingHint(true);

    const timeoutId = window.setTimeout(() => {
      setShowHeadingHint(false);
    }, 4200);

    return () => window.clearTimeout(timeoutId);
  }, [headingSource, isTracking]);

  // 5. 내 위치 버튼 클릭
  const handleMyLocationClick = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      try { await (DeviceOrientationEvent as any).requestPermission(); } catch (e) {}
    }
    if (!myLocation) return;

    mixpanelTrack.campusMapTrackingToggled(!isTracking);

    if (mapRef.current) {
      mapRef.current.setLevel(3);
      mapRef.current.panTo(new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng));
    }
    
    if (setSelectedCoord) {
      setSelectedCoord({
        X: myLocation.lat,
        Y: myLocation.lng,
      });
    }
    if (setIsTracking) setIsTracking(true);
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

  // 6. selectedTab 또는 지도 설정 완료 시 마커 동기화
  const markersRef = useRef<kakao.maps.Marker[]>([]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 기존 마커 전체 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 새 마커 생성 및 지도 등록
    const newMarkers = placesToRender.map((place) => {
      const markerPosition = new window.kakao.maps.LatLng(
        Number(place.latitude),
        Number(place.longitude),
      );

      const markerImage = new window.kakao.maps.MarkerImage(
        config.getIcon(place),
        new window.kakao.maps.Size(24, 35),
        {
          offset: new window.kakao.maps.Point(12, 35),
        }
      );

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        image: markerImage,
        clickable: true,
      });

      marker.setMap(map);

      const markerId = config.getMarkerId(place);
      const isOpen = openedMarkerId === markerId;

      // 마커 클릭 이벤트 리스너
      window.kakao.maps.event.addListener(marker, "click", () => {
        if (!isOpen) {
          mixpanelTrack.campusMapPlaceSelected(
            config.getPlaceTitle(place),
            place.category ?? "",
            "Marker",
          );
        }
        
        // 핀을 클릭했을 때 지도를 해당 위치로 panTo하고 openedMarkerId를 갱신
        // 정보창(말풍선)을 그리는 CustomOverlayMap은 기획 간소화 요구사항에 따라 렌더링하지 않음
        setOpenedMarkerId(isOpen ? null : markerId, {
          X: Number(place.latitude),
          Y: Number(place.longitude),
        });

        if (setIsTracking) setIsTracking(false);
      });

      return marker;
    });

    markersRef.current = newMarkers;
  }, [selectedTab, mapInstance]);

  // 7. 내 위치 오버레이 관리 (Portal 렌더링용)
  const myLocationOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const [myLocationContainer] = useState(() => document.createElement("div"));

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!myLocation) {
      if (myLocationOverlayRef.current) {
        myLocationOverlayRef.current.setMap(null);
        myLocationOverlayRef.current = null;
      }
      return;
    }

    const position = new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng);

    if (!myLocationOverlayRef.current) {
      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content: myLocationContainer,
        zIndex: 10,
      });
      overlay.setMap(map);
      myLocationOverlayRef.current = overlay;
    } else {
      myLocationOverlayRef.current.setPosition(position);
    }
  }, [myLocation, mapInstance]);

  useEffect(() => {
    return () => {
      if (myLocationOverlayRef.current) {
        myLocationOverlayRef.current.setMap(null);
      }
    };
  }, []);

  if (loading) {
    return (
      <Container style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa", color: "#6c757d", fontSize: "14px" }}>
        지도를 불러오는 중입니다...
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa", color: "#dc3545", fontSize: "14px" }}>
        지도를 불러오는 데 실패했습니다.
      </Container>
    );
  }

  return (
    <Container>
      {/* 바닐라 카카오 지도가 마운트될 컨테이너 */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* 내 위치 마커는 ReactDOM.createPortal을 이용해 CustomOverlay 엘리먼트에 동적으로 주입 */}
      {myLocation && ReactDOM.createPortal(
        <MyLocationMarker>
          <DirectionShadow 
            style={{ 
              transform: `rotate(${heading || 0}deg)`,
              opacity: isTracking && heading !== null ? 1 : 0,
              visibility: isTracking && heading !== null ? "visible" : "hidden",
              transition: "opacity 0.2s"
            }} 
          />
          <PulseDot />
          <MainDot />
        </MyLocationMarker>,
        myLocationContainer
      )}

      <MyLocationButton onClick={handleMyLocationClick} $active={isTracking}>
        <Navigation size={20} fill={isTracking ? "#3E69D1" : "none"} />
      </MyLocationButton>

      {showHeadingHint && (
        <HeadingHint>
          방향이 어긋나면 휴대폰을 8자 모양으로 천천히 움직여 보정해보세요.
        </HeadingHint>
      )}
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
  top: 60px;
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

const HeadingHint = styled.div`
  position: absolute;
  top: 104px;
  right: 10px;
  z-index: 10;
  max-width: 200px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(32, 53, 93, 0.92);
  color: #ffffff;
  font-size: 12px;
  line-height: 1.45;
  box-shadow: 0 10px 24px rgba(25, 45, 85, 0.18);
`;

const MyLocationMarker = styled.div`
  position: relative;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  bottom: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle at 50% 100%, rgba(255, 75, 75, 0.4) 0%, rgba(255, 75, 75, 0) 70%);
  clip-path: polygon(50% 100%, 15% 0%, 85% 0%);
  z-index: 0;
  transform-origin: 50% 100%;
  margin-left: -50px;
  pointer-events: none;
`;
