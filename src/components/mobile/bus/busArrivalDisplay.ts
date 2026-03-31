import type { ArrivalInfo, DynamicArrivalStation } from "@/types/bus";

const DYNAMIC_STATION_TEXT: Record<DynamicArrivalStation, string> = {
  "weekday-morning-shuttle": "평일 아침 셔틀",
};

export function getArrivalStationText(arrivalInfo?: ArrivalInfo | null) {
  if (!arrivalInfo) {
    return "";
  }

  if (arrivalInfo.station) {
    return arrivalInfo.station;
  }

  if (arrivalInfo.dynamicStation) {
    return DYNAMIC_STATION_TEXT[arrivalInfo.dynamicStation] ?? "";
  }

  return "";
}
