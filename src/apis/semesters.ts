import tokenInstance from "@/apis/tokenInstance";
import type { ApiResponse } from "@/types/common";
import type { Semester } from "@/types/semesters";

/**
 * 학기 조회
 */
export const getSemesters = async (): Promise<Semester[]> => {
  const response =
    await tokenInstance.get<ApiResponse<Semester[]>>("/api/semesters");
  return response.data.data ?? [];
};
