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

      const path: LatLng[] = validStops.map((s: any) => ({
        lat: s.latitude,
        lng: s.longitude,
      }));

      const stopMarker = validStops.map((s: any) => ({
        name: s.bstopName,
        lat: s.latitude,
        lng: s.longitude,
      }));

      const firstStopCoord: LatLng = validStops.length > 0
        ? { lat: validStops[0].latitude, lng: validStops[0].longitude }
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
