import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBusArrival } from "@/apis/busArrival";
import { convertStatus, toTime } from "@/components/mobile/bus/busArrivalUtils";
import type { BusData } from "@/types/bus";

export default function useBusArrival(
  bstopId: string,
  busList: BusData[],
  enabled: boolean = true,
) {
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
    enabled: enabled && !!bstopId && stableBusList.length > 0,
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

      const candidates = data.filter((item) => {
        const seconds = Number(item.ARRIVALESTIMATETIME);
        return item.BSTOPID === bstopId.trim() &&
          item.ROUTEID === bus.routeId &&
          item.ARRIVALESTIMATETIME.trim() !== "" &&
          Number.isFinite(seconds) && seconds >= 0;
      });
      const remaining = (item: (typeof data)[number]) =>
        Number(item.ARRIVALESTIMATETIME) - Math.max(0,
          (Date.now() - (item.observedAt ?? dataUpdatedAt)) / 1000);
      const match = candidates
        .filter((item) => remaining(item) >= 0)
        .sort((a, b) => remaining(a) - remaining(b))[0];

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

      const isEstimated =
        (match as any).latestStopName === "시간표 기반" ||
        match.LATEST_STOP_NAME === "시간표 기반" ||
        (match as any).estimationNotice === "시간표 기반" ||
        Boolean((match as any).estimatedArrivalSeconds);

      const rawSeconds = Number(
        (match as any).arrivalEstimateTime ??
          match.ARRIVALESTIMATETIME ??
          (match as any).estimatedArrivalSeconds,
      );
      const observedAt = match.observedAt ?? dataUpdatedAt;
      const elapsedSeconds = observedAt
        ? Math.max(0, Math.floor((Date.now() - observedAt) / 1000))
        : 0;
      const seconds = Math.max(0, rawSeconds - elapsedSeconds);

      if (isEstimated) {
        return {
          ...bus,
          arrivalInfo: {
            time: toTime(seconds),
            seconds,
            station: "시간표 기반",
            status: "보통" as const,
            isLastBus: false,
          },
        };
      }

      return {
        ...bus,
        arrivalInfo: {
          time: toTime(seconds),
          seconds,
          station: match.REST_STOP_COUNT.trim() ? `${match.REST_STOP_COUNT} 전` : undefined,
          status: convertStatus(match.CONGESTION),
          isLastBus: match.LASTBUSYN === "1",
          restCount: match.REST_STOP_COUNT.trim() !== "" && Number.isFinite(Number(match.REST_STOP_COUNT))
            ? Number(match.REST_STOP_COUNT) : undefined,
        },
      };
    });

    setBusArrivalList(updated);
    setLastUpdated(dataUpdatedAt ? new Date(dataUpdatedAt) : new Date());
  }, [data, dataUpdatedAt, stableBusList, bstopId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBusArrivalList((prev) =>
        prev.map((bus) => {
          const info = bus.arrivalInfo;

          if (!info || typeof info.seconds !== "number" || info.seconds <= 0) {
            return bus;
          }

          const nextSeconds = info.seconds - 1;

          if (nextSeconds <= 0) {
            return {
              ...bus,
              arrivalInfo: { time: "도착정보 없음", seconds: 0, isLastBus: false },
            };
          }

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
