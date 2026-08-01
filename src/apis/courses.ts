import tokenInstance from "@/apis/tokenInstance";
import type { ApiResponse } from "@/types/common";
import type { Course } from "@/types/courses";
import { isMockApiEnabled, mockDelay } from "@/mocks/mockFlag";
import { MOCK_COURSES } from "@/mocks/mockTimetableWizardData";

export const getCourses = async (department?: string): Promise<Course[]> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return department
      ? MOCK_COURSES.filter((c) => c.departmentName === department)
      : MOCK_COURSES;
  }

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
