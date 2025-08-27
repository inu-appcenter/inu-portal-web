import { Map, MapMarker, MapTypeControl } from "react-kakao-maps-sdk";
import styled from "styled-components";
import { LatLng } from "../../../types/bus.ts";

interface BusStopMapProps extends LatLng {}

export default function BusStopMap({ lat, lng }: BusStopMapProps) {
  if (window.kakao?.maps)
    return (
      <MapCard>
        <Map
          center={{ lat, lng }}
          level={3}
          draggable
          zoomable
          style={{ height: "100%", width: "100%" }}
        >
          <MapMarker
            position={{ lat, lng }}
            image={{
              src: "../../src/resources/assets/bus/marker/횃불이마커.svg",
              size: { width: 50, height: 50 },
            }}
          />
          <MapTypeControl
            position={window.kakao.maps.ControlPosition.TOPRIGHT}
          />
        </Map>
      </MapCard>
    );
}

const MapCard = styled.div`
  position: relative;
  z-index: 0;
  height: 260px;
  border-radius: 12px;
  overflow: hidden;
`;
