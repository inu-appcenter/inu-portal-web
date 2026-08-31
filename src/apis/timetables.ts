import tokenInstance from "@/apis/tokenInstance";
import useUserStore from "@/stores/useUserStore";
import type { ApiResponse } from "@/types/common";
import type {
  Term,
  TimeTable,
  TimeTableCourseItemRequest,
  TimeTableCustomItemRequest,
  TimeTableDetail,
  TimeTableItemSummary,
  TimeTableVisibility,
  TimeTableEvaluation,
} from "@/types/timetables";
import { isMockApiEnabled, mockDelay } from "@/mocks/mockFlag";
import {
  mockCreateTimeTable,
  mockCreateTimeTableCourseItem,
  mockCreateTimeTableCustomItem,
  mockDeleteTimeTable,
  mockDeleteTimeTableItem,
  mockGetTimeTableDetail,
  mockGetTimeTables,
  mockGetTimeTablesBySemester,
  mockUpdateTimeTableCustomItem,
  mockUpdateTimeTableName,
  mockUpdateTimeTablePrimary,
  mockUpdateTimeTableVisibility,
} from "@/mocks/mockTimetableStore";

/**
 * 시간표 조회 (year, term을 함께 보내면 해당 년도/학기만, 생략하면 전체 조회)
 */
export const getTimeTables = async (
  year?: number,
  term?: Term,
): Promise<TimeTable[]> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockGetTimeTables(year, term);
  }

  const response = await tokenInstance.get<ApiResponse<TimeTable[]>>(
    "/api/timetables",
    {
      params:
        year !== undefined && term !== undefined ? { year, term } : undefined,
    },
  );
  return response.data.data ?? [];
};

/**
 * 학기별 시간표 조회
 */
export const getTimeTablesBySemester = async (
  semesterId: number,
): Promise<TimeTable[]> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockGetTimeTablesBySemester(semesterId);
  }

  const response = await tokenInstance.get<ApiResponse<TimeTable[]>>(
    `/api/timetables/semesters/${semesterId}`,
  );
  return response.data.data ?? [];
};

/**
 * 시간표 생성 (해당 학기의 첫 시간표이면 대표 시간표로 생성됨)
 */
export const createTimeTable = async (
  semesterId: number,
  timeTableName: string,
): Promise<TimeTable> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockCreateTimeTable(semesterId, timeTableName);
  }

  const response = await tokenInstance.post<ApiResponse<TimeTable>>(
    `/api/timetables/semesters/${semesterId}`,
    { timeTableName },
  );
  return response.data.data;
};

/**
 * 시간표 이름 수정
 */
export const updateTimeTableName = async (
  timeTableId: number,
  timeTableName: string,
): Promise<TimeTable> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockUpdateTimeTableName(timeTableId, timeTableName);
  }

  const response = await tokenInstance.patch<ApiResponse<TimeTable>>(
    `/api/timetables/${timeTableId}/timeTableName`,
    { timeTableName },
  );
  return response.data.data;
};

/**
 * 시간표 공개범위 수정
 */
export const updateTimeTableVisibility = async (
  timeTableId: number,
  visibility: TimeTableVisibility,
): Promise<TimeTable> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockUpdateTimeTableVisibility(timeTableId, visibility);
  }

  const response = await tokenInstance.patch<ApiResponse<TimeTable>>(
    `/api/timetables/${timeTableId}/visibility`,
    { visibility },
  );
  return response.data.data;
};

/**
 * 대표 시간표 변경 (해당 학기의 대표 시간표로 설정)
 */
export const updateTimeTablePrimary = async (
  timeTableId: number,
): Promise<TimeTable> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockUpdateTimeTablePrimary(timeTableId);
  }

  const response = await tokenInstance.patch<ApiResponse<TimeTable>>(
    `/api/timetables/${timeTableId}/isPrimary`,
  );
  return response.data.data;
};

/**
 * 시간표 삭제
 */
export const deleteTimeTable = async (timeTableId: number): Promise<number> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockDeleteTimeTable(timeTableId);
  }

  const response = await tokenInstance.delete<ApiResponse<number>>(
    `/api/timetables/${timeTableId}`,
  );
  return response.data.data;
};

/**
 * 강의 시간표 요소 생성
 */
export const createTimeTableCourseItem = async (
  timeTableId: number,
  body: TimeTableCourseItemRequest,
): Promise<TimeTableItemSummary> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockCreateTimeTableCourseItem(timeTableId, body);
  }

  const response = await tokenInstance.post<ApiResponse<TimeTableItemSummary>>(
    `/api/timetables/${timeTableId}`,
    body,
  );
  return response.data.data;
};

/**
 * 커스텀 일정 시간표 요소 생성
 */
export const createTimeTableCustomItem = async (
  timeTableId: number,
  body: TimeTableCustomItemRequest,
): Promise<TimeTableItemSummary> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockCreateTimeTableCustomItem(timeTableId, body);
  }

  const response = await tokenInstance.post<ApiResponse<TimeTableItemSummary>>(
    `/api/timetables/${timeTableId}/customSchedule`,
    body,
  );
  return response.data.data;
};

/**
 * 커스텀 일정 시간표 요소 수정
 */
