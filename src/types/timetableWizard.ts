import type { Term } from "@/types/timetables";

// TimetableGrid 규약과 동일: day 0=월 ~ 4=금, startTime/endTime은 9~21 사이 0.5 단위 시간값
export interface WizardCourseMeeting {
  day: number;
  startTime: number;
  endTime: number;
  location: string | null;
}

// Course(학점/학과 정보) + CourseOffering(시간/강의실 정보)을 courseId로 조인한 결과.
// 마법사 생성 알고리즘과 검색/선택 UI가 공통으로 쓰는 단위.
export interface WizardCourseOption {
  courseId: number;
  courseOfferingId: number;
  subjectNumber: string;
  title: string;
  professor: string | null;
  credit: number;
  department: string | null;
  meetings: WizardCourseMeeting[];
}

// "듣고 싶은 강의" 목록의 항목 하나.
//
// ★ 강의 정보를 subjectNumber 참조가 아니라 **스냅샷으로 통째로** 들고 있는 게 핵심이다.
// 이전 구조는 subjectNumber만 저장하고 화면/생성기가 "현재 필터가 걸린 개설강의 조회 결과"에서
// 매번 되찾아왔는데, 그 목록은 사용자가 필터를 바꾸는 순간 통째로 바뀐다. 그래서 컴공으로
// 담은 강의가 필터를 경영학부로 바꾸는 순간 칩에서 사라지고 조합 생성에서도 조용히 누락됐다.
// 담는 시점에 값을 확정하면 이후 어떤 조회 상태와도 무관해진다.
//
// required=true(필수)면 반드시 포함하고, false(선택)면 다른 조건과 시간이 안 맞을 때 이 과목만
// 조합에서 자동으로 빠질 수 있다.
export interface WizardWishlistItem {
  course: WizardCourseOption;
  required: boolean;
}

export interface WizardSemesterSelection {
  id: number;
  year: number;
  term: Term;
}

export interface WizardPreferenceConditions {
  manyFreeDays: boolean; // C-01
  freeDayOfWeek: { enabled: boolean; days: number[] }; // C-02, days: 0(월)~4(금)
  noMorningClasses: { enabled: boolean; startAfter: number }; // C-03, startAfter: 시간값(9~21)
  noNightClasses: boolean; // C-04 (18시 이후 시작 수업 제외 선호)
  fewConsecutive: boolean; // C-05 (3연강 이상 회피 선호)
  avoidCommute: boolean; // C-06
}

export interface WizardExclusionConditions {
  excludedSlots: string[]; // "day-hour" 형식, TimetableGrid selectedSlots 규약
  // 위시리스트와 같은 이유로 스냅샷을 보관한다(참조 재조회 금지)
  excludedCourses: WizardCourseOption[];
}

export interface WizardBasicConditions {
  semester: WizardSemesterSelection | null;
  minCredit: number;
  maxCredit: number;
  wishlist: WizardWishlistItem[];
}

export interface WizardConditions {
  basic: WizardBasicConditions;
  preference: WizardPreferenceConditions;
  exclusion: WizardExclusionConditions;
}

export type WizardStep =
  | "step1"
  | "step2"
  | "step3"
  | "generating"
  | "results"
  | "detail"
  | "empty"
  | "error";

export interface WizardReason {
  met: boolean; // true: ✓ 충족, false: ! 일부 충족/주의
  headline: string;
  detail?: string;
}

export interface WizardCandidate {
  id: string;
  label: string; // "시안 A" 등
  courses: WizardCourseOption[];
  totalCredit: number;
  reasons: WizardReason[];
  recommended?: boolean;
}

export interface WizardConflictItem {
  label: string;
}

export interface WizardGenerationResult {
  candidates: WizardCandidate[];
  conflicts: WizardConflictItem[];
}

export const DEFAULT_PREFERENCE_CONDITIONS: WizardPreferenceConditions = {
  manyFreeDays: false,
  freeDayOfWeek: { enabled: false, days: [] },
  noMorningClasses: { enabled: false, startAfter: 10.5 },
  noNightClasses: false,
  fewConsecutive: false,
  avoidCommute: false,
};

export const DEFAULT_EXCLUSION_CONDITIONS: WizardExclusionConditions = {
  excludedSlots: [],
  excludedCourses: [],
};
