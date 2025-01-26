import React, {useEffect, useRef, useState} from "react";
import {places} from "../DB";
import {zoomIn, zoomOut, displayLevel, setMapType} from "../utils/mapUtils";
import {placesMarkDB} from "../utils/markerUtils";
import {imageSources} from "../constants/markerImages.ts";
import "./KakaoMap.css";

const KakaoMap: React.FC = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [level, setLevel] = useState<number>(3);

    level;

    useEffect(() => {
        if (window.kakao && mapContainer.current) {
            const options = {
                center: new window.kakao.maps.LatLng(
                    37.374474020920864,
                    126.63361466845616
                ),
                level: 3,
            };

            const kakaoMap = new window.kakao.maps.Map(mapContainer.current, options);
            setMap(kakaoMap);
            displayLevel(kakaoMap, setLevel);
        }
    }, []);
    placesMarkDB(places, imageSources[1], 1, map);

    return (
        <div style={{width: "100%"}}>
            <div className="map_wrap">
                <div
                    id="map"
                    ref={mapContainer}
                    style={{width: "100%", height: "100%", position: "relative", overflow: "hidden"}}
                ></div>
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
        </div>
    );
};

export default KakaoMap;
