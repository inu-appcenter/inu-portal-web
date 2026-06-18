import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { LatLng } from "@/types/bus";
import { useKakaoMapLoader } from "@/hooks/useKakaoMapLoader";

interface BusRouteMapProps {
  path: LatLng[];
  stopMarker?: { name: string; lat: number; lng: number }[];
}

export default function BusRouteMap({ path, stopMarker }: BusRouteMapProps) {
  const { loading, error } = useKakaoMapLoader();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<any>(null);

  // 1. 지도 초기화 및 컨트롤 마운트
  useEffect(() => {
    if (loading || error || !containerRef.current || map) return;
    if (!window.kakao?.maps) return;

    const options = {
      center: path.length > 0 
        ? new window.kakao.maps.LatLng(path[0].lat, path[0].lng)
        : new window.kakao.maps.LatLng(37.374474, 126.633614),
      level: 3,
    };

    const mapInstance = new window.kakao.maps.Map(containerRef.current, options);
    setMap(mapInstance);

    const mapTypeControl = new window.kakao.maps.MapTypeControl();
    mapInstance.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);
  }, [loading, error, path, map]);

  // 2. 경로선(Polyline) 그리기
  useEffect(() => {
    if (!map || !window.kakao?.maps || path.length === 0) return;

    const linePath = path.map(pt => new window.kakao.maps.LatLng(pt.lat, pt.lng));

    const polyline = new window.kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 4,
      strokeColor: "#3E69D1",
      strokeOpacity: 0.9,
      strokeStyle: "solid",
    });

    polyline.setMap(map);

    // Bounds 자동 조절
    const bounds = new window.kakao.maps.LatLngBounds();
    linePath.forEach(latlng => bounds.extend(latlng));
    map.setBounds(bounds);

    return () => {
      polyline.setMap(null);
    };
  }, [map, path]);

  // 3. 정류장 마커 그리기
  useEffect(() => {
    if (!map || !window.kakao?.maps || !stopMarker || stopMarker.length === 0) return;

    const markers = stopMarker.map(stop => {
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
      });

      marker.setMap(map);
      return marker;
    });

    return () => {
      markers.forEach(m => m.setMap(null));
    };
  }, [map, stopMarker]);

  return (
    <BusRouteMapWrapper ref={containerRef}>
      {loading && (
        <LoadingText>지도를 불러오는 중입니다...</LoadingText>
      )}
      {error && (
        <LoadingText>지도를 불러오는 데 실패했습니다.</LoadingText>
      )}
    </BusRouteMapWrapper>
  );
}

const BusRouteMapWrapper = styled.div`
  position: relative;
  height: 400px;
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  background: #f8f9fa;
`;

const LoadingText = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 14px;
`;
