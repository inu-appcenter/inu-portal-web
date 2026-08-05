import {
  getOfferingCourseCode,
  searchCourseOfferings,
} from "@/apis/courseOfferings";
import {
  buildCourseTitleIndex,
  narrowCourseCandidates,
  normalizeCourseTitle,
} from "@/utils/gradeCourseMatch";
import type { Course } from "@/types/courses";
import type { ParsedGradeRow, ResolvedGradeRow } from "@/types/gradeImport";
import type { Term } from "@/types/timetables";

/**
 * 붙여넣은 성적 행을 서버 Course와 이어붙인다.
 *
 * **왜 개설강의가 아니라 Course 목록이 1순위인가**
 * `GET /api/course-offerings`의 `courseCode`가 성적표의 과목코드(= 학수번호)와 같은
 * 체계라 코드 일치가 가장 확실하지만, 개설강의는 학기별 데이터라 그 학기가 서버에
 * 동기화돼 있어야만 찾을 수 있다. 실제로 dev 서버에는 2026-2학기만 들어 있어
 * 2026-1학기 성적은 코드로 단 한 건도 매칭되지 않는다 - 학기마다 열리는 과목이 다르니
 * 이건 데이터가 채워져도 남는 한계다.
 *
 * 반면 `GET /api/courses`는 파라미터 없이 전 학과 Course를 한 번에 주고(3216건),
 * 여기에는 지난 학기 과목도 들어 있다. 다만 **Course에는 학수번호 필드가 없어서**
 * 과목명으로 맞출 수밖에 없고, 같은 이름이 학과별로 여러 개 존재한다(예: "운영체제"
 * 3건). 그래서 이수구분 → 학점 → 학과 순으로 후보를 좁힌다.
 *
 * 요약: Course 목록으로 과목명 매칭(요청 1번) → 후보가 0건이거나 2건 이상으로 남은
 * 행만 개설강의를 학수번호로 조회해 확정/보강한다.
 */

// 과목명 매칭이 애매한 행만 개설강의를 추가 조회한다. 보통 0~2건이라 넉넉한 값.
const CONCURRENCY = 4;

const toResolved = (
  row: ParsedGradeRow,
  course: Course | undefined,
  matchStatus: ResolvedGradeRow["matchStatus"],
): ResolvedGradeRow => ({
  ...row,
  courseId: course?.id ?? null,
  resolvedIsuName: course?.completionDivisionName ?? row.isuName,
  resolvedCredit:
    course !== undefined && Number.isFinite(Number(course.credit))
      ? Number(course.credit)
      : row.credit,
  matchStatus,
});

/**
 * 과목명으로 확정하지 못한 행을 개설강의의 학수번호로 다시 시도한다.
 * 그 학기 개설강의가 서버에 있을 때만 통한다.
 */
const resolveByOfferingCode = async (
  row: ParsedGradeRow,
  candidates: Course[],
  year: number,
  term: Term,
): Promise<ResolvedGradeRow | null> => {
  try {
    const offerings = await searchCourseOfferings(year, term, row.courseCode);
    const hit = offerings.find(
      (offering) => getOfferingCourseCode(offering) === row.courseCode,
    );
    if (!hit) return null;

    // 개설강의가 알려준 courseId로 후보를 확정한다. 후보 목록에 없더라도
    // 코드 일치가 과목명 매칭보다 확실하므로 개설강의 쪽 정보를 채택한다.
    const matched = candidates.find((course) => course.id === hit.courseId);
    const resolved = toResolved(row, matched, "MATCHED_BY_CODE");
    return {
      ...resolved,
      courseId: hit.courseId,
      resolvedIsuName: resolved.resolvedIsuName ?? hit.isuName ?? null,
      resolvedCredit: resolved.resolvedCredit ?? hit.credit ?? null,
    };
  } catch (error) {
    // 조회 실패로 붙여넣기 전체를 막지 않는다.
    console.error("개설강의 학수번호 조회 실패", row.courseCode, error);
    return null;
  }
};

export interface ResolveGradeCoursesOptions {
  /** 사용자 학과 한글명. 같은 과목명이 학과별로 여러 개일 때 가른다. */
  myDepartment?: string | null;
  /** 개설강의 보강 조회에 쓸 학기. 없으면 과목명 매칭만 한다. */
  semester?: { year: number; term: Term } | null;
}

export const resolveGradeCourses = async (
  rows: ParsedGradeRow[],
  courses: Course[],
  options: ResolveGradeCoursesOptions = {},
): Promise<ResolvedGradeRow[]> => {
  const index = buildCourseTitleIndex(courses);

  // 1단계: 과목명으로 후보를 뽑고 좁힌다. 여기서 대부분 확정된다.
  const candidatesByRow = rows.map((row) =>
    narrowCourseCandidates(
      index.get(normalizeCourseTitle(row.title)) ?? [],
      row,
      options.myDepartment,
    ),
  );

  const results: ResolvedGradeRow[] = rows.map((row, i) => {
    const candidates = candidatesByRow[i];
    if (candidates.length === 1) {
      return toResolved(row, candidates[0], "MATCHED_BY_TITLE");
    }
    return toResolved(
      row,
      undefined,
      candidates.length > 1 ? "AMBIGUOUS" : "UNMATCHED",
    );
  });

  // 2단계: 남은 행만 개설강의를 조회한다.
  const semester = options.semester;
  if (!semester) return results;

  const pending = results
    .map((result, i) => ({ result, i }))
    .filter(({ result }) => result.matchStatus !== "MATCHED_BY_TITLE");
  if (pending.length === 0) return results;

  let cursor = 0;
  const worker = async () => {
    while (cursor < pending.length) {
      const { i } = pending[cursor];
      cursor += 1;
      const resolved = await resolveByOfferingCode(
        rows[i],
        candidatesByRow[i],
        semester.year,
        semester.term,
      );
      if (resolved) results[i] = resolved;
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, pending.length) }, worker),
  );

  return results;
};
