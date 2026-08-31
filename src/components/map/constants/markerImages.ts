import {
  cafe as CafeIcon,
  convenienceStore as ConvenienceStoreIcon,
  manRestroom as manRest,
  publicRestroom as publicRest,
  restaurant as RestaurantIcon,
  womanRestroom as womanRest,
} from "@/resources/assets/illustrations/map/markers";
import { BUILDING_PINS } from "@/resources/assets/illustrations/map/pins";

export const imageSources = [
  "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
  "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
];

// 특정 호관의 이미지를 가져오는 함수
export function getBuildingIcon(buildingName: string): string {
  if (buildingName === undefined) {
    return imageSources[0];
  }
  return BUILDING_PINS[buildingName as keyof typeof BUILDING_PINS];
}

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
};

export { CafeIcon };

export function getRestaurantIcon(restaurantCategory: string): string {
  if (restaurantCategory === "식당") {
    return RestaurantIcon;
  } else if (restaurantCategory === "편의점") {
    return ConvenienceStoreIcon;
  } else {
    return imageSources[0];
  }
}
