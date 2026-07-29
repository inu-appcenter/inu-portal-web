import { useQuery } from "@tanstack/react-query";
import { getBusRoutes } from "@/apis/busArrival";
import type { BusData } from "@/types/bus";

export function useDynamicBusRoutes(type: string | null) {
  const { data: dynamicRoutes = [] } = useQuery({
    queryKey: ["busRoutes", type],
    queryFn: () => getBusRoutes(type ?? undefined),
    enabled: !!type,
    staleTime: 5 * 60 * 1000, // 5분 캐시
  });

  const applyDynamicRoutesToBuses = (buses: BusData[]): BusData[] => {
    if (!dynamicRoutes || dynamicRoutes.length === 0) {
      return buses;
    }

    return buses.map((bus) => {
      const match = dynamicRoutes.find(
        (r: any) =>
          r.routeNo === bus.number || (bus.routeId && r.routeId === bus.routeId),
      );

      if (!match || !match.stops || match.stops.length === 0) {
        return bus;
      }

      const validStops = match.stops.filter(
        (s: any) => s.latitude && s.longitude,
      );

      if (validStops.length === 0) {
        return bus;
      }

      const dynamicPath = validStops.map((s: any) => ({
        lat: s.latitude,
        lng: s.longitude,
      }));

      const dynamicMarkers = validStops.map((s: any) => ({
        name: s.bstopName,
        lat: s.latitude,
        lng: s.longitude,
      }));

      return {
        ...bus,
        path: dynamicPath,
        stopMarker: dynamicMarkers,
        startStopAlias: match.startBstopAlias || match.tabName,
        busNotice: match.busNotice || bus.busNotice,
        routeNotice: match.routeNotice || bus.routeNotice,
      };
    });
  };



  return { dynamicRoutes, applyDynamicRoutesToBuses };
}
