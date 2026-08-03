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

export interface WizardBasicConditions {
  semesterId: number | null;
  year: number | null;
  term: Term | null;
  minCredit: number;
  maxCredit: number;
  // subjectNumber(과목번호)로 특정 분반(개설강의)을 식별. courseId만으로는 같은 과목의
  // 여러 분반을 구분할 수 없어 선택/생성 알고리즘 모두 subjectNumber를 키로 사용한다.
  mustHaveSubjectNumbers: string[];
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
  excludedSubjectNumbers: string[];
}

export interface WizardConditions {
  basic: WizardBasicConditions;
  preference: WizardPreferenceConditions;
  exclusion: WizardExclusionConditions;
}

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
  excludedSubjectNumbers: [],
};
