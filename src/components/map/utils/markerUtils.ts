import {Place} from "../DB";
import InfoWindowSchool from "./InfoWindowSchool.ts";
import InfoWindowRestroom from "./InfoWindowRestroom.ts";

export const placesMarkDB = (
    places: Place[],
    imageSrc: string,
    mode: number,
    map: any,
    markers: any
) => {
    places.forEach((place) => {
        displayMarker(place, imageSrc, mode, map, markers);
    });
};

let currentInfoWindow: any = null;

const displayMarker = (
    place: Place,
    imageSrc: string,
    mode: number,
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

    // 마커가 지도 위에 표시되도록 설정합니다
    marker.setMap(map);

    markers.push(marker);

};


// 배열에 추가된 마커들을 지도에 표시하거나 삭제하는 함수입니다
export const deleteMarkers = (markers: string | any[]) => {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}