import {Place} from "../DB";
import InfoWindowSchool from "./InfoWindowSchool.ts";
import InfoWindowRestroom from "./InfoWindowRestroom.ts";

export const placesMarkDB = (
    places: Place[],
    imageSrc: string,
    mode: number,
    map: any
) => {
    places.forEach((place) => {
        displayMarker(place, imageSrc, mode, map);
    });
};

let currentInfoWindow: any = null;

const displayMarker = (
    place: Place,
    imageSrc: string,
    mode: number,
    map: any
) => {

    const imageSize = new window.kakao.maps.Size(24, 35);
    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);
    const marker = new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(place.latitude, place.longitude),
        title: place.place_name,
        image: markerImage,
    });


    let iwContent;
    if (mode === 1) {
        iwContent = InfoWindowSchool(place);
    }
    if (mode === 2) {
        iwContent = InfoWindowRestroom(place);

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

};
