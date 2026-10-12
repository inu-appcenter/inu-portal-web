import axios from "axios";
import tokenInstance from "@/apis/tokenInstance";
import type { ApiResponse } from "@/types/common";
import type { Syllabus } from "@/types/syllabus";

/**
 * 개설강의(CourseOffering) ID로 강의계획서를 조회한다.
 * 해당 강의의 강의계획서가 아직 적재되지 않았으면 서버가 404를 주는데,
 * 이는 오류가 아니라 "아직 없음"이므로 null로 정규화해 돌려준다.
 */
export const getSyllabus = async (
  courseOfferingId: number,
): Promise<Syllabus | null> => {
  try {
    const response = await tokenInstance.get<ApiResponse<Syllabus>>(
      "/api/syllabus",
      { params: { courseOfferingId } },
    );
    return response.data.data ?? null;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    console.error("API request error:", error);
    throw new Error("강의계획서 조회에 실패했습니다.");
  }
};
