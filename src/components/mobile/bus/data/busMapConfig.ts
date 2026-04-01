import type { BusData, BusStopData, LatLng } from "@/types/bus";
import { BusStopDummy } from "@/components/mobile/bus/data/BusStopDummy";
import {
  goHome_Dorm1,
  goHome_Dorm2,
  goHome_Engineering_BIT,
  goHome_Engineering_INU,
  goHome_Engineering_IntercityBuses,
  goHome_MainIn,
  goHome_MainOut,
  goHome_Nature_BIT,
  goHome_Nature_IntercityBuses,
  goHome_Nature_INU,
  goSchool_BIT3,
  goSchool_INU1,
  goSchool_INU2,
  goSchool_LOTTEMALL,
} from "@/components/mobile/bus/data/BusDummy";

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

interface BusMapTabConfig {
  label: string;
  stopIds: string[];
  defaultStopId: string;
}

interface BusMapPageConfig {
  title: string;
  tabs: BusMapTabConfig[];
}

const stopLookup = new Map(BusStopDummy.map((stop) => [stop.id, stop]));

const stopBusSections: Record<string, BusMapBusSection[]> = {
  "go-school-INU2": [
    {
      id: "go-school-INU2-default",
      buses: goSchool_INU2,
    },
  ],
  "go-school-INU1": [
    {
      id: "go-school-INU1-default",
      buses: goSchool_INU1,
    },
  ],
  "go-school-LOTTEMALL": [
    {
      id: "go-school-LOTTEMALL-default",
      buses: goSchool_LOTTEMALL,
    },
  ],
  "go-school-BIT3": [
    {
      id: "go-school-BIT3-default",
      buses: goSchool_BIT3,
    },
  ],
  "go-home-main-out": [
    {
      id: "go-home-main-out-inu1",
      label: "인입 1번 출구행",
      buses: goHome_MainOut,
    },
  ],
  "go-home-main-in": [
    {
      id: "go-home-main-in-inu1",
      label: "인입 1번 출구행",
      buses: goHome_MainIn,
    },
  ],
  "go-home-science": [
    {
      id: "go-home-science-inu1",
      label: "인입 1번 출구행",
      buses: goHome_Nature_INU,
    },
    {
      id: "go-home-science-bit",
      label: "지식정보단지역행",
      buses: goHome_Nature_BIT,
    },
    {
      id: "go-home-science-intercitybuses",
      label: "광역버스",
      buses: goHome_Nature_IntercityBuses,
    },
  ],
  "go-home-engineering": [
    {
      id: "go-home-engineering-inu1",
      label: "인입 1번출구행",
      buses: goHome_Engineering_INU,
    },
    {
      id: "go-home-engineering-bit",
      label: "지식정보단지역행",
      buses: goHome_Engineering_BIT,
    },
    {
      id: "go-home-engineering-intercitybuses",
      label: "광역버스",
      buses: goHome_Engineering_IntercityBuses,
    },
  ],
  "go-home-dorm": [
    {
      id: "go-home-dorm-inu1",
      label: "인입 1번 출구행",
      buses: goHome_Dorm1,
    },
    {
      id: "go-home-dorm-inu2",
      label: "인입 2번 출구행",
      buses: goHome_Dorm2,
    },
  ],
};

const stopApiIds: Record<string, string | undefined> = {
  "go-school-INU2": "164000395",
  "go-school-INU1": "164000396",
  "go-school-LOTTEMALL": "164000648",
  "go-school-BIT3": "164000403",
  "go-home-main-out": "164000385",
  "go-home-main-in": "164000386",
  "go-home-science": "164000378",
  "go-home-engineering": "164000377",
  "go-home-dorm": "164000751",
};

export const BUS_MAP_PAGE_CONFIG: Record<BusInfoType, BusMapPageConfig> = {
  "go-school": {
    title: "학교 갈래요",
    tabs: [
      {
        label: "인입런",
        stopIds: ["go-school-INU2", "go-school-INU1", "go-school-LOTTEMALL"],
        defaultStopId: "go-school-INU2",
      },
      {
        label: "지정단런",
        stopIds: ["go-school-BIT3"],
        defaultStopId: "go-school-BIT3",
      },
    ],
  },
  "go-home": {
    title: "집 갈래요",
    tabs: [
      {
        label: "인천대 정문",
        stopIds: ["go-home-main-out", "go-home-main-in"],
        defaultStopId: "go-home-main-out",
      },
      {
        label: "공대/자연대",
        stopIds: ["go-home-science", "go-home-engineering"],
        defaultStopId: "go-home-science",
      },
      {
        label: "기숙사 앞",
        stopIds: ["go-home-dorm"],
        defaultStopId: "go-home-dorm",
      },
    ],
  },
};

export const BUS_MAP_FALLBACK_COORD: LatLng = {
  lat: 37.374474020920864,
  lng: 126.63361466845616,
};

export function getBusMapPageConfig(type: string | null) {
  if (type === "go-school" || type === "go-home") {
    return BUS_MAP_PAGE_CONFIG[type];
  }

  return null;
}

export function getBusMapTabs(type: string | null) {
  return getBusMapPageConfig(type)?.tabs ?? [];
}

export function getBusMapStopById(stopId: string | null): BusMapStop | null {
  if (!stopId) {
    return null;
  }

  const stop = stopLookup.get(stopId);

  if (!stop) {
    return null;
  }

  const busSections = stopBusSections[stopId] ?? [];
  const buses = busSections.flatMap((section) => section.buses);
  const bstopId = stopApiIds[stopId];

  return {
    ...stop,
    buses,
    busSections,
    bstopId,
    supportsLiveArrival: Boolean(bstopId && buses.length > 0),
  };
}

export function getBusMapStops(stopIds: string[]) {
  return stopIds
    .map((stopId) => getBusMapStopById(stopId))
    .filter((stop): stop is BusMapStop => stop !== null);
}
