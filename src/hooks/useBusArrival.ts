import { useEffect, useState, useMemo } from "react";
import { getBusArrival } from "@/apis/busArrival";
import { BusData } from "@/types/bus.ts";
import { toTime, convertStatus } from "@/components/mobile/bus/busArrivalUtils";

export default function useBusArrival(bstopId: string, busList: BusData[]) {
  const [busArrivalList, setBusArrivalList] = useState<BusData[]>([]);

  const busKey = useMemo(
    () => busList.map((bus) => bus.routeId).join(","),
    [busList],
  );

  const fetchData = async () => {
    const data = await getBusArrival(bstopId);
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
  };

  // 2분 간격으로 새로고침
  useEffect(() => {
    if (!bstopId || busList.length === 0) return;
    fetchData();
    const interval = setInterval(fetchData, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [bstopId, busKey]);

  // 화면에서 1초씩 줄어듦
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

  return busArrivalList;
}
