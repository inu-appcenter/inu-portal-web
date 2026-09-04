import type { Term } from "@/types/timetables";
import type {
  GradeLetter,
  GradeRecord,
  GradeRecordSaveRequest,
} from "@/types/gradeRecords";

// apis/grades.ts를 model 레이어에서 그대로 대체하는 인메모리 CRUD 저장소.
// 새로고침 시 초기화되며, 실 로그인 세션 없이 저장/교체 플로우를 끝까지 검증하기 위해 존재한다.

// 서버가 grade 필드로 돌려주는 내부 enum 이름 흉내(화면은 grade_value만 쓰지만
// 응답 형태를 최대한 실제 API와 비슷하게 맞춰 둔다).
const GRADE_ENUM_NAMES: Record<GradeLetter, string> = {
  "A+": "A_PLUS",
  A0: "A_ZERO",
  "B+": "B_PLUS",
  B0: "B_ZERO",
  "C+": "C_PLUS",
  C0: "C_ZERO",
  "D+": "D_PLUS",
  D0: "D_ZERO",
  F: "F",
  P: "P",
  NP: "NP",
};

let idCounter = 1;
let records: GradeRecord[] = [];

export const mockGetGradeRecords = (year: number, term: Term): GradeRecord[] =>
  records.filter((r) => r.year === year && r.term === term);

export const mockGetAllGradeRecords = (): GradeRecord[] => records;

export const mockUpsertGradeRecords = (
  body: GradeRecordSaveRequest,
): GradeRecord[] => {
  const created: GradeRecord[] = body.records.map((r) => ({
    id: idCounter++,
    year: body.year,
    term: body.term,
    courseCode: r.courseCode ?? null,
    title: r.title,
    credit: r.credit,
    grade: r.grade ? GRADE_ENUM_NAMES[r.grade] : null,
    grade_value: r.grade,
    isMajor: r.isMajor,
    isCourseRepetition: r.isCourseRepetition,
    isuName: r.isuName ?? null,
    isuFldName: r.isuFldName ?? null,
  }));

  records = [
    ...records.filter((r) => !(r.year === body.year && r.term === body.term)),
    ...created,
  ];
  return created;
};

export const mockDeleteAllGradeRecords = (year: number, term: Term): void => {
  records = records.filter((r) => !(r.year === year && r.term === term));
};
