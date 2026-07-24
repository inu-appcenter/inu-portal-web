import tokenInstance from "@/apis/tokenInstance";
import type { ApiResponse } from "@/types/common";
import type { Term, TimeTable, TimeTableDetail } from "@/types/timetables";

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
