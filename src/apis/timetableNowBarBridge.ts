import type { TimeTableDetailItem } from "@/types/timetables";

export interface TimetableNowBarSettings {
  enabled: boolean;
  leadTimeMinutes: number;
}

export interface BridgeActionResult<T = any> {
  success: boolean;
  data?: T;
  errorMessage?: string;
}

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

/**
 * 모바일 앱(React Native) 환경인지 확인
 */
export function isMobileAppEnvironment(): boolean {
  return typeof window !== "undefined" && Boolean(window.ReactNativeWebView);
}

/**
 * 네이티브 브릿지로 시간표/나우바 메시지를 전송하고 응답을 대기하는 헬퍼
 */
function sendTimetableBridgeAction<T = any>(
  type: string,
  payload?: any,
  timeoutMs = 8000
): Promise<BridgeActionResult<T>> {
  return new Promise((resolve) => {
    if (!isMobileAppEnvironment()) {
      resolve({
        success: false,
        errorMessage: "모바일 앱(INTIP 앱) 환경에서만 지원되는 기능입니다.",
      });
      return;
    }

    const expectedResultType = `${type}Result`;
    const requestId = `req_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    let timer: any;

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail;
      if (!detail) return;

      const isMatch = detail.requestId
        ? detail.requestId === requestId
        : detail.type === expectedResultType;
      if (!isMatch) return;

      clearTimeout(timer);
      window.removeEventListener("intipTimetableResult", handler);
      resolve({
        success: detail.success,
        data: detail.data,
        errorMessage: detail.errorMessage,
      });
    };

    window.addEventListener("intipTimetableResult", handler);

    timer = setTimeout(() => {
      window.removeEventListener("intipTimetableResult", handler);
      resolve({
        success: false,
        errorMessage: "요청 시간이 초과되었습니다.",
      });
    }, timeoutMs);

    window.ReactNativeWebView?.postMessage(
      JSON.stringify({
        type,
        requestId,
        payload,
      })
    );
  });
}

/**
 * 시간표 나우 바 설정 조회
 */
export async function getTimetableNowBarSettings(): Promise<TimetableNowBarSettings | null> {
  const res = await sendTimetableBridgeAction<TimetableNowBarSettings>(
    "getTimetableNowBarSettings"
  );
  return res.success && res.data ? res.data : null;
}

/**
 * 시간표 나우 바 설정 변경 (켜기/끄기, 시작 전 표시 시간)
 */
export async function setTimetableNowBarSettings(
  settings: Partial<TimetableNowBarSettings>
): Promise<boolean> {
  const res = await sendTimetableBridgeAction("setTimetableNowBarSettings", settings);
  return Boolean(res.success);
}

/**
 * 테스트용 Ongoing Activity / Now Bar 즉시 띄우기
 */
export async function testTimetableNowBar(params?: {
  title?: string;
  location?: string;
  professor?: string;
  minutes?: number;
}): Promise<boolean> {
  const res = await sendTimetableBridgeAction("testTimetableNowBar", params);
  return Boolean(res.success);
}

/**
 * 활성화된 Now Bar 즉시 닫기
 */
export async function cancelTimetableNowBar(): Promise<boolean> {
  const res = await sendTimetableBridgeAction("cancelTimetableNowBar");
  return Boolean(res.success);
}

/**
 * 시간표 목록을 네이티브 저장소 및 스케줄러로 동기화
 */
export async function syncTimetableToNative(
  detailItems: TimeTableDetailItem[]
): Promise<boolean> {
  if (!isMobileAppEnvironment()) return false;

  const courses = detailItems
    .filter((item) => item.course !== null || item.customSchedule !== null)
    .map((item) => {
      if (item.course) {
        return {
          id: item.course.courseId,
          title: item.course.title || "강의",
          professor: item.course.professor,
          meetings: item.course.meetings || [],
        };
      }
      return {
        id: item.customSchedule?.customScheduleId,
        title: item.customSchedule?.title || "일정",
        professor: null,
        meetings: item.customSchedule?.meetings || [],
      };
    });

  const res = await sendTimetableBridgeAction("syncTimetable", { courses });
  return Boolean(res.success);
}
