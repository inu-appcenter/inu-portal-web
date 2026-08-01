import tokenInstance from "@/apis/tokenInstance";
import type { ApiResponse, PageResponse } from "@/types/common";
import type { Term } from "@/types/timetables";
import type { CourseOffering } from "@/types/courseOfferings";
import { isMockApiEnabled, mockDelay } from "@/mocks/mockFlag";
import { MOCK_COURSE_OFFERINGS } from "@/mocks/mockTimetableWizardData";

const PAGE_SIZE = 200;
// 무한 루프 방지용 안전장치 (한 학기 개설 강의가 이보다 많을 일은 없다고 가정)
const MAX_PAGES = 50;

/**
 * 학기별 개설 강의 목록 조회 (페이지 단위)
 */
export const getCourseOfferingsPage = async (
  year: number,
  term: Term,
  page: number,
  size: number = PAGE_SIZE,
): Promise<PageResponse<CourseOffering>> => {
  const response = await tokenInstance.get<
    ApiResponse<PageResponse<CourseOffering>>
  >("/api/course-offerings", {
    params: { year, term, page, size },
  });
  return response.data.data;
};

/**
 * 학기별 개설 강의 전체 목록 조회 (페이지네이션을 순회하며 모두 취합)
 */
export const getAllCourseOfferings = async (
  year: number,
  term: Term,
): Promise<CourseOffering[]> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return MOCK_COURSE_OFFERINGS.filter((o) => o.year === year && o.term === term);
  }

  const all: CourseOffering[] = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages && page < MAX_PAGES) {
    const result = await getCourseOfferingsPage(year, term, page);
    all.push(...(result.content ?? []));
    totalPages = result.totalPages ?? 1;
    page += 1;
  }

  return all;
};
