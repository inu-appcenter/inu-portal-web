import axiosInstance from "@/apis/axiosInstance";

export interface BusArrivalItem {
  ARRIVALESTIMATETIME: string;
  BSTOPID: string;
  BUSID: string;
  BUS_NUM_PLATE: string;
  CONGESTION: string;
  DIRCD: string;
  LASTBUSYN: string;
  LATEST_STOP_ID: string;
  LATEST_STOP_NAME: string;
  LOW_TP_CD: string;
  REMAIND_SEAT: string;
  REST_STOP_COUNT: string;
  ROUTEID: string;
  routeNo?: string;
  estimatedArrivalSeconds?: number;
  estimationNotice?: string;
}

export async function getBusArrival(bstopId: string): Promise<BusArrivalItem[]> {
  try {
    const response = await axiosInstance.get("/api/buses/arrivals", {
      params: { bstopId },
    });

    const dataList = response.data?.data ?? [];
    return dataList.map((item: any) => ({
      ARRIVALESTIMATETIME: String(item.arrivalEstimateTime ?? ""),
      BSTOPID: String(item.bstopId ?? ""),
      BUSID: String(item.busId ?? ""),
      BUS_NUM_PLATE: String(item.busNumPlate ?? ""),
      CONGESTION: String(item.congestion ?? ""),
      DIRCD: String(item.dircd ?? ""),
      LASTBUSYN: String(item.lastBusYn ?? ""),
      LATEST_STOP_ID: String(item.latestStopId ?? ""),
      LATEST_STOP_NAME: String(item.latestStopName ?? ""),
      LOW_TP_CD: String(item.lowTpCd ?? ""),
      REMAIND_SEAT: String(item.remaindSeat ?? ""),
      REST_STOP_COUNT: String(item.restStopCount ?? ""),
      ROUTEID: String(item.routeId ?? ""),
      routeNo: item.routeNo,
      estimatedArrivalSeconds: item.estimatedArrivalSeconds,
      estimationNotice: item.estimationNotice,
    }));
  } catch (error) {
    console.error("버스 도착 정보 백엔드 API 요청 실패", error);
    return [];
  }
}

export async function getBusHistory(bstopId: string, targetDate?: string) {
  try {
    const response = await axiosInstance.get("/api/buses/history", {
      params: { bstopId, targetDate },
    });
    return response.data?.data ?? null;
  } catch (error) {
    console.error("버스 과거 도착 이력 API 요청 실패", error);
    return null;
  }
}

export async function getBusRoutes(category?: string) {
  try {
    const response = await axiosInstance.get("/api/buses/routes", {
      params: { category },
    });
    return response.data?.data ?? [];
  } catch (error) {
    console.error("동적 버스 노선 API 요청 실패", error);
    return [];
  }
}

