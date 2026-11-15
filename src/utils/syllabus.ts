import { ROUTES } from "../constants/routes";

export interface SyllabusPathParams {
  courseOfferingId: number;
  courseName?: string | null;
  professor?: string | null;
}

/**
 * 강의계획서 페이지 이동 경로를 생성한다.
 * 앱 멀티 웹뷰 환경에서는 `navigate`의 `location.state`가 새 웹뷰로 전달되지 않으므로
 * 강의 ID와 기본 메타 정보를 쿼리 파라미터에 함께 싣는다.
 */
export const buildSyllabusPath = ({
  courseOfferingId,
  courseName,
  professor,
}: SyllabusPathParams): string => {
  const params = new URLSearchParams({
    id: String(courseOfferingId),
  });

  const trimmedName = courseName?.trim();
  if (trimmedName) {
    params.set("name", trimmedName);
  }

  const trimmedProfessor = professor?.trim();
  if (trimmedProfessor && trimmedProfessor !== "-") {
    params.set("professor", trimmedProfessor);
  }

  return `${ROUTES.TIMETABLE.SYLLABUS}?${params.toString()}`;
};

/**
 * location.state 또는 URL 쿼리 파라미터에서 유효한 개설강의 ID를 추출한다.
 */
export const parseSyllabusOfferingId = (
  stateCourseOfferingId: number | undefined,
  paramId: string | null,
): number | undefined => {
  if (
    typeof stateCourseOfferingId === "number" &&
    Number.isFinite(stateCourseOfferingId) &&
    stateCourseOfferingId > 0
  ) {
    return stateCourseOfferingId;
  }

  const trimmed = paramId?.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};
