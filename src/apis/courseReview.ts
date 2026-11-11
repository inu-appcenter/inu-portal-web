import tokenInstance from "@/apis/tokenInstance";
import type { ApiResponse } from "@/types/common";
import type {
  CourseReview,
  CourseReviewSummary,
  CourseReviewCreateRequest,
  CourseReviewUpdateRequest,
  CourseReviewSearchParams,
} from "@/types/courseReview";

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * 교과목 강의평 목록 조회 (페이징, 정렬, 교수 필터)
 */
export const getCourseReviews = async (
  courseId: number,
  params?: CourseReviewSearchParams,
): Promise<PageResponse<CourseReview>> => {
  const response = await tokenInstance.get<ApiResponse<PageResponse<CourseReview>>>(
    `/api/courses/${courseId}/reviews`,
    { params },
  );
  return response.data.data;
};

/**
 * 교과목 및 교수별 강의평 요약 통계 조회
 */
export const getCourseReviewSummary = async (
  courseId: number,
  professor?: string,
): Promise<CourseReviewSummary> => {
  const response = await tokenInstance.get<ApiResponse<CourseReviewSummary>>(
    `/api/courses/${courseId}/reviews/summary`,
    { params: professor && professor !== "all" ? { professor } : undefined },
  );
  return response.data.data;
};

/**
 * 강의평 등록
 */
export const createCourseReview = async (
  courseId: number,
  data: CourseReviewCreateRequest,
): Promise<CourseReview> => {
  const response = await tokenInstance.post<ApiResponse<CourseReview>>(
    `/api/courses/${courseId}/reviews`,
    data,
  );
  return response.data.data;
};

/**
 * 강의평 수정
 */
export const updateCourseReview = async (
  reviewId: number,
  data: CourseReviewUpdateRequest,
): Promise<CourseReview> => {
  const response = await tokenInstance.put<ApiResponse<CourseReview>>(
    `/api/reviews/${reviewId}`,
    data,
  );
  return response.data.data;
};

/**
 * 강의평 삭제
 */
export const deleteCourseReview = async (reviewId: number): Promise<void> => {
  await tokenInstance.delete(`/api/reviews/${reviewId}`);
};

/**
 * 추천(도움돼요) 토글
 */
export const toggleCourseReviewLike = async (
  reviewId: number,
): Promise<{ liked: boolean }> => {
  const response = await tokenInstance.post<ApiResponse<{ liked: boolean }>>(
    `/api/reviews/${reviewId}/like`,
  );
  return response.data.data;
};

/**
 * 강의평 신고
 */
export const reportCourseReview = async (
  reviewId: number,
  reason: string,
  detail?: string,
): Promise<void> => {
  await tokenInstance.post(`/api/reviews/${reviewId}/report`, {
    reason,
    detail: detail || "",
  });
};

/**
 * 내가 작성한 강의평 목록 조회
 */
export const getMyCourseReviews = async (): Promise<CourseReview[]> => {
  const response = await tokenInstance.get<ApiResponse<CourseReview[]>>(
    "/api/my/course-reviews",
  );
  return response.data.data;
};

/**
 * 최근 등록된 강의평 피드 조회
 */
export const getRecentCourseReviews = async (
  limit = 10,
): Promise<CourseReview[]> => {
  const response = await tokenInstance.get<ApiResponse<CourseReview[]>>(
    "/api/course-reviews/recent",
    { params: { limit } },
  );
  return response.data.data;
};
