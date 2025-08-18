import { Map, Polyline } from "react-kakao-maps-sdk";
import styled from "styled-components";
import { LatLng } from "../../../types/bus.ts";
import { useEffect, useState } from "react";

interface BusRouteMapProps {
  path: LatLng[];
}

export default function BusRouteMap({ path }: BusRouteMapProps) {
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
          strokeWeight={6}
          strokeColor={"#FFAE00"}
          strokeOpacity={0.8}
          strokeStyle={"solid"}
        />
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
`;
