import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  CustomOverlayMap,
  Map,
  MapMarker,
  MapTypeControl,
  Polyline,
} from "react-kakao-maps-sdk";
import styled from "styled-components";
import type { BusData, LatLng } from "@/types/bus";
import type { BusMapStop } from "@/components/mobile/bus/data/busMapConfig";

function isSameLatLng(a: LatLng, b: LatLng) {
  return Math.abs(a.lat - b.lat) < 0.000001 && Math.abs(a.lng - b.lng) < 0.000001;
}

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
}

const DEFAULT_MARKER_IMAGE = "/Bus/marker/횃불이마커.png";

export default function BusInteractiveMap({
  activeStops,
  selectedStopId,
  selectedBus,
  center,
  routeViewportPadding,
  onSelectStop,
}: BusInteractiveMapProps) {
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [routeCenter, setRouteCenter] = useState<LatLng | null>(null);
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
  const routePadding = useMemo(
    () => ({
      top: routeViewportPadding?.top ?? 32,
      right: routeViewportPadding?.right ?? 32,
      bottom: routeViewportPadding?.bottom ?? 32,
      left: routeViewportPadding?.left ?? 32,
    }),
    [routeViewportPadding?.bottom, routeViewportPadding?.left, routeViewportPadding?.right, routeViewportPadding?.top],
  );

  useEffect(() => {
    if (selectedRouteKey) {
      return;
    }

    const nextCenter = getAdjustedCenterFromPadding(
      mapInstance,
      center,
      routePadding,
    );

    setMapCenter((prev) => (isSameLatLng(prev, nextCenter) ? prev : nextCenter));
  }, [
    center,
    mapInstance,
    routePadding.bottom,
    routePadding.left,
    routePadding.right,
    routePadding.top,
    selectedRouteKey,
  ]);

  useLayoutEffect(() => {
    if (!mapInstance || !window.kakao?.maps || selectedRouteKey) {
      return;
    }

    previousRouteKeyRef.current = null;
    setRouteCenter(null);
    const adjustedCenter = getAdjustedCenterFromPadding(
      mapInstance,
      center,
      routePadding,
    );

    setMapCenter((prev) =>
      isSameLatLng(prev, adjustedCenter) ? prev : adjustedCenter,
    );
    mapInstance.panTo(
      new window.kakao.maps.LatLng(adjustedCenter.lat, adjustedCenter.lng),
    );
  }, [
    center.lat,
    center.lng,
    mapInstance,
    routePadding.bottom,
    routePadding.left,
    routePadding.right,
    routePadding.top,
    selectedRouteKey,
  ]);

  useLayoutEffect(() => {
    if (
      !mapInstance ||
      !window.kakao?.maps ||
      selectedRoutePath.length === 0 ||
      !selectedRouteKey
    ) {
      return;
    }

    const isSameRoute = previousRouteKeyRef.current === selectedRouteKey;
    previousRouteKeyRef.current = selectedRouteKey;
    const bounds = new window.kakao.maps.LatLngBounds();

    selectedRoutePath.forEach(({ lat, lng }) => {
      bounds.extend(new window.kakao.maps.LatLng(lat, lng));
    });

    const syncRouteCenter = () => {
      const currentCenter = mapInstance.getCenter();
      const nextCenter = {
        lat: currentCenter.getLat(),
        lng: currentCenter.getLng(),
      };

      setRouteCenter((prev) => (prev && isSameLatLng(prev, nextCenter) ? prev : nextCenter));
      window.kakao.maps.event.removeListener(mapInstance, "idle", syncRouteCenter);
    };

    const applyBounds = () => {
      window.kakao.maps.event.removeListener(mapInstance, "idle", syncRouteCenter);
      window.kakao.maps.event.addListener(mapInstance, "idle", syncRouteCenter);
      mapInstance.setBounds(
        bounds,
        routePadding.top,
        routePadding.right,
        routePadding.bottom,
        routePadding.left,
      );
    };

    let timeoutId = 0;

    if (isSameRoute) {
      timeoutId = window.setTimeout(applyBounds, 220);
    } else {
      applyBounds();
    }

    return () => {
      window.kakao?.maps.event.removeListener(mapInstance, "idle", syncRouteCenter);
      window.clearTimeout(timeoutId);
    };
  }, [
    mapInstance,
    routePadding.bottom,
    routePadding.left,
    routePadding.right,
    routePadding.top,
    selectedRoutePath,
    selectedRouteKey,
  ]);

  return (
    <MapShell>
      <Map
        center={selectedRouteKey ? routeCenter ?? mapCenter : mapCenter}
        draggable
        zoomable
        style={{ width: "100%", height: "100%" }}
        onCreate={(map) => {
          setMapInstance(map);
          window.setTimeout(() => {
            map.relayout();
            const initialCenter = selectedRouteKey
              ? routeCenter ?? mapCenter
              : getAdjustedCenterFromPadding(map, center, routePadding);

            setMapCenter((prev) =>
              isSameLatLng(prev, initialCenter) ? prev : initialCenter,
            );
            map.setCenter(
              new window.kakao.maps.LatLng(
                initialCenter.lat,
                initialCenter.lng,
              ),
            );
          }, 100);
        }}
      >
        {selectedBus?.path?.length ? (
          <Polyline
            path={selectedBus.path}
            strokeWeight={5}
            strokeColor="#2f6fe4"
            strokeOpacity={0.92}
            strokeStyle="solid"
          />
        ) : null}

        {selectedBus?.stopMarker?.map((stop) => (
          <CustomOverlayMap
            key={`${stop.name}-${stop.lat}-${stop.lng}`}
            position={{ lat: stop.lat, lng: stop.lng }}
            yAnchor={1}
          >
            <RouteStopMarker>
              <img src={`/Bus/marker/${stop.name}.png`} alt={stop.name} />
            </RouteStopMarker>
          </CustomOverlayMap>
        ))}

        {activeStops.map((stop) => {
          const isSelected = stop.id === selectedStopId;
          const size = isSelected
            ? { width: 46, height: 56 }
            : { width: 38, height: 48 };

          return (
            <MapMarker
              key={stop.id}
              position={{ lat: stop.lat, lng: stop.lng }}
              image={{
                src: DEFAULT_MARKER_IMAGE,
                size,
                options: {
                  offset: { x: size.width / 2, y: size.height },
                },
              }}
              onClick={() => onSelectStop(stop.id)}
            />
          );
        })}

        {activeStops
          .filter((stop) => stop.id === selectedStopId)
          .map((stop) => (
            <CustomOverlayMap
              key={`${stop.id}-label`}
              position={{ lat: stop.lat, lng: stop.lng }}
              yAnchor={2.3}
            >
              <SelectedStopBubble>{stop.stopName}</SelectedStopBubble>
            </CustomOverlayMap>
          ))}

        {window.kakao?.maps ? (
          <MapTypeControl
            position={window.kakao.maps.ControlPosition.TOPRIGHT}
          />
        ) : null}
      </Map>
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
  margin-bottom: 8px;
  border-radius: 999px;
  background: rgba(20, 36, 66, 0.92);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  box-shadow: 0 14px 28px rgba(20, 36, 66, 0.16);
  pointer-events: none;
`;

const RouteStopMarker = styled.div`
  width: 40px;
  height: 50px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;
