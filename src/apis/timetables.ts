import tokenInstance from "@/apis/tokenInstance";
import type { ApiResponse } from "@/types/common";
import type { Term, TimeTable } from "@/types/timetables";

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
