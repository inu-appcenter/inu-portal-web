import tokenInstance from "@/apis/tokenInstance";
import type { ApiResponse } from "@/types/common";
import type {
  Term,
  TimeTable,
  TimeTableCourseItemRequest,
  TimeTableDetail,
  TimeTableItemSummary,
  TimeTableVisibility,
} from "@/types/timetables";

/**
 * 시간표 조회 (year, term을 함께 보내면 해당 년도/학기만, 생략하면 전체 조회)
 */
export const getTimeTables = async (
  year?: number,
  term?: Term,
): Promise<TimeTable[]> => {
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
  const response = await tokenInstance.patch<ApiResponse<TimeTable>>(
    `/api/timetables/${timeTableId}/isPrimary`,
  );
  return response.data.data;
};

/**
 * 시간표 삭제
 */
export const deleteTimeTable = async (timeTableId: number): Promise<number> => {
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
  const response = await tokenInstance.post<ApiResponse<TimeTableItemSummary>>(
    `/api/timetables/${timeTableId}`,
    body,
  );
  return response.data.data;
};

/**
 * 시간표 상세 조회 (시간표 기본 정보 + 포함된 모든 요소)
 */
export const getTimeTableDetail = async (
  timeTableId: number,
): Promise<TimeTableDetail> => {
  const response = await tokenInstance.get<ApiResponse<TimeTableDetail>>(
    `/api/timetables/${timeTableId}`,
  );
  return response.data.data;
};
