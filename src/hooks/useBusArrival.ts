import { useEffect, useMemo, useState, useCallback } from "react";
import { getBusArrival } from "@/apis/busArrival";
import { BusData } from "@/types/bus.ts";
import { convertStatus, toTime } from "@/components/mobile/bus/busArrivalUtils";
import { useQuery } from "@tanstack/react-query";

export default function useBusArrival(bstopId: string, busList: BusData[]) {
  const [busArrivalList, setBusArrivalList] = useState<BusData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const busKey = useMemo(
    () => busList.map((bus) => bus.routeId).join(","),
    [busList],
  );

  // React Query를 이용한 데이터 페칭 (60초 간격 자동 갱신)
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["busArrival", bstopId],
    queryFn: () => getBusArrival(bstopId),
    refetchInterval: 60 * 1000, // 60초 자동 갱신
    staleTime: 30 * 1000, // 30초 동안은 신선한 데이터로 간주
    enabled: !!bstopId && busList.length > 0,
  });

  // API 데이터가 들어오거나 갱신될 때 로컬 상태 업데이트
  useEffect(() => {
    if (!data) return;

    const updated = busList.map((bus) => {
      if (!bus.routeId) return bus;
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
      const seconds = Number(match.ARRIVALESTIMATETIME);

      return {
        ...bus,
        arrivalInfo: {
          time: toTime(seconds),
          seconds,
          station: `${match.REST_STOP_COUNT}번째 전`,
          status: convertStatus(match.CONGESTION),
          isLastBus: match.LASTBUSYN === "1",
          restCount: Number(match.REST_STOP_COUNT),
        },
      };
    });

    setBusArrivalList(updated);
    setLastUpdated(new Date());
  }, [data, busKey]); // busList 대신 안정적인 busKey 사용

  // 초 단위 카운트다운 (사용자 요청 유지)
  useEffect(() => {
    const timer = setInterval(() => {
      setBusArrivalList((prev) =>
        prev.map((bus) => {
          const info = bus.arrivalInfo;
          if (!info || typeof info.seconds !== "number" || info.seconds <= 0) {
            return bus;
          }
          const s = info.seconds - 1;
          return {
            ...bus,
            arrivalInfo: {
              ...info,
              seconds: s,
              time: toTime(s),
            },
          };
        }),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  return { 
    busArrivalList, 
    isLoading: isLoading && busArrivalList.length === 0, // 초기 로딩만 표시
    isFetching,
    refetch: handleManualRefetch,
    lastUpdated 
  };
}
