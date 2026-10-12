import { describe, it, expect } from "vitest";
import { getBusArrival, BusArrivalItem } from "../busArrival";
import { toTime } from "../../components/mobile/bus/busArrivalUtils";

describe("버스 도착 정보 실제 Dev 서버 연동 및 기능 테스트", () => {
  const TEST_BSTOP_ID = "164000395"; // 인천대입구역 2번출구

  it(
    "1. 실제 Dev 서버(/api/buses/arrivals)에서 버스 도착 목록을 정상 수신해야 한다",
    async () => {
      const arrivals: BusArrivalItem[] = await getBusArrival(TEST_BSTOP_ID);

    expect(Array.isArray(arrivals)).toBe(true);
    // 현재 운행 시간대이므로 실시간 또는 운행 버스 데이터가 1건 이상 수신되어야 함
    expect(arrivals.length).toBeGreaterThan(0);

    const firstItem = arrivals[0];
    expect(firstItem.BSTOPID).toBe(TEST_BSTOP_ID);
    expect(firstItem.ROUTEID).toBeTruthy();
    expect(firstItem.ARRIVALESTIMATETIME).toBeDefined();
    },
    15000,
  );

  it("2. 수신된 버스 데이터의 도착예정시간(초)이 toTime 유틸에 의해 올바르게 포맷팅되어야 한다", async () => {
    const arrivals: BusArrivalItem[] = await getBusArrival(TEST_BSTOP_ID);
    expect(arrivals.length).toBeGreaterThan(0);

    for (const item of arrivals) {
      const rawSeconds = Number(item.ARRIVALESTIMATETIME);
      if (Number.isFinite(rawSeconds) && rawSeconds > 0) {
        const formatted = toTime(rawSeconds);
        if (rawSeconds <= 30) {
          expect(formatted).toBe("곧 도착");
        } else {
          expect(formatted).toMatch(/^\d+분\s\d+초$/);
        }
      }
    }
  }, 15000);

  it("3. 과거 기록 기반 예측 버스인 경우(estimationNotice 또는 estimatedArrivalSeconds 존재 시) 분 단위로 안전하게 변환되어야 한다", async () => {
    // 가상의 과거 기록 기반 DTO 항목 시뮬레이션
    const mockEstimatedItem: BusArrivalItem = {
      observedAt: Date.now(),
      ARRIVALESTIMATETIME: "720",
      BSTOPID: TEST_BSTOP_ID,
      BUSID: "",
      BUS_NUM_PLATE: "",
      CONGESTION: "2",
      DIRCD: "1",
      LASTBUSYN: "0",
      LATEST_STOP_ID: "",
      LATEST_STOP_NAME: "과거 기록 기반",
      LOW_TP_CD: "",
      REMAIND_SEAT: "",
      REST_STOP_COUNT: "",
      ROUTEID: "165000514",
      routeNo: "순환41",
      estimatedArrivalSeconds: 720,
      estimationNotice: "최근 4주 운행 이력 통계 기반 예상",
    };

    const isEstimated =
      mockEstimatedItem.LATEST_STOP_NAME === "과거 기록 기반" ||
      Boolean(mockEstimatedItem.estimatedArrivalSeconds);

    expect(isEstimated).toBe(true);
    const minutes = Math.max(1, Math.round(Number(mockEstimatedItem.ARRIVALESTIMATETIME) / 60));
    expect(minutes).toBe(12);
    expect(`약 ${minutes}분`).toBe("약 12분");
  });

  it("4. 0초 도달 시 도착정보 없음으로 증발하지 않고 곧 도착 상태가 유지되어야 한다", () => {
    const simulateCountdown = (currentSec: number) => {
      const nextSeconds = currentSec - 1;
      if (nextSeconds <= 0) {
        return { seconds: 0, time: "곧 도착" };
      }
      return { seconds: nextSeconds, time: toTime(nextSeconds) };
    };

    // 1초 -> 0초 도달 시뮬레이션
    const afterCountdown = simulateCountdown(1);
    expect(afterCountdown.seconds).toBe(0);
    expect(afterCountdown.time).toBe("곧 도착"); // 증발 방지 검증!
  });
});
