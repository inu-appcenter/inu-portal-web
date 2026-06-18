import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import type { BusData, LatLng } from "@/types/bus";
import type { BusMapStop } from "@/components/mobile/bus/data/busMapConfig";



function getAdjustedCenterFromPadding(
  map: kakao.maps.Map | null,
  target: LatLng,
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  },
) {
  if (!map || !window.kakao?.maps) {
    return target;
  }

  const projection = map.getProjection();

  if (!projection?.pointFromCoords || !projection.coordsFromPoint) {
    return target;
  }

  const targetPoint = projection.pointFromCoords(
    new window.kakao.maps.LatLng(target.lat, target.lng),
  );
  const shiftedPoint = new window.kakao.maps.Point(
    targetPoint.x + (padding.right - padding.left) / 2,
    targetPoint.y + (padding.bottom - padding.top) / 2,
  );
  const adjustedCenter = projection.coordsFromPoint(shiftedPoint);

  return {
    lat: adjustedCenter.getLat(),
    lng: adjustedCenter.getLng(),
  };
}

interface BusInteractiveMapProps {
  activeStops: BusMapStop[];
  selectedStopId: string | null;
  selectedBus: BusData | null;
  center: LatLng;
  routeViewportPadding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  onSelectStop: (stopId: string) => void;
  mapFocusTrigger?: number;
}

const DEFAULT_MARKER_IMAGE = "/Bus/marker/횃불이마커.png";

