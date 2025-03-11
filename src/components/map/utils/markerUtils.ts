import {Place} from "../DB";
import InfoWindowSchool from "./InfoWindowSchool.ts";
import InfoWindowRestroom from "./InfoWindowRestroom.ts";
import InfoWindowCafe from "./InfoWindowCafe.ts";
import InfoWindowRestaurant from "./InfoWindowRestaurant.ts";

import {getBuildingIcon, getRestIcon, CafeIcon, getRestaurantIcon} from "../constants/markerImages.ts";
import {SchoolimageMap} from "resources/assets/mapBuildingImages/buildingImageManage.ts";
import {CafeimageMap} from "resources/assets/mapCafeImages/cafeImageManage.ts";
import {RestaurantimageMap} from "../../../resources/assets/mapRestaurantImages/restaurantImageManage.ts";
import defaultImage from "../../../resources/assets/mapIcons/defaultImage.png";


export const placesMarkDB = (
    places: Place[],
    selectedTab: string,
    map: any,
    markers: any
) => {
    places.forEach((place) => {
        if (selectedTab === "학교") { //학교 건물 호관
            displayMarker(place, getBuildingIcon(place.location), selectedTab, map, markers);
        } else if (selectedTab === "휴게실") { //휴게실
            displayMarker(place, getRestIcon(place.category), selectedTab, map, markers);
        } else if (selectedTab === "카페") { // 카페
            displayMarker(place, CafeIcon, selectedTab, map, markers);
        } else if (selectedTab === "식당") {
            displayMarker(place, getRestaurantIcon(place.category), selectedTab, map, markers);
        }
    });
};

let currentInfoWindow: any = null;

const displayMarker = (
    place: Place,
    imageSrc: string,
    selectedTab: string,
    map: any,
    markers: any[],
) => {

    const imageSize = new window.kakao.maps.Size(24, 35);
    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);
    const marker = new window.kakao.maps.Marker({
        // map,
        position: new window.kakao.maps.LatLng(place.latitude, place.longitude),
        title: place.place_name,
        image: markerImage,
    });


    //tab별로 infoWindow의 콘텐츠 내용을 다르게 함
    let iwContent;

    if (selectedTab === "학교") {
        iwContent = InfoWindowSchool(place, SchoolimageMap[place.location]);
    } else if (selectedTab === "휴게실") {
        iwContent = InfoWindowRestroom(place);

    } else if (selectedTab === "카페") {
        // @ts-ignore
        iwContent = InfoWindowCafe(place, CafeimageMap[place.cafePlaceInfo?.name]);

    } else if (selectedTab === "식당") {
        // @ts-ignore
        const imageSrc = RestaurantimageMap[place.restaurantInfo?.name] ?? defaultImage;

        iwContent = InfoWindowRestaurant(place, imageSrc);
    }


    const infowindow = new window.kakao.maps.InfoWindow({
        content: iwContent,
        removable: true,
    });

    // 마커 클릭 이벤트에 기존 InfoWindow 닫는 로직 추가
    window.kakao.maps.event.addListener(marker, "click", () => {
        // 현재 열린 InfoWindow가 있다면 닫기
        if (currentInfoWindow) {
            currentInfoWindow.close();
        }

        // 현재 InfoWindow 열기
        infowindow.open(map, marker);

        // 현재 InfoWindow를 업데이트
        currentInfoWindow = infowindow;


    });

    // 마커가 지도 위에 표시되도록 설정합니다
    marker.setMap(map);

    markers.push(marker);

};


// 배열에 추가된 마커들을 지도에 표시하거나 삭제하는 함수입니다
export const deleteMarkers = (markers: any[] | null) => {
    // @ts-ignore
    for (let i = 0; i < markers.length; i++) {
        // @ts-ignore
        markers[i].setMap(null);
    }
    markers = null;
}

export const closeInfoWindow = () => {
    // 현재 열린 InfoWindow가 있다면 닫기
    if (currentInfoWindow) {
        currentInfoWindow.close();
    }
}