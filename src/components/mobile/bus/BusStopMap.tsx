import { useEffect, useRef } from "react";
import styled from "styled-components";
import { LatLng } from "@/types/bus";
import { useKakaoMapLoader } from "@/hooks/useKakaoMapLoader";

interface BusStopMapProps extends LatLng {}

export default function BusStopMap({ lat, lng }: BusStopMapProps) {
  const { loading, error } = useKakaoMapLoader();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (loading || error || !containerRef.current) return;
    if (!window.kakao?.maps) return;

    const options = {
      center: new window.kakao.maps.LatLng(lat, lng),
      level: 3,
    };

    const map = new window.kakao.maps.Map(containerRef.current, options);

    // 마커 생성
    const width = 40;
    const height = 50;
    const markerImage = new window.kakao.maps.MarkerImage(
      "/Bus/marker/횃불이마커.png",
      new window.kakao.maps.Size(width, height),
      {
        offset: new window.kakao.maps.Point(width / 2, height),
      }
    );

    const marker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(lat, lng),
      image: markerImage,
    });
    marker.setMap(map);

    // 스카이뷰/지도 타입 전환 컨트롤 추가
    const mapTypeControl = new window.kakao.maps.MapTypeControl();
    map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

  }, [loading, error, lat, lng]);

  return (
    <MapCard ref={containerRef}>
      {loading && (
        <LoadingText>지도를 불러오는 중입니다...</LoadingText>
      )}
      {error && (
        <LoadingText>지도를 불러오는 데 실패했습니다.</LoadingText>
      )}
    </MapCard>
  );
}

const MapCard = styled.div`
  position: relative;
  z-index: 0;
  height: 260px;
  border-radius: 12px;
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
