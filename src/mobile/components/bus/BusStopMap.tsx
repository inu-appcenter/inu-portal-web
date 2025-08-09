import { Map, MapMarker } from "react-kakao-maps-sdk";
import styled from "styled-components";

interface BusStopMapProps {
  lat: number;
  lng: number;
}

export default function BusStopMap({ lat, lng }: BusStopMapProps) {
  if (!window.kakao?.maps) return <MapCard />;

  return (
    <MapCard>
      <Map
        center={{ lat, lng }}
        level={3}
        draggable
        zoomable
        style={{ height: "100%", width: "100%" }}
      >
        <MapMarker position={{ lat, lng }} />
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
