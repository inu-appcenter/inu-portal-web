import tokenInstance from "@/apis/tokenInstance";
import type { ApiResponse } from "@/types/common";
import type { Course } from "@/types/courses";

export const getCourses = async (department?: string): Promise<Course[]> => {
  try {
    const response = await tokenInstance.get<ApiResponse<Course[]>>(
      "/api/courses",
      { params: department ? { department } : undefined },
    );
    return response.data.data ?? [];
  } catch (error) {
    console.error("API request error:", error);
    throw new Error("강의 목록 조회에 실패했습니다.");
  }
};