export const updateTimeTableCustomItem = async (
  timeTableId: number,
  customScheduleId: number,
  body: TimeTableCustomItemRequest,
): Promise<TimeTableItemSummary> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockUpdateTimeTableCustomItem(timeTableId, customScheduleId, body);
  }

  const response = await tokenInstance.patch<ApiResponse<TimeTableItemSummary>>(
    `/api/timetables/${timeTableId}/customSchedule/${customScheduleId}`,
    body,
  );
  return response.data.data;
};

/**
 * 시간표 요소 삭제 (강의/커스텀 일정 공통)
 */
export const deleteTimeTableItem = async (
  timeTableId: number,
  timeTableItemId: number,
): Promise<number> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockDeleteTimeTableItem(timeTableId, timeTableItemId);
  }

  const response = await tokenInstance.delete<ApiResponse<number>>(
    `/api/timetables/${timeTableId}/timeTableItem/${timeTableItemId}`,
  );
  return response.data.data;
};

/**
 * 시간표 상세 조회 (시간표 기본 정보 + 포함된 모든 요소)
 */
export const getTimeTableDetail = async (
  timeTableId: number,
): Promise<TimeTableDetail> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockGetTimeTableDetail(timeTableId);
  }

  const response = await tokenInstance.get<ApiResponse<TimeTableDetail>>(
    `/api/timetables/${timeTableId}`,
  );
  return response.data.data;
};

/**
 * 친구의 특정 년도/학기 대표 시간표 상세 조회
 */
export const getFriendPrimaryTimeTableDetail = async (
  friendMemberId: number,
  year: number,
  term: Term,
): Promise<TimeTableDetail> => {
  const response = await tokenInstance.get<ApiResponse<TimeTableDetail>>(
    `/api/timetables/friends/${friendMemberId}/primary`,
    { params: { year, term } },
  );
  return response.data.data;
};

export interface ChatRoomPrimaryTimeTable {
  memberId: number;
  nickname: string;
  visibility: TimeTableVisibility | null;
  timeTable: TimeTableDetail | null;
}

/** 일반 단체톡의 현재 참여자 대표 시간표 일괄 조회 (오픈채팅은 허용하지 않음) */
export const getChatRoomPrimaryTimeTables = async (
  roomId: number | string,
  year: number,
  term: Term,
): Promise<ChatRoomPrimaryTimeTable[]> => {
  const response = await tokenInstance.get<ApiResponse<ChatRoomPrimaryTimeTable[]>>(
    `/api/timetables/chat-rooms/${roomId}/primary`,
    { params: { year, term } },
  );
  return response.data.data ?? [];
};

/**
 * 시간표 AI 평가 캐시 조회
 */
export const getTimeTableEvaluation = async (
  timeTableId: number,
): Promise<TimeTableEvaluation | null> => {
  const response = await tokenInstance.get<ApiResponse<TimeTableEvaluation | null>>(
    `/api/timetables/${timeTableId}/evaluation`,
  );
  return response.data.data;
};

export interface StreamEvaluationCallbacks {
  onStart?: (data: {
    isCached: boolean;
    timetableHash?: string;
    regenerateCount?: number;
    remainingCount?: number;
  }) => void;
  onDelta?: (token: string) => void;
  onDone?: (data: {
    status: string;
    isCached: boolean;
    regenerateCount?: number;
    remainingCount?: number;
  }) => void;
  onError?: (error: Error) => void;
}

/**
 * 시간표 AI 평가 실시간 SSE 스트리밍 요청
 */
export const streamTimeTableEvaluation = async (
  timeTableId: number,
  callbacks: StreamEvaluationCallbacks,
  forceRefresh = false,
  signal?: AbortSignal,
): Promise<void> => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const url = `${cleanBaseUrl}/api/timetables/${timeTableId}/evaluation/stream?forceRefresh=${forceRefresh}`;

  const { accessToken } = useUserStore.getState().tokenInfo;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        ...(accessToken ? { Auth: accessToken } : {}),
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("ReadableStream not supported by browser");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      let currentEvent = "message";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          currentEvent = "message";
          continue;
        }

        if (trimmed.startsWith("event:")) {
          currentEvent = trimmed.substring(6).trim();
        } else if (trimmed.startsWith("data:")) {
          const dataStr = trimmed.substring(5).trim();
          try {
            const parsed = JSON.parse(dataStr);
            if (currentEvent === "start") {
              callbacks.onStart?.(parsed);
            } else if (currentEvent === "delta") {
              const deltaContent = typeof parsed === "string" ? parsed : (parsed.content || "");
              callbacks.onDelta?.(deltaContent);
            } else if (currentEvent === "done") {
              callbacks.onDone?.(parsed);
            } else if (currentEvent === "error") {
              callbacks.onError?.(new Error(parsed.message || "평가 생성 실패"));
            } else {
              // event가 message이거나 생략된 경우 delta로 처리
              if (parsed.content) {
                callbacks.onDelta?.(parsed.content);
              }
            }
          } catch {
            // JSON이 아닌 일반 문자열인 경우
            if (currentEvent === "delta" || currentEvent === "message") {
              callbacks.onDelta?.(dataStr);
            }
          }
        }
      }
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      return;
    }
    callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
  }
};

