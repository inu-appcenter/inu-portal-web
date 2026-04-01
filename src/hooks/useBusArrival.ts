import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBusArrival } from "@/apis/busArrival";
import { convertStatus, toTime } from "@/components/mobile/bus/busArrivalUtils";
import type { BusData } from "@/types/bus";

export default function useBusArrival(bstopId: string, busList: BusData[]) {
  const [busArrivalList, setBusArrivalList] = useState<BusData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const busKey = useMemo(
    () => busList.map((bus) => bus.routeId ?? bus.id).join(","),
    [busList],
  );
  const busListIdentityKey = useMemo(
    () =>
      busList
        .map((bus) =>
          [
            bus.routeId ?? "",
            bus.id,
            bus.stopId ?? "",
            bus.sectionLabel ?? "",
            bus.routeNotice ?? "",
            bus.route.join(">"),
          ].join("|"),
        )
        .join(","),
    [busList],
  );
  const stableBusList = useMemo(() => busList, [busListIdentityKey]);

  const { data, dataUpdatedAt, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["busArrival", bstopId, busKey],
    queryFn: () => getBusArrival(bstopId),
    refetchInterval: 30 * 1000,
    staleTime: 30 * 1000,
    enabled: !!bstopId && stableBusList.length > 0,
  });

  useEffect(() => {
    setBusArrivalList([]);
    setLastUpdated(new Date());
  }, [bstopId, busListIdentityKey]);

  useEffect(() => {
    if (!data) {
      return;
    }

    const updated = stableBusList.map((bus) => {
      if (!bus.routeId) {
        return bus;
      }

      const match = data.find((item) => item.ROUTEID === bus.routeId);

      if (!match) {
        return {
          ...bus,
          arrivalInfo: {
            time: "도착정보 없음",
            seconds: 0,
            isLastBus: false,
          },
        };
      }

      const rawSeconds = Number(match.ARRIVALESTIMATETIME);
      const elapsedSeconds = dataUpdatedAt
        ? Math.max(0, Math.floor((Date.now() - dataUpdatedAt) / 1000))
        : 0;
      const seconds = Math.max(0, rawSeconds - elapsedSeconds);

      return {
        ...bus,
        arrivalInfo: {
          time: toTime(seconds),
          seconds,
          station: `${match.REST_STOP_COUNT} 전`,
          status: convertStatus(match.CONGESTION),
          isLastBus: match.LASTBUSYN === "1",
          restCount: Number(match.REST_STOP_COUNT),
        },
      };
    });

    setBusArrivalList(updated);
    setLastUpdated(dataUpdatedAt ? new Date(dataUpdatedAt) : new Date());
  }, [data, dataUpdatedAt, stableBusList]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBusArrivalList((prev) =>
        prev.map((bus) => {
          const info = bus.arrivalInfo;

          if (!info || typeof info.seconds !== "number" || info.seconds <= 0) {
            return bus;
          }

          const nextSeconds = info.seconds - 1;

          return {
            ...bus,
            arrivalInfo: {
              ...info,
              seconds: nextSeconds,
              time: toTime(nextSeconds),
            },
          };
        }),
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const handleManualRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    busArrivalList,
    isLoading: isLoading && busArrivalList.length === 0,
    isFetching,
    refetch: handleManualRefetch,
    lastUpdated,
  };
}
