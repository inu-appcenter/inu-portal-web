import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourseReviews,
  getCourseReviewSummary,
  createCourseReview,
  updateCourseReview,
  deleteCourseReview,
  toggleCourseReviewLike,
  reportCourseReview,
  getMyCourseReviews,
} from "@/apis/courseReview";
import type {
  CourseReviewCreateRequest,
  CourseReviewUpdateRequest,
  CourseReviewSearchParams,
} from "@/types/courseReview";

export const COURSE_REVIEWS_QUERY_KEY = ["courseReviews"] as const;
export const COURSE_REVIEW_SUMMARY_QUERY_KEY = ["courseReviewSummary"] as const;
export const MY_COURSE_REVIEWS_QUERY_KEY = ["myCourseReviews"] as const;

export const useCourseReviews = (
  courseId: number | undefined,
  params?: CourseReviewSearchParams,
  options?: { enabled?: boolean },
) => {
  const enabled = (options?.enabled ?? true) && courseId !== undefined && courseId > 0;

  return useQuery({
    queryKey: [...COURSE_REVIEWS_QUERY_KEY, courseId, params],
    queryFn: () => getCourseReviews(courseId!, params),
    enabled,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
};

export const useCourseReviewSummary = (
  courseId: number | undefined,
  professor?: string,
  options?: { enabled?: boolean },
) => {
  const enabled = (options?.enabled ?? true) && courseId !== undefined && courseId > 0;

  return useQuery({
    queryKey: [...COURSE_REVIEW_SUMMARY_QUERY_KEY, courseId, professor ?? "all"],
    queryFn: () => getCourseReviewSummary(courseId!, professor),
    enabled,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 15,
  });
};

export const useCreateCourseReview = (courseId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CourseReviewCreateRequest) =>
      createCourseReview(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...COURSE_REVIEWS_QUERY_KEY, courseId] });
      queryClient.invalidateQueries({ queryKey: [...COURSE_REVIEW_SUMMARY_QUERY_KEY, courseId] });
      queryClient.invalidateQueries({ queryKey: MY_COURSE_REVIEWS_QUERY_KEY });
    },
  });
};

export const useUpdateCourseReview = (courseId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: number;
      data: CourseReviewUpdateRequest;
    }) => updateCourseReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...COURSE_REVIEWS_QUERY_KEY, courseId] });
      queryClient.invalidateQueries({ queryKey: [...COURSE_REVIEW_SUMMARY_QUERY_KEY, courseId] });
      queryClient.invalidateQueries({ queryKey: MY_COURSE_REVIEWS_QUERY_KEY });
    },
  });
};

export const useDeleteCourseReview = (courseId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => deleteCourseReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...COURSE_REVIEWS_QUERY_KEY, courseId] });
      queryClient.invalidateQueries({ queryKey: [...COURSE_REVIEW_SUMMARY_QUERY_KEY, courseId] });
      queryClient.invalidateQueries({ queryKey: MY_COURSE_REVIEWS_QUERY_KEY });
    },
  });
};

export const useToggleCourseReviewLike = (courseId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => toggleCourseReviewLike(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...COURSE_REVIEWS_QUERY_KEY, courseId] });
      queryClient.invalidateQueries({ queryKey: MY_COURSE_REVIEWS_QUERY_KEY });
    },
  });
};

export const useReportCourseReview = (courseId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      reason,
      detail,
    }: {
      reviewId: number;
      reason: string;
      detail?: string;
    }) => reportCourseReview(reviewId, reason, detail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...COURSE_REVIEWS_QUERY_KEY, courseId] });
    },
  });
};

export const useMyCourseReviews = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: MY_COURSE_REVIEWS_QUERY_KEY,
    queryFn: getMyCourseReviews,
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};
