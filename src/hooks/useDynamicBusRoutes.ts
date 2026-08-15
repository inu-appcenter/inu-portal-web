import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBusRoutes, getPublicStopAliases } from "@/apis/busArrival";
import type { BusData, LatLng } from "@/types/bus";
import type { BusMapStop, BusMapTabConfig, BusMapBusSection } from "@/components/mobile/bus/data/busMapConfig";

const DEFAULT_INU_COORD: LatLng = {
  lat: 37.375,
  lng: 126.632,
};

const EMPTY_TABS: BusMapTabConfig[] = [];
const EMPTY_STOPS: BusMapStop[] = [];
const EMPTY_RESULT = { tabs: EMPTY_TABS, stops: EMPTY_STOPS };

// TM 중부원점(16만, 43만) 좌표를 WGS84 위경도로 보정하는 클라이언트 헬퍼
function normalizeCoordinate(lat?: number, lng?: number): LatLng {
  if (lat == null || lng == null) return DEFAULT_INU_COORD;

  // 이미 WGS84 좌표계인 경우 (한국 위도 33~39, 경도 124~132)
  if (lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132) {
    return { lat, lng };
  }

  // POSX(경도TM), POSY(위도TM) 형태인 경우
  const x = lng;
  const y = lat;

  const a = 6378137.0;
  const f = 1.0 / 298.257222101;
  const b = a * (1.0 - f);
  const e2 = (a * a - b * b) / (a * a);
  const ePrime2 = (a * a - b * b) / (b * b);
  const lat0 = (38.0 * Math.PI) / 180.0;
  const lng0 = (127.0 * Math.PI) / 180.0;
  const k0 = 1.0;
  const falseE = 200000.0;
  const falseN = 500000.0;

  const x_ = x - falseE;
  const y_ = y - falseN;

  const e4 = e2 * e2;
  const e6 = e4 * e2;
  const M0 =
    a *
    ((1.0 - e2 / 4.0 - (3.0 * e4) / 64.0 - (5.0 * e6) / 256.0) * lat0 -
      ((3.0 * e2) / 8.0 + (3.0 * e4) / 32.0 + (45.0 * e6) / 1024.0) *
        Math.sin(2.0 * lat0) +
      ((15.0 * e4) / 256.0 + (45.0 * e6) / 1024.0) * Math.sin(4.0 * lat0) -
      ((35.0 * e6) / 3072.0) * Math.sin(6.0 * lat0));

  const M = M0 + y_ / k0;
  const mu = M / (a * (1.0 - e2 / 4.0 - (3.0 * e4) / 64.0 - (5.0 * e6) / 256.0));
  const e1 = (1.0 - Math.sqrt(1.0 - e2)) / (1.0 + Math.sqrt(1.0 - e2));
  const J1 = (3.0 * e1) / 2.0 - (27.0 * Math.pow(e1, 3)) / 32.0;
  const J2 = (21.0 * e1 * e1) / 16.0 - (55.0 * Math.pow(e1, 4)) / 32.0;
  const J3 = (151.0 * Math.pow(e1, 3)) / 96.0;
  const J4 = (1097.0 * Math.pow(e1, 4)) / 512.0;

  const fp =
    mu +
    J1 * Math.sin(2.0 * mu) +
    J2 * Math.sin(4.0 * mu) +
    J3 * Math.sin(6.0 * mu) +
    J4 * Math.sin(8.0 * mu);

  const C1 = ePrime2 * Math.pow(Math.cos(fp), 2);
  const T1 = Math.pow(Math.tan(fp), 2);
  const R1 = (a * (1.0 - e2)) / Math.pow(1.0 - e2 * Math.pow(Math.sin(fp), 2), 1.5);
  const N1 = a / Math.sqrt(1.0 - e2 * Math.pow(Math.sin(fp), 2));
  const D = x_ / (N1 * k0);

  const resLat =
    fp -
    ((N1 * Math.tan(fp)) / R1) *
      ((D * D) / 2.0 -
        ((5.0 + 3.0 * T1 + 10.0 * C1 - 4.0 * C1 * C1 - 9.0 * ePrime2) *
          Math.pow(D, 4)) /
          24.0 +
        ((61.0 +
          90.0 * T1 +
          298.0 * C1 +
          45.0 * T1 * T1 -
          252.0 * ePrime2 -
          3.0 * C1 * C1) *
          Math.pow(D, 6)) /
          720.0);

  const resLng =
    lng0 +
    (D -
      ((1.0 + 2.0 * T1 + C1) * Math.pow(D, 3)) / 6.0 +
      ((5.0 - 2.0 * C1 + 28.0 * T1 - 3.0 * C1 * C1 + 8.0 * ePrime2 + 24.0 * T1 * T1) *
        Math.pow(D, 5)) /
        120.0) /
      Math.cos(fp);

  const finalLat = (resLat * 180.0) / Math.PI;
  const finalLng = (resLng * 180.0) / Math.PI;

  if (finalLat >= 33 && finalLat <= 39 && finalLng >= 124 && finalLng <= 132) {
    return { lat: finalLat, lng: finalLng };
  }

  return DEFAULT_INU_COORD;
}

