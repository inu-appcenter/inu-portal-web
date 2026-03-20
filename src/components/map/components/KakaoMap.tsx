import React, { useMemo, useState, useEffect, useRef } from "react";
import { Map, MapTypeControl, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";
import styled from "styled-components";
import { Navigation } from "lucide-react"; // 내 위치 아이콘용
import { cafePlaces, places, restaurantPlaces, restPlaces } from "../DB";
import { MAP_TAB_CONFIG, TabType } from "../constants/mapConfig";

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
  setMap: any;
  setSelectedCoord?: React.Dispatch<
    React.SetStateAction<{ X: number; Y: number }>
  >;
  openedMarkerId: string | null;
  setOpenedMarkerId: (id: string | null, coord?: { X: number; Y: number }) => void;
  offset?: number;
  isTracking?: boolean;
  setIsTracking?: (isTracking: boolean) => void;
}

const KakaoMap = ({
  selectedTab,
  viewXY,
  setMap,
  setSelectedCoord,
  openedMarkerId,
  setOpenedMarkerId,
  offset = 0,
  isTracking = false,
  setIsTracking,
}: Props) => {
  const [mapInstance, setInternalMap] = useState<kakao.maps.Map | null>(null);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [headingSource, setHeadingSource] = useState<HeadingSource>(null);
  const [showHeadingHint, setShowHeadingHint] = useState(false);
  const lastGpsHeadingAtRef = useRef(0);
  const hasShownHeadingHintRef = useRef(false);

  const currentTab = selectedTab as TabType;
  const config = MAP_TAB_CONFIG[currentTab];

  const syncSelectedCoordWithMapCenter = () => {
    if (!mapInstance || !setSelectedCoord) return;

    const center = mapInstance.getCenter();
    const nextCoord = {
      X: center.getLat() + offset,
      Y: center.getLng(),
    };

    setSelectedCoord((prev) =>
      Math.abs(prev.X - nextCoord.X) < 0.0000001 &&
      Math.abs(prev.Y - nextCoord.Y) < 0.0000001
        ? prev
        : nextCoord,
    );
  };

  const syncSelectedCoordWithLocation = (lat: number, lng: number) => {
    if (!setSelectedCoord) return;

    setSelectedCoord((prev) =>
      Math.abs(prev.X - lat) < 0.0000001 && Math.abs(prev.Y - lng) < 0.0000001
        ? prev
        : { X: lat, Y: lng },
    );
  };

  // 1. 실시간 위치 추적
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
        setMyLocation({ lat: latitude, lng: longitude });

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

        if (isTracking && mapInstance) {
          syncSelectedCoordWithLocation(latitude, longitude);
          mapInstance.panTo(new window.kakao.maps.LatLng(latitude - offset, longitude));
        }
      },
      (err) => console.error(err),
      options
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isTracking, mapInstance, offset]);

  // 2. 기기 방향 감지
  useEffect(() => {
    const orientationEventName =
      "ondeviceorientationabsolute" in window
        ? "deviceorientationabsolute"
        : "deviceorientation";

    const handleOrientation = (event: Event) => {
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
  }, []);

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

  const handleMyLocationClick = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      try { await (DeviceOrientationEvent as any).requestPermission(); } catch (e) {}
    }
    if (!myLocation) return;
    syncSelectedCoordWithLocation(myLocation.lat, myLocation.lng);
    if (mapInstance) {
      mapInstance.panTo(new window.kakao.maps.LatLng(myLocation.lat - offset, myLocation.lng));
      mapInstance.setLevel(3);
    }
    if (setIsTracking) setIsTracking(true);
  };

  const handleDragStart = () => {
    if (isTracking && setIsTracking) setIsTracking(false);
  };

  const handleDragEnd = () => {
    syncSelectedCoordWithMapCenter();
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
        draggable={true}
        zoomable={true}
        style={{ width: "100%", height: "100%" }}
        onCreate={(map) => {
          setMap(map);
          setInternalMap(map);
          setTimeout(() => {
            map.relayout();
            map.setCenter(new window.kakao.maps.LatLng(viewXY.X, viewXY.Y));
          }, 100);
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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
                  options: {
                    offset: { x: 12, y: 35 },
                  },
                }}
                onClick={() => {
                  setOpenedMarkerId(
                    isOpen ? null : markerId,
                    isOpen
                      ? undefined
                      : {
                          X: Number(place.latitude),
                          Y: Number(place.longitude),
                        },
                  );
                  if (setIsTracking) setIsTracking(false);
                }}
              />

              {isOpen && (
                <CustomOverlayMap
                  position={{
                    lat: Number(place.latitude),
                    lng: Number(place.longitude),
                  }}
                  xAnchor={0.5}
                  yAnchor={1}
                  zIndex={20}
                >
                  <OverlayBubble onClick={(e) => e.stopPropagation()}>
                    <OverlayCloseButton
                      type="button"
                      aria-label="인포윈도우 닫기"
                      onClick={() => setOpenedMarkerId(null)}
                    >
                      ×
                    </OverlayCloseButton>
                    <OverlayBody
                      dangerouslySetInnerHTML={{
                        __html: config.getInfoWindowHtml(place),
                      }}
                    />
                  </OverlayBubble>
                </CustomOverlayMap>
              )}
            </React.Fragment>
          );
        })}

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

const OverlayBubble = styled.div`
  position: relative;
  transform: translateY(-46px);
  background: #ffffff;
  border: 1px solid rgba(64, 113, 185, 0.16);
  border-radius: 16px;
  box-shadow:
    0 18px 36px rgba(25, 45, 85, 0.16),
    0 4px 12px rgba(25, 45, 85, 0.1);
  overflow: visible;

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -9px;
    width: 18px;
    height: 18px;
    background: #ffffff;
    border-right: 1px solid rgba(64, 113, 185, 0.16);
    border-bottom: 1px solid rgba(64, 113, 185, 0.16);
    transform: translateX(-50%) rotate(45deg);
  }
`;

const OverlayBody = styled.div`
  position: relative;
  z-index: 1;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
`;

const OverlayCloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 999px;
  background: rgba(32, 53, 93, 0.08);
  color: #20355d;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:active {
    background: rgba(32, 53, 93, 0.14);
  }
`;
