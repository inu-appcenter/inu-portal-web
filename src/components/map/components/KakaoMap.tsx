import React, { useEffect, useRef, useState } from "react";
import { places, restPlaces } from "../DB";
import { zoomIn, zoomOut, setMapType } from "../utils/mapUtils";
import { placesMarkDB, deleteMarkers } from "../utils/markerUtils";
import { imageSources } from "../constants/markerImages.ts";
import "./KakaoMap.css";
import { useLocation } from "react-router-dom";

interface Props {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
  viewXY: { X: number; Y: number };
}

let markers: any[] = []; // any 타입 명시

const KakaoMap = ({
  selectedTab,
  setSelectedTab, // , viewXY
}: Props) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [level, setLevel] = useState<number>(3);
  setSelectedTab; //빨간줄 제거용..

  useEffect(() => {
    if (selectedTab === "학교") {
      deleteMarkers(markers);
      placesMarkDB(places, imageSources[1], 1, map, markers);
    } else if (selectedTab === "휴게실") {
      deleteMarkers(markers);
      placesMarkDB(restPlaces, imageSources[1], 1, map, markers);
    } else if (selectedTab === "카페") {
    } else if (selectedTab === "식당") {
    }
  }, [selectedTab]);

  level; //빨간줄 방지용..

  //지도 화면 깨짐 문제 해결용
  const location = useLocation(); // 현재 URL 경로 정보를 가져옴
  useEffect(() => {
    if (
      (location.pathname === "/m/home/campus" ||
        location.pathname === "/app/home/campus") &&
      window.kakao &&
      mapContainer.current
    ) {
      const options = {
        center: new window.kakao.maps.LatLng(
          37.374474020920864,
          126.63361466845616
        ),
        level: 4,
      };

      setTimeout(() => {
        const kakaoMap = new window.kakao.maps.Map(
          mapContainer.current,
          options
        );
        setMap(kakaoMap);
      }, 100);
    }
  }, [location.pathname]); // location.pathname이 변경될 때마다 실행
  placesMarkDB(places, imageSources[1], 1, map, markers);

  return (
    <div id="map" className="map_wrap" ref={mapContainer}>
      {/* 지도타입 컨트롤 div */}
      <div className="custom_typecontrol radius_border">
        <span
          id="btnRoadmap"
          className="selected_btn"
          onClick={() => setMapType(map, "roadmap")}
        >
          지도
        </span>
        <span
          id="btnSkyview"
          className="btn"
          onClick={() => setMapType(map, "skyview")}
        >
          스카이뷰
        </span>
      </div>
      {/* 지도 확대, 축소 컨트롤 div */}
      <div className="custom_zoomcontrol radius_border">
        <span onClick={() => zoomIn(map, setLevel)}>
          <img
            src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/ico_plus.png"
            alt="확대"
          />
        </span>
        <span onClick={() => zoomOut(map, setLevel)}>
          <img
            src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/ico_minus.png"
            alt="축소"
          />
        </span>
      </div>
    </div>
  );
};

export default KakaoMap;