export function useDynamicBusRoutes(type: string | null) {
  const { data: dynamicRoutes, isLoading: isRoutesLoading } = useQuery({
    queryKey: ["busRoutes", type],
    queryFn: () => getBusRoutes(type ?? undefined),
    enabled: !!type,
    staleTime: 2 * 60 * 1000,
  });

  const { data: stopAliases, isLoading: isAliasesLoading } = useQuery({
    queryKey: ["stopAliases"],
    queryFn: () => getPublicStopAliases(),
    staleTime: 5 * 60 * 1000,
  });

  const getDynamicStopNotice = useCallback(
    (bstopId?: string): string | undefined => {
      if (!bstopId || !stopAliases || stopAliases.length === 0) return undefined;
      const aliasObj = stopAliases.find((a: any) => a.bstopId === bstopId);
      return aliasObj?.stopNotice || undefined;
    },
    [stopAliases]
  );

  const getDynamicStopName = useCallback(
    (bstopId?: string, fallbackName?: string): string => {
      if (!bstopId || !stopAliases || stopAliases.length === 0) return fallbackName || "";
      const aliasObj = stopAliases.find((a: any) => a.bstopId === bstopId);
      return aliasObj?.stopAlias || aliasObj?.bstopName || fallbackName || "";
    },
    [stopAliases]
  );

  // 서버 API 데이터(dynamicRoutes + stopAliases)로부터 순수 100% 동적 탭 및 정류소 목록 구성
  const { tabs, stops } = useMemo(() => {
    if (!dynamicRoutes || dynamicRoutes.length === 0) {
      return EMPTY_RESULT;
    }

    const tabMap = new Map<string, { tabName: string; stopIds: Set<string>; defaultStopId?: string }>();
    const stopMap = new Map<string, BusMapStop>();

    for (const route of dynamicRoutes) {
      const tabName = route.tabName || "기본";
      const startBstopId = route.startBstopId || "unknown";
      const stopId = `stop-${startBstopId}`;

      // 1. 탭 집합 구성
      if (!tabMap.has(tabName)) {
        tabMap.set(tabName, {
          tabName,
          stopIds: new Set([stopId]),
          defaultStopId: stopId,
        });
      } else {
        tabMap.get(tabName)!.stopIds.add(stopId);
      }

      // 2. 버스 경로 및 마커 생성
      const validStops = (route.stops || []).filter(
        (s: any) => s.latitude && s.longitude
      );

      const path: LatLng[] = validStops.map((s: any) =>
        normalizeCoordinate(s.latitude, s.longitude)
      );

      const stopMarker = validStops.map((s: any) => {
        const coord = normalizeCoordinate(s.latitude, s.longitude);
        return {
          name: s.bstopName,
          lat: coord.lat,
          lng: coord.lng,
        };
      });

      const firstStopCoord: LatLng = validStops.length > 0
        ? normalizeCoordinate(validStops[0].latitude, validStops[0].longitude)
        : DEFAULT_INU_COORD;


      const routeNames = validStops.map((s: any) => s.bstopName);

      const busData: BusData = {
        id: route.id,
        number: route.routeNo,
        route: routeNames.length > 0 ? routeNames : [route.startBstopName || "", route.endBstopName || ""],
        path,
        stopMarker,
        routeId: route.routeId,
        sectionLabel: route.sectionName,
        stopId,
        lastStopId: route.endBstopId,
        busNotice: route.busNotice,
        routeNotice: route.routeNotice,
        startStopAlias: route.startBstopAlias || tabName,
      };

      // 3. 정류소 데이터 구성
      const stopNotice = getDynamicStopNotice(startBstopId);
      const stopName = getDynamicStopName(startBstopId, route.startBstopAlias || route.startBstopName);

      if (!stopMap.has(stopId)) {
        const busSection: BusMapBusSection = {
          id: `sec-${stopId}`,
          label: stopName,
          buses: [busData],
        };

        stopMap.set(stopId, {
          id: stopId,
          stopName: stopName || "정류소",
          bstopId: startBstopId,
          stopNotice,
          lat: firstStopCoord.lat,
          lng: firstStopCoord.lng,
          busList: [busData.number],
          supportsLiveArrival: true,
          buses: [busData],
          busSections: [busSection],
        });
      } else {
        const existingStop = stopMap.get(stopId)!;
        existingStop.buses.push(busData);
        existingStop.busSections[0].buses.push(busData);
        if (!existingStop.busList.includes(busData.number)) {
          existingStop.busList.push(busData.number);
        }
        if (!existingStop.stopNotice && stopNotice) {
          existingStop.stopNotice = stopNotice;
        }
      }
    }

    const generatedTabs: BusMapTabConfig[] = Array.from(tabMap.values()).map((t) => ({
      label: t.tabName,
      stopIds: Array.from(t.stopIds),
      defaultStopId: t.defaultStopId || Array.from(t.stopIds)[0],
    }));

    const generatedStops: BusMapStop[] = Array.from(stopMap.values());

    return {
      tabs: generatedTabs,
      stops: generatedStops,
    };
  }, [dynamicRoutes, getDynamicStopNotice, getDynamicStopName]);

  return {
    dynamicRoutes,
    stopAliases,
    tabs,
    stops,
    isLoading: isRoutesLoading || isAliasesLoading,
    getDynamicStopNotice,
    getDynamicStopName,
  };
}
