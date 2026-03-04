import { Place } from "../DB";
import {
  CafeIcon,
  getBuildingIcon,
  getRestaurantIcon,
  getRestIcon,
} from "./markerImages";
import InfoWindowSchool from "../utils/InfoWindowSchool";
import InfoWindowRestroom from "../utils/InfoWindowRestroom";
import InfoWindowCafe from "../utils/InfoWindowCafe";
import InfoWindowRestaurant from "../utils/InfoWindowRestaurant";
import { SchoolimageMap } from "@/resources/assets/mapBuildingImages/buildingImageManage.ts";
import { CafeimageMap } from "@/resources/assets/mapCafeImages/cafeImageManage.ts";
import { RestaurantimageMap } from "@/resources/assets/mapRestaurantImages/restaurantImageManage";
import defaultImage from "../../../resources/assets/mapIcons/defaultImage.png";

// 지도 중심점 보정값 (마커와 인포윈도우가 한눈에 들어오게 함)
export const MAP_CENTER_OFFSET = 0.001;

export type TabType = "학교" | "휴게실" | "카페" | "식당";

export const MAP_TAB_CONFIG: Record<TabType, {
  getIcon: (place: Place) => string;
  getMarkerId: (place: Place) => string;
  getInfoWindowHtml: (place: Place) => string;
  getPlaceTitle: (place: Place) => string;
}> = {
  학교: {
    getIcon: (p) => getBuildingIcon(p.location),
    getMarkerId: (p) => p.location,
    getInfoWindowHtml: (p) => InfoWindowSchool(p, SchoolimageMap[p.location]),
    getPlaceTitle: (p) => `${p.location} ${p.place_name}`,
  },
  휴게실: {
    getIcon: (p) => getRestIcon(p.category),
    getMarkerId: (p) => p.location + p.restareaInfo?.roomNumber,
    getInfoWindowHtml: (p) => InfoWindowRestroom(p),
    getPlaceTitle: (p) => `${p.place_name} ${p.location} ${p.restareaInfo?.roomNumber || ""}`,
  },
  카페: {
    getIcon: () => CafeIcon,
    getMarkerId: (p) => p.location + (p.cafePlaceInfo?.name || ""),
    getInfoWindowHtml: (p) => {
      // @ts-ignore
      const image = CafeimageMap[p.cafePlaceInfo?.name] || defaultImage;
      return InfoWindowCafe(p, image);
    },
    getPlaceTitle: (p) => p.cafePlaceInfo?.name || "",
  },
  식당: {
    getIcon: (p) => getRestaurantIcon(p.category),
    getMarkerId: (p) => p.location + (p.restaurantInfo?.name || ""),
    getInfoWindowHtml: (p) => {
      // @ts-ignore
      const image = RestaurantimageMap[p.restaurantInfo?.name] || defaultImage;
      return InfoWindowRestaurant(p, image);
    },
    getPlaceTitle: (p) => p.restaurantInfo?.name || "",
  }
};
