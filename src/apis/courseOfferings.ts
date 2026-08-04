import tokenInstance from "@/apis/tokenInstance";
import type { ApiResponse, PageResponse } from "@/types/common";
import type { Term } from "@/types/timetables";
import type { CourseOffering, CourseOfferingFilters } from "@/types/courseOfferings";
import type { Course } from "@/types/courses";
import { isMockApiEnabled, mockDelay } from "@/mocks/mockFlag";
import { MOCK_COURSES, MOCK_COURSE_OFFERINGS } from "@/mocks/mockTimetableWizardData";

// 서버 명세: 페이지당 크기는 50으로 고정됩니다.
const PAGE_SIZE = 50;

// 목(mock) API와 시간표마법사의 클라이언트 로컬 필터링(전체 풀이 이미 메모리에 있어
// 서버 재조회가 필요 없는 경우)이 동일한 매칭 규칙을 쓰도록 분리한 순수 함수.
// meetingFilterMode/meetings(시간대) 필터는 실서버 전용이라 여기서는 다루지 않는다.
export function matchesCourseOfferingFilters(
  offering: CourseOffering,
  course: Course | undefined,
  filters?: CourseOfferingFilters,
): boolean {
  if (filters?.deptName && (offering.deptName ?? course?.departmentName) !== filters.deptName) {
    return false;
  }
  if (
    filters?.collegeName &&
    (offering.collegeName ?? course?.collegeName) !== filters.collegeName
  ) {
    return false;
  }
  if (
    filters?.hyNames?.length &&
    !filters.hyNames.some((g) => (offering.hyName ?? course?.targetGradeName)?.startsWith(g))
  ) {
    return false;
  }
  if (
    filters?.isuNames?.length &&
    !filters.isuNames.some((t) =>
      (offering.isuName ?? course?.completionDivisionName)?.includes(t),
    )
  ) {
    return false;
  }
  if (
    filters?.credits?.length &&
    !filters.credits.includes(offering.credit ?? parseInt(course?.credit ?? "", 10))
  ) {
    return false;
  }
  if (filters?.keyword) {
    const kw = filters.keyword.toLowerCase();
    const title = (offering.courseTitle || course?.title || "").toLowerCase();
    const prof = (offering.professor || "").toLowerCase();
    const subNum = (offering.subjectNumber || "").toLowerCase();
    if (!title.includes(kw) && !prof.includes(kw) && !subNum.includes(kw)) {
      return false;
    }
  }
  return true;
}

/**
 * 학기별 개설 강의 목록 조회 (페이지 단위)
 */
export const getCourseOfferingsPage = async (
  year: number,
  term: Term,
  page: number,
  size: number = PAGE_SIZE,
  filters?: CourseOfferingFilters,
): Promise<PageResponse<CourseOffering>> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    const courseById = new Map(MOCK_COURSES.map((c) => [c.id, c]));
    const filtered = MOCK_COURSE_OFFERINGS.filter((o) => {
      if (o.year !== year || o.term !== term) return false;
      return matchesCourseOfferingFilters(o, courseById.get(o.courseId), filters);
    });

    const start = page * size;
    const content = filtered.slice(start, start + size);
    const totalPages = Math.ceil(filtered.length / size) || 1;

    return {
      content,
      number: page,
      size,
      totalElements: filtered.length,
      totalPages,
      numberOfElements: content.length,
      first: page === 0,
      last: page >= totalPages - 1,
      empty: content.length === 0,
    };
  }

  const params = new URLSearchParams();
  params.append("year", String(year));
  params.append("term", term);
  params.append("page", String(page));
  if (size) {
    params.append("size", String(size));
  }

  if (filters?.deptName) params.append("deptName", filters.deptName);
  if (filters?.collegeName) params.append("collegeName", filters.collegeName);
  if (filters?.keyword) params.append("keyword", filters.keyword);
  if (filters?.meetingFilterMode) {
    params.append("meetingFilterMode", filters.meetingFilterMode);
  }

  // 다중 선택 필터는 쉼표 CSV 방식이 아닌 동일 query parameter를 반복 생성
  filters?.hyNames?.forEach((val) => params.append("hyNames", val));
  filters?.isuNames?.forEach((val) => params.append("isuNames", val));
  filters?.isuFldNames?.forEach((val) => params.append("isuFldNames", val));
  filters?.ssupTypeNames?.forEach((val) => params.append("ssupTypeNames", val));
  filters?.credits?.forEach((val) => params.append("credits", String(val)));
  filters?.meetings?.forEach((val) => params.append("meetings", val));

  const response = await tokenInstance.get<
    ApiResponse<PageResponse<CourseOffering>>
  >("/api/course-offerings", { params });

  return response.data.data;
};

