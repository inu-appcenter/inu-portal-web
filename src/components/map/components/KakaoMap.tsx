import React, { useMemo } from "react";
import { Map, MapTypeControl, MapMarker } from "react-kakao-maps-sdk";
import { cafePlaces, places, restaurantPlaces, restPlaces } from "../DB";
import { MAP_TAB_CONFIG, TabType } from "../constants/mapConfig";

interface Props {
  selectedTab: string;
  viewXY: { X: number; Y: number };
  setMap: any;
  openedMarkerId: string | null;
  setOpenedMarkerId: (id: string | null) => void;
}

const KakaoMap = ({
  selectedTab,
  viewXY,
  setMap,
  openedMarkerId,
  setOpenedMarkerId,
}: Props) => {
  const currentTab = selectedTab as TabType;
  const config = MAP_TAB_CONFIG[currentTab];

  const placesToRender = useMemo(() => {
    switch (currentTab) {
      case "학교": return places;
      case "휴게실": return restPlaces;
      case "카페": return cafePlaces;
      case "식당": return restaurantPlaces;
      default: return [];
    }
  }, [currentTab]);

  return (
    <Map
      center={{ lat: viewXY.X, lng: viewXY.Y }}
      level={4}
      style={{ width: "100%", height: "100%" }}
      onCreate={(mapInstance) => {
        setMap(mapInstance);
        setTimeout(() => mapInstance.relayout(), 100);
      }}
    >
      {placesToRender.map((place) => {
        const markerId = config.getMarkerId(place);
        const isOpen = openedMarkerId === markerId;

        return (
          <React.Fragment key={markerId}>
            <MapMarker
              position={{ lat: Number(place.latitude), lng: Number(place.longitude) }}
              image={{
                src: config.getIcon(place),
                size: { width: 24, height: 35 },
              }}
              onClick={() => {
                if (isOpen) {
                  setOpenedMarkerId(null);
                } else {
                  setOpenedMarkerId(markerId);
                }
              }}
              infoWindowOptions={{ removable: true }}
            >
              {isOpen && (
                <div
                  style={{ cursor: "default", padding: "5px", color: "#000" }}
                  dangerouslySetInnerHTML={{ __html: config.getInfoWindowHtml(place) }}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </MapMarker>
          </React.Fragment>
        );
      })}
      {window.kakao?.maps && (
        <MapTypeControl position={window.kakao.maps.ControlPosition.TOPRIGHT} />
      )}
    </Map>
  );
};

export default KakaoMap;
