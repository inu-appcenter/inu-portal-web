import tokenInstance from "@/apis/tokenInstance";
import type { ApiResponse } from "@/types/common";
import type { Term } from "@/types/timetables";
import type { GradeRecord, GradeRecordSaveRequest } from "@/types/gradeRecords";
import { isMockApiEnabled, mockDelay } from "@/mocks/mockFlag";
import {
  mockDeleteAllGradeRecords,
  mockGetAllGradeRecords,
  mockGetGradeRecords,
  mockUpsertGradeRecords,
} from "@/mocks/mockGradeStore";

/**
 * 특정 년도/학기 성적 조회
 */
export const getGradeRecords = async (
  year: number,
  term: Term,
): Promise<GradeRecord[]> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockGetGradeRecords(year, term);
  }

  const response = await tokenInstance.get<ApiResponse<GradeRecord[]>>(
    "/api/grades",
    { params: { year, term } },
  );
  return response.data.data ?? [];
};

/**
 * 내 성적 전체 조회
 */
export const getAllGradeRecords = async (): Promise<GradeRecord[]> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockGetAllGradeRecords();
  }

  const response =
    await tokenInstance.get<ApiResponse<GradeRecord[]>>("/api/grades/all");
  return response.data.data ?? [];
};

/**
 * 특정 년도/학기 성적 저장 및 교체.
 * 같은 년도/학기의 기존 성적은 모두 삭제된 뒤 body.records로 교체된다.
 */
export const upsertGradeRecords = async (
  body: GradeRecordSaveRequest,
): Promise<GradeRecord[]> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockUpsertGradeRecords(body);
  }

  const response = await tokenInstance.put<ApiResponse<GradeRecord[]>>(
    "/api/grades",
    body,
  );
  return response.data.data ?? [];
};

/**
 * 특정 년도/학기 성적 전체 삭제
 */
export const deleteAllGradeRecords = async (
  year: number,
  term: Term,
): Promise<void> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    mockDeleteAllGradeRecords(year, term);
    return;
  }

  await tokenInstance.delete<ApiResponse<null>>("/api/grades", {
    params: { year, term },
  });
};
