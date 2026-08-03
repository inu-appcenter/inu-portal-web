import tokenInstance from "@/apis/tokenInstance";
import type { ApiResponse } from "@/types/common";
import type { Semester } from "@/types/semesters";
import { isMockApiEnabled, mockDelay } from "@/mocks/mockFlag";
import { MOCK_SEMESTERS } from "@/mocks/mockTimetableWizardData";

/**
 * 학기 조회
 */
export const getSemesters = async (): Promise<Semester[]> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return MOCK_SEMESTERS;
  }

  const response =
    await tokenInstance.get<ApiResponse<Semester[]>>("/api/semesters");
  return response.data.data ?? [];
};
