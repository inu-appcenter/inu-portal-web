import tokenInstance from "@/apis/tokenInstance";
import type { ApiResponse, PageResponse } from "@/types/common";
import type { Term } from "@/types/timetables";
import type { CourseOffering, CourseOfferingFilters } from "@/types/courseOfferings";
import { isMockApiEnabled, mockDelay } from "@/mocks/mockFlag";
import { MOCK_COURSES, MOCK_COURSE_OFFERINGS } from "@/mocks/mockTimetableWizardData";

const PAGE_SIZE = 200;
// 무한 루프 방지용 안전장치 (한 학기 개설 강의가 이보다 많을 일은 없다고 가정)
const MAX_PAGES = 50;

/**
 * 학기별 개설 강의 목록 조회 (페이지 단위)
 *
 * `filters`(department/grades/types/credits)는 아직 서버(GET /api/course-offerings)가
 * 지원하지 않는 querystring이다(inu-appcenter/inu-portal-server#297 요청). 서버가
 * 지원하기 전까지는 보내도 무시되어 필터링되지 않는다 - API가 추가되는 즉시 동작하도록
 * 미리 연결해둔 것.
 */
export const getCourseOfferingsPage = async (
  year: number,
  term: Term,
  page: number,
  size: number = PAGE_SIZE,
  filters?: CourseOfferingFilters,
): Promise<PageResponse<CourseOffering>> => {
  const response = await tokenInstance.get<
    ApiResponse<PageResponse<CourseOffering>>
  >("/api/course-offerings", {
    params: {
      year,
      term,
      page,
      size,
      department: filters?.department,
      grades: filters?.grades?.join(","),
      types: filters?.types?.join(","),
      credits: filters?.credits?.join(","),
    },
  });
  return response.data.data;
};

/**
 * 학기별 개설 강의 전체 목록 조회 (페이지네이션을 순회하며 모두 취합)
 */
export const getAllCourseOfferings = async (
  year: number,
  term: Term,
  filters?: CourseOfferingFilters,
): Promise<CourseOffering[]> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    const courseById = new Map(MOCK_COURSES.map((c) => [c.id, c]));
    return MOCK_COURSE_OFFERINGS.filter((o) => {
      if (o.year !== year || o.term !== term) return false;
      const course = courseById.get(o.courseId);
      if (filters?.department && course?.departmentName !== filters.department)
        return false;
      if (
        filters?.grades?.length &&
        !filters.grades.some((g) => course?.targetGradeName?.startsWith(String(g)))
      )
        return false;
      if (
        filters?.types?.length &&
        !filters.types.some((t) => course?.completionDivisionName?.includes(t))
      )
        return false;
      if (
        filters?.credits?.length &&
        !filters.credits.includes(parseInt(course?.credit ?? "", 10))
      )
        return false;
      return true;
    });
  }

  const all: CourseOffering[] = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages && page < MAX_PAGES) {
    const result = await getCourseOfferingsPage(year, term, page, PAGE_SIZE, filters);
    all.push(...(result.content ?? []));
    totalPages = result.totalPages ?? 1;
    page += 1;
  }

  return all;
};