export default function BusInteractiveMap({
  activeStops,
  selectedStopId,
  selectedBus,
  center,
  routeViewportPadding,
  onSelectStop,
  mapFocusTrigger,
}: BusInteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null);

  const previousRouteKeyRef = useRef<string | null>(null);

  const selectedRoutePath = useMemo(
    () => selectedBus?.path ?? [],
    [selectedBus?.path],
  );

  const selectedRouteKey = useMemo(() => {
    if (selectedRoutePath.length === 0 || !selectedBus) {
      return null;
    }

    return `${selectedBus.id}-${selectedRoutePath.length}-${selectedBus.lastStopId ?? ""}`;
  }, [
    selectedBus,
    selectedBus?.id,
    selectedBus?.lastStopId,
    selectedRoutePath.length,
  ]);

  const routePadding = useMemo(() => {
    const defaultTop = routeViewportPadding?.top ?? 32;
    const defaultRight = routeViewportPadding?.right ?? 32;
    const defaultLeft = routeViewportPadding?.left ?? 32;
    let defaultBottom = routeViewportPadding?.bottom ?? 32;

    // 모바일이면서 정류장 단독 뷰일 경우 (selectedBus가 없을 때)
    // 노선용 15% 마진 패딩 대신 약 6% 마진 패딩 수준이 되도록 bottom 패딩 값을 축소 보정합니다.
    if (typeof window !== "undefined" && !selectedBus && routeViewportPadding) {
      const isDesktopView = window.matchMedia("(min-width: 1024px)").matches;
      if (!isDesktopView) {
        const mapHeight = Math.max(window.innerHeight, 320);
        // 마진율 차이 9% 만큼 차감 (15% -> 6%)
        const diffOffset = Math.round(mapHeight * 0.09);
        defaultBottom = Math.max(84, defaultBottom - diffOffset);
      }
    }

    return {
      top: defaultTop,
      right: defaultRight,
      bottom: defaultBottom,
      left: defaultLeft,
    };
  }, [routeViewportPadding, selectedBus]);

  // 1. 지도 초기화 및 스카이뷰 컨트롤 추가
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialCenter = selectedRouteKey
      ? center
      : getAdjustedCenterFromPadding(null, center, routePadding);

    const options = {
      center: new window.kakao.maps.LatLng(initialCenter.lat, initialCenter.lng),
      level: 4,
    };

    const map = new window.kakao.maps.Map(containerRef.current, options);
    mapRef.current = map;
    setMapInstance(map);

    // 스카이뷰/지도 타입 전환 컨트롤 추가
    const mapTypeControl = new window.kakao.maps.MapTypeControl();
    map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

    // 레이아웃 지연 보정 및 초기 중심 설정
    window.setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.relayout();
        const finalCenter = selectedRouteKey
          ? center
          : getAdjustedCenterFromPadding(mapRef.current, center, routePadding);
        mapRef.current.setCenter(
          new window.kakao.maps.LatLng(finalCenter.lat, finalCenter.lng),
        );
      }
    }, 100);
  }, []);

  // 2. 정류장 선택(selectedStopId 변경) 또는 포커스 트리거 발생 시 지도를 해당 정류장 위치로 레벨 3(가깝게) 이동
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedStopId) {
      return;
    }

    // 정류장을 탭하여 세부 조회 시 줌 레벨을 3(가깝게)으로 먼저 맞추어 축척을 바꿉니다.
    map.setLevel(3);

    // 변경된 레벨 3 축척을 기준으로 바텀시트 크기만큼 중심 Y축 좌표를 정확히 보정합니다.
    const adjustedCenter = getAdjustedCenterFromPadding(
      map,
      center,
      routePadding,
    );

    map.panTo(
      new window.kakao.maps.LatLng(adjustedCenter.lat, adjustedCenter.lng),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStopId, mapFocusTrigger, mapInstance]);

  // 3. 버스 노선 최초 선택(selectedRouteKey 변경) 시 경로선 영역에 맞춰 가시 영역 조정 (setBounds)
  useEffect(() => {
    const map = mapRef.current;

    if (!selectedRouteKey) {
      previousRouteKeyRef.current = null;
    }

    if (
      !map ||
      selectedRoutePath.length === 0 ||
      !selectedRouteKey
    ) {
      return;
    }

    const isSameRoute = previousRouteKeyRef.current === selectedRouteKey;
    previousRouteKeyRef.current = selectedRouteKey;

    // 이미 같은 버스 노선 화면 내에서 다른 정류장을 선택하거나 리렌더링된 것이라면 setBounds를 반복하지 않습니다.
    if (isSameRoute) {
      return;
    }

    const bounds = new window.kakao.maps.LatLngBounds();
    selectedRoutePath.forEach(({ lat, lng }) => {
      bounds.extend(new window.kakao.maps.LatLng(lat, lng));
    });

    const applyBounds = () => {
      if (mapRef.current) {
        // 1. setBounds 시 하단 패딩은 기본값(32px) 수준으로 주어 줌아웃을 최소화합니다.
        mapRef.current.setBounds(
          bounds,
          routePadding.top,
          routePadding.right,
          32,
          routePadding.left,
        );

        // 2. 사용자의 배율 요구(한 단계 더 작게)에 맞게 레벨을 1단계 올려 줌아웃(배율 축소)합니다.
        const currentLevel = mapRef.current.getLevel();
        mapRef.current.setLevel(currentLevel + 1);

        // 3. 줌 배율이 조절된 상태에서, 바텀시트 가림막 크기만큼 중심 좌표만 Y축 위로 즉시 이동(setCenter)시킵니다.
        // panTo 애니메이션을 사용하면 순간적인 스냅 후 부드러운 패닝이 이어지며 화면이 두 번 끊기거나 깜빡이는 느낌이 들므로,
        // 동기적인 setCenter를 사용해 한 프레임에 최종 보정된 지도가 깜빡임 없이 즉시 나타나게 합니다.
        const currentCenter = mapRef.current.getCenter();
        const targetLatLng = {
          lat: currentCenter.getLat(),
          lng: currentCenter.getLng()
        };
        const adjustedCenter = getAdjustedCenterFromPadding(
          mapRef.current,
          targetLatLng,
          routePadding
        );

        mapRef.current.setCenter(
          new window.kakao.maps.LatLng(adjustedCenter.lat, adjustedCenter.lng)
        );
      }
    };

    applyBounds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRouteKey, mapInstance]);

  // 3-2. 바텀시트 높이(routePadding.bottom) 변경 시 지도의 중심점을 부드럽게 위/아래로 이동(panTo)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    let anchorLatLng: LatLng;

    if (selectedBus && selectedRoutePath.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      selectedRoutePath.forEach(({ lat, lng }) => {
        bounds.extend(new window.kakao.maps.LatLng(lat, lng));
      });
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      anchorLatLng = {
        lat: (sw.getLat() + ne.getLat()) / 2,
        lng: (sw.getLng() + ne.getLng()) / 2,
      };
    } else if (selectedStopId) {
      anchorLatLng = center;
    } else {
      return;
    }

    const adjustedCenter = getAdjustedCenterFromPadding(
      map,
      anchorLatLng,
      routePadding,
    );

    map.panTo(
      new window.kakao.maps.LatLng(adjustedCenter.lat, adjustedCenter.lng),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routePadding.bottom, mapInstance]);

  // 4. activeStops 정류장 마커 관리
  const markersRef = useRef<kakao.maps.Marker[]>([]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 기존 마커 전체 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 새 마커 생성 및 지도 부착
    const newMarkers = activeStops.map((stop) => {
      const isSelected = stop.id === selectedStopId;
      const width = isSelected ? 46 : 38;
      const height = isSelected ? 56 : 48;

      const markerImage = new window.kakao.maps.MarkerImage(
        DEFAULT_MARKER_IMAGE,
        new window.kakao.maps.Size(width, height),
        {
          offset: new window.kakao.maps.Point(width / 2, height),
        }
      );

      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(stop.lat, stop.lng),
        image: markerImage,
        clickable: true,
      });

      marker.setMap(map);

      window.kakao.maps.event.addListener(marker, "click", () => {
        onSelectStop(stop.id);
      });

      return marker;
    });

    markersRef.current = newMarkers;
  }, [activeStops, selectedStopId, mapInstance]);

  // 5. 선택된 정류장 말풍선 오버레이 관리 (SelectedStopBubble)
  const selectedStopBubbleOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const [selectedStopBubbleContainer] = useState(() => document.createElement("div"));

  const currentSelectedStop = useMemo(
    () => activeStops.find((stop) => stop.id === selectedStopId),
    [activeStops, selectedStopId],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!currentSelectedStop) {
      if (selectedStopBubbleOverlayRef.current) {
        selectedStopBubbleOverlayRef.current.setMap(null);
        selectedStopBubbleOverlayRef.current = null;
      }
      return;
    }

    const position = new window.kakao.maps.LatLng(
      currentSelectedStop.lat,
      currentSelectedStop.lng,
    );

    if (!selectedStopBubbleOverlayRef.current) {
      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content: selectedStopBubbleContainer,
        xAnchor: 0.5,
        yAnchor: 0,
        zIndex: 15,
      });
      overlay.setMap(map);
      selectedStopBubbleOverlayRef.current = overlay;
    } else {
      selectedStopBubbleOverlayRef.current.setPosition(position);
    }
  }, [currentSelectedStop, mapInstance]);

  useEffect(() => {
    return () => {
      if (selectedStopBubbleOverlayRef.current) {
        selectedStopBubbleOverlayRef.current.setMap(null);
      }
    };
  }, []);

  // 6. 버스 경로선 (Polyline) 관리
  const polylineRef = useRef<kakao.maps.Polyline | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (selectedRoutePath.length > 0) {
      const path = selectedRoutePath.map(
        (pt) => new window.kakao.maps.LatLng(pt.lat, pt.lng),
      );

      const polyline = new window.kakao.maps.Polyline({
        path,
        strokeWeight: 5,
        strokeColor: "#2f6fe4",
        strokeOpacity: 0.92,
        strokeStyle: "solid",
      });

      polyline.setMap(map);
      polylineRef.current = polyline;
    }
  }, [selectedRoutePath, mapInstance]);

  useEffect(() => {
    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, []);

  // 7. 노선 정류장 마커 (RouteStopMarker) 관리
  const routeStopMarkersRef = useRef<kakao.maps.Marker[]>([]);

  const routeStopMarkersData = useMemo(
    () => selectedBus?.stopMarker ?? [],
    [selectedBus],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    routeStopMarkersRef.current.forEach((marker) => marker.setMap(null));
    routeStopMarkersRef.current = [];

    const newMarkers = routeStopMarkersData.map((stop) => {
      const width = 40;
      const height = 50;

      const markerImage = new window.kakao.maps.MarkerImage(
        `/Bus/marker/${stop.name}.png`,
        new window.kakao.maps.Size(width, height),
        {
          offset: new window.kakao.maps.Point(width / 2, height),
        }
      );

      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(stop.lat, stop.lng),
        image: markerImage,
        zIndex: 5,
      });

      marker.setMap(map);
      return marker;
    });

    routeStopMarkersRef.current = newMarkers;
  }, [routeStopMarkersData, mapInstance]);

  useEffect(() => {
    return () => {
      routeStopMarkersRef.current.forEach((marker) => marker.setMap(null));
    };
  }, []);

  return (
    <MapShell>
      {/* 바닐라 카카오 지도가 렌더링될 컨테이너 */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* 선택된 정류장 말풍선 오버레이 Portal 주입 */}
      {currentSelectedStop && ReactDOM.createPortal(
        <SelectedStopBubble>{currentSelectedStop.stopName}</SelectedStopBubble>,
        selectedStopBubbleContainer
      )}
    </MapShell>
  );
}

const MapShell = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const SelectedStopBubble = styled.div`
  padding: 9px 12px;
  border-radius: 999px;
  background: rgba(20, 36, 66, 0.92);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  box-shadow: 0 14px 28px rgba(20, 36, 66, 0.16);
  pointer-events: none;
  
  transform: translateY(calc(-100% - 64px));
`;


