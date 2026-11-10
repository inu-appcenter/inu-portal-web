export type GradeSatisfaction = "GENEROUS" | "NORMAL" | "STRICT";
export type AssignmentAmount = "MANY" | "NORMAL" | "FEW";
export type TeamProject = "MANY" | "NORMAL" | "NONE";
export type ExamCount = "TWICE" | "ONCE" | "REPLACEMENT" | "NONE";
export type AttendanceType = "ELECTRONIC" | "CALL" | "MIXED" | "NONE";
export type CourseReviewSort = "LATEST" | "LIKES" | "RATING_DESC" | "RATING_ASC";

export interface CourseReview {
  id: number;
  courseId: number;
  courseTitle: string;
  courseOfferingId: number | null;
  professor: string;
  year: number;
  term: number;
  semesterLabel: string;
  rating: number;
  gradeSatisfaction: GradeSatisfaction;
  gradeSatisfactionText: string;
  assignmentAmount: AssignmentAmount;
  assignmentAmountText: string;
  teamProject: TeamProject;
  teamProjectText: string;
  examCount: ExamCount;
  examCountText: string;
  attendanceType: AttendanceType;
  attendanceTypeText: string;
  content: string;
  isVerified: boolean;
  likeCount: number;
  isLiked: boolean;
  isMyReview: boolean;
  writerDisplay: string;
  createdAt: string;
}

export interface CourseReviewSummary {
  courseId: number;
  courseTitle: string;
  professor: string | null;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  gradeSatisfactionRatios: Record<string, number>;
  assignmentRatios: Record<string, number>;
  teamProjectRatios: Record<string, number>;
  examCountRatios: Record<string, number>;
  attendanceRatios: Record<string, number>;
  representativeKeyword: string | null;
}

export interface CourseReviewCreateRequest {
  courseOfferingId?: number;
  professor: string;
  year: number;
  term: number;
  rating: number;
  gradeSatisfaction: GradeSatisfaction;
  assignmentAmount: AssignmentAmount;
  teamProject: TeamProject;
  examCount: ExamCount;
  attendanceType: AttendanceType;
  content: string;
}

export interface CourseReviewUpdateRequest {
  rating: number;
  gradeSatisfaction: GradeSatisfaction;
  assignmentAmount: AssignmentAmount;
  teamProject: TeamProject;
  examCount: ExamCount;
  attendanceType: AttendanceType;
  content: string;
}

export interface CourseReviewSearchParams {
  professor?: string;
  sort?: CourseReviewSort;
  verifiedOnly?: boolean;
  page?: number;
  size?: number;
}
