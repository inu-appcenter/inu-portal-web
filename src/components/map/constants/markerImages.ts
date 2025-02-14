export const imageSources = [
    "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
    "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
];


//학교 건물 호관 마커
import Building_1 from "../../../resources/assets/mapIcons/pin/Building_1.svg";
import Building_2 from "../../../resources/assets/mapIcons/pin/Building_2.svg";
import Building_3 from "../../../resources/assets/mapIcons/pin/Building_3.svg";
import Building_4 from "../../../resources/assets/mapIcons/pin/Building_4.svg";
import Building_5 from "../../../resources/assets/mapIcons/pin/Building_5.svg";
import Building_6 from "../../../resources/assets/mapIcons/pin/Building_6.svg";
import Building_7 from "../../../resources/assets/mapIcons/pin/Building_7.svg";
import Building_8 from "../../../resources/assets/mapIcons/pin/Building_8.svg";
import Building_9 from "../../../resources/assets/mapIcons/pin/Building_9.svg";
import Building_10 from "../../../resources/assets/mapIcons/pin/Building_10.svg";
import Building_11 from "../../../resources/assets/mapIcons/pin/Building_11.svg";
import Building_12 from "../../../resources/assets/mapIcons/pin/Building_12.svg";
import Building_13 from "../../../resources/assets/mapIcons/pin/Building_13.svg";
import Building_14 from "../../../resources/assets/mapIcons/pin/Building_14.svg";
import Building_15 from "../../../resources/assets/mapIcons/pin/Building_15.svg";
import Building_16 from "../../../resources/assets/mapIcons/pin/Building_16.svg";
import Building_17 from "../../../resources/assets/mapIcons/pin/Building_17.svg";
import Building_18_1 from "../../../resources/assets/mapIcons/pin/Building_18_1.svg";
import Building_18_2 from "../../../resources/assets/mapIcons/pin/Building_18_2.svg";
import Building_18_3 from "../../../resources/assets/mapIcons/pin/Building_18_3.svg";
import Building_19 from "../../../resources/assets/mapIcons/pin/Building_19.svg";
import Building_20 from "../../../resources/assets/mapIcons/pin/Building_20.svg";
import Building_21 from "../../../resources/assets/mapIcons/pin/Building_21.svg";
import Building_22 from "../../../resources/assets/mapIcons/pin/Building_22.svg";
import Building_23 from "../../../resources/assets/mapIcons/pin/Building_23.svg";
import Building_24 from "../../../resources/assets/mapIcons/pin/Building_24.svg";
import Building_25 from "../../../resources/assets/mapIcons/pin/Building_25.svg";
import Building_26 from "../../../resources/assets/mapIcons/pin/Building_26.svg";
import Building_27 from "../../../resources/assets/mapIcons/pin/Building_27.svg";
import Building_28 from "../../../resources/assets/mapIcons/pin/Building_28.svg";
import Building_29 from "../../../resources/assets/mapIcons/pin/Building_29.svg";
import Building_30 from "../../../resources/assets/mapIcons/pin/Building_30.svg";
import Building_A from "../../../resources/assets/mapIcons/pin/Building_A.svg";
import Building_B from "../../../resources/assets/mapIcons/pin/Building_B.svg";


// 호관 번호에 따른 이미지 매핑
const buildingImages: { [key: string]: string } = {
    "1호관": Building_1,
    "2호관": Building_2,
    "3호관": Building_3,
    "4호관": Building_4,
    "5호관": Building_5,
    "6호관": Building_6,
    "7호관": Building_7,
    "8호관": Building_8,
    "9호관": Building_9,
    "10호관": Building_10,
    "11호관": Building_11,
    "12호관": Building_12,
    "13호관": Building_13,
    "14호관": Building_14,
    "15호관": Building_15,
    "16호관": Building_16,
    "17호관": Building_17,
    "18-1호관": Building_18_1,
    "18-2호관": Building_18_2,
    "18-3호관": Building_18_3,
    "19호관": Building_19,
    "20호관": Building_20,
    "21호관": Building_21,
    "22호관": Building_22,
    "23호관": Building_23,
    "24호관": Building_24,
    "25호관": Building_25,
    "26호관": Building_26,
    "27호관": Building_27,
    "28호관": Building_28,
    "29호관": Building_29,
    "30호관": Building_30,
    "미추홀별관A동": Building_A,
    "미추홀별관B동": Building_B,
};

// 특정 호관의 이미지를 가져오는 함수
export function getBuildingIcon(buildingName: string): string {
    if (buildingName === undefined) {
        return imageSources[0];
    }
    return buildingImages[buildingName];
}


//휴게실 마커
import womanRest from "../../../resources/assets/mapIcons/womanRest.svg";
import manRest from "../../../resources/assets/mapIcons/manRest.svg";
import publicRest from "../../../resources/assets/mapIcons/publicRest.svg";

export const getRestIcon = (restCategory: string): string => {
    if (restCategory === "남자휴게실") {
        return manRest;
    } else if (restCategory === "여자휴게실") {
        return womanRest;
    } else if (restCategory === "남녀공용 휴게실") {
        return publicRest;
    } else {
        return imageSources[0];
    }
}


//카페 마커
export {default as CafeIcon} from "../../../resources/assets/mapIcons/CafeIcon.svg";


//식당 마커
import RestaurantIcon from "../../../resources/assets/mapIcons/restaurantIcon.svg";
import ConvenienceStoreIcon from "../../../resources/assets/mapIcons/convenienceStoreIcon.svg";

export function getRestaurantIcon(restaurantCategory: string): string {
    if (restaurantCategory === "식당") {
        return RestaurantIcon;
    } else if (restaurantCategory === "편의점") {
        return ConvenienceStoreIcon;
    } else {
        return imageSources[0];
    }
}