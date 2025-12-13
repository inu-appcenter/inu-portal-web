import { ROUTES } from "@/constants/routes";
import React, { useEffect, useRef, useState } from "react";
import { cafePlaces, places, restaurantPlaces, restPlaces } from "../DB";
import { setMapType, zoomIn, zoomOut } from "../utils/mapUtils";
import { placesMarkDB } from "../utils/markerUtils";
import "./KakaoMap.css";
import { useLocation } from "react-router-dom";

interface Props {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
  viewXY: { X: number; Y: number };
  map: any;
  setMap: any;
  markers: any;
  deleteMarkers: (markers: any[] | null) => void;
}

const KakaoMap = ({
  selectedTab,
  setSelectedTab,
  viewXY,
  map,
  setMap,
  markers,
  deleteMarkers,
}: Props) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState<number>(3);
  setSelectedTab; //빨간줄 제거용..

  useEffect(() => {
    if (selectedTab === "학교") {
      deleteMarkers(markers);
      placesMarkDB(places, selectedTab, map, markers);
    } else if (selectedTab === "휴게실") {
      deleteMarkers(markers);
      placesMarkDB(restPlaces, selectedTab, map, markers);
    } else if (selectedTab === "카페") {
      deleteMarkers(markers);
      placesMarkDB(cafePlaces, selectedTab, map, markers);
    } else if (selectedTab === "식당") {
      deleteMarkers(markers);
      placesMarkDB(restaurantPlaces, selectedTab, map, markers);
    }
  }, [selectedTab]);

  level; //빨간줄 방지용..

  //지도 화면 깨짐 문제 해결용
  const location = useLocation(); // 현재 URL 경로 정보를 가져옴
  useEffect(() => {
    if (
      (location.pathname === ROUTES.BOARD.CAMPUS ||
        location.pathname === ROUTES.BOARD.CAMPUS) &&
      window.kakao &&
      mapContainer.current
    ) {
      const options = {
        center: new window.kakao.maps.LatLng(viewXY.X, viewXY.Y),
        level: 4,
      };

      setTimeout(() => {
        const kakaoMap = new window.kakao.maps.Map(
          mapContainer.current,
          options,
        );
        setMap(kakaoMap);
      }, 100);
    }
  }, [location.pathname]); // location.pathname이 변경될 때마다 실행
  placesMarkDB(places, "학교", map, markers);

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
