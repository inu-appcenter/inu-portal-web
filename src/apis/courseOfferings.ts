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
    !filters.credits.includes(offering.credit ?? Number(course?.credit))
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
 * 개설강의의 학수번호(스마트캠퍼스 성적표의 "과목코드"와 같은 체계).
 *
 * 스웨거 기준 `courseCode`가 학수번호("2000259", "IAA6018")이고, `subjectNumber`는
 * 거기에 분반 3자리가 붙은 수강번호("2000259001")다. 둘을 섞어 쓰면 매칭이 전부 어긋난다.
 * `courseCode`가 비어 오는 응답(및 목 데이터)에서는 수강번호 뒤 3자리를 떼어 복원한다.
 */
export function getOfferingCourseCode(offering: CourseOffering): string | null {
  if (offering.courseCode) return offering.courseCode.toUpperCase();
  const subjectNumber = offering.subjectNumber ?? "";
  if (subjectNumber.length <= 3) return null;
  return subjectNumber.slice(0, -3).toUpperCase();
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


/**
 * 키워드로 개설강의를 좁혀 조회한다(첫 페이지만).
 *
 * `keyword`는 서버 명세상 강의명·영문명·학수번호를 훑으므로 둘 중 무엇으로도 좁힐 수 있다.
 * 한 과목을 찾아내는 용도라 페이지네이션을 따라가지 않는다.
 * 첫 페이지 안에 없다면 키워드가 충분히 구체적이지 않았다는 뜻이므로,
 * 호출부에서 더 좁은 키워드로 다시 묻는 편이 낫다.
 */
export const searchCourseOfferings = async (
  year: number,
  term: Term,
  keyword: string,
): Promise<CourseOffering[]> => {
  const page = await getCourseOfferingsPage(year, term, 0, PAGE_SIZE, {
    keyword,
  });
  return page?.content ?? [];
};
