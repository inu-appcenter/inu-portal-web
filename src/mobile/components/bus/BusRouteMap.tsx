import {
  Map,
  Polyline,
  MapTypeControl,
  CustomOverlayMap,
} from "react-kakao-maps-sdk";
import styled from "styled-components";
import { LatLng } from "../../../types/bus.ts";
import { useEffect, useState } from "react";

interface BusRouteMapProps {
  path: LatLng[];
  stopMarker?: { name: string; lat: number; lng: number }[];
}

export default function BusRouteMap({ path, stopMarker }: BusRouteMapProps) {
  const [map, setMap] = useState<kakao.maps.Map | null>(null);

  useEffect(() => {
    if (!map || !window.kakao?.maps) return;

    const bounds = new window.kakao.maps.LatLngBounds();
    path.forEach(({ lat, lng }) => {
      bounds.extend(new window.kakao.maps.LatLng(lat, lng));
    });

    map.setBounds(bounds);
  }, [map, path]);
  return (
    <BusRouteMapWrapper>
      <Map
        center={path[0]}
        level={3}
        style={{ height: "100%", width: "100%" }}
        onCreate={(mapInstance) => {
          setMap(mapInstance);
        }}
      >
        <Polyline
          path={path}
          strokeWeight={5}
          strokeColor={"#2d99f3"}
          strokeOpacity={0.9}
          strokeStyle={"solid"}
        />
        {stopMarker?.map((stop, i) => (
          <CustomOverlayMap
            key={i}
            position={{ lat: stop.lat, lng: stop.lng }}
            yAnchor={1}
          >
            <MarkerWrapper>
              <img src={`/Bus/marker/${stop.name}.svg`} alt={stop.name} />
            </MarkerWrapper>
          </CustomOverlayMap>
        ))}
        <MapTypeControl position={window.kakao.maps.ControlPosition.TOPRIGHT} />
      </Map>
    </BusRouteMapWrapper>
  );
}

const BusRouteMapWrapper = styled.div`
  position: relative;
  z-index: 0;
  height: 460px;
  border-radius: 12px;
  overflow: hidden;
  margin-top: -15px;
`;

const MarkerWrapper = styled.div`
  width: 40px;
  height: 40px;

  img {
    width: 100%;
    height: 100%;
  }
`;
