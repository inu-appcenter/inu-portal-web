import type { BusData, BusStopData, LatLng } from "@/types/bus";

export type BusInfoType = "go-school" | "go-home";

export interface BusMapBusSection {
  id: string;
  label?: string;
  buses: BusData[];
}

export interface BusMapStop extends BusStopData {
  bstopId?: string;
  supportsLiveArrival: boolean;
  buses: BusData[];
  busSections: BusMapBusSection[];
}

export interface BusMapTabConfig {
  label: string;
  stopIds: string[];
  defaultStopId: string;
}

export interface BusMapPageConfig {
  title: string;
}

const BUS_MAP_PAGE_CONFIG: Record<BusInfoType, BusMapPageConfig> = {
  "go-school": {
    title: "학교 갈래요",
  },
  "go-home": {
    title: "집 갈래요",
  },
};

export const BUS_MAP_FALLBACK_COORD: LatLng = {
  lat: 37.374474020920864,
  lng: 126.63361466845616,
};

export function getBusMapPageConfig(type: string | null): BusMapPageConfig | null {
  if (type === "go-school" || type === "go-home") {
    return BUS_MAP_PAGE_CONFIG[type];
  }

  return null;
}
