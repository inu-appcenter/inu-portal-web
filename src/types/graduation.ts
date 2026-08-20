/** 학과별·학번별 졸업요건(issue #335) 데이터 스키마와 판정 결과 타입 */

export type GraduationTrack =
  | "인문·사회·예체능계열"
  | "자연·공학계열"
  | "생활과학계열";

/** 필수 교양 영역. "기타"는 이름만으로 자동 판정할 수 없어 안내만 한다. */
export type RequiredGeneralCategory =
  | "국어"
  | "영어"
  | "SW"
  | "수학"
  | "기타";

export interface RequiredGeneralCourse {
  /** 원문 표기 그대로. "영어(대학영어 또는 Academic English)"처럼 대안이 섞여 있다. */
  courseName: string;
  credits: number;
  category: RequiredGeneralCategory;
}

export interface GeneralRequirements {
  minGeneralCredits: number;
  /** 상한이 없는 학번대(2008학번 이전 등)는 수집 관례상 999가 들어온다. */
  maxGeneralCredits: number;
  minTotalCredits: number;
  /** 핵심교양 최소 이수 영역 수. 과목명만으로는 판정할 수 없어 안내만 한다. */
  minCoreGeneralCount?: number;
  requiredGeneralCourses: RequiredGeneralCourse[];
}

export interface MajorRequirements {
  minMajorCredits: number;
  /**
   * 타 대학의 "전공필수"에 해당하는 최소 학점.
   * 인천대 현행 이수구분으로는 전공기초 + 전공핵심이며, 이수구분이 있는
   * 과목(성적 붙여넣기)에서만 판정할 수 있다.
   */
  minRequiredMajorCredits?: number;
}

export interface EnglishCertification {
  toeic?: number;
  toeicSpeaking?: number;
  opic?: string;
}

export interface GraduationRule {
  startYear: number;
  endYear: number;
  track: GraduationTrack;
  generalRequirements: GeneralRequirements;
  majorRequirements: MajorRequirements;
  englishCertification?: EnglishCertification;
}

/**
 * 데이터 신뢰도.
 * - A: 학과 자체 자료에서 학번별 이력까지 확인
 * - B: 학과 자체 자료 또는 학과가 지정한 대학 공통기준에서 최신 규정만 확인
 * - C: 학과 자료를 확보하지 못해 대학 공통기준으로 추정
 */
export type RequirementConfidence = "A" | "B" | "C";

export interface DepartmentGraduationRequirement {
  /** 수집 당시의 학과 표기. 화면 표기는 navBarList의 학과명을 쓴다. */
  departmentName: string;
  confidence: RequirementConfidence;
  /** 학과 졸업요건 안내 페이지. 없는 학과는 null. */
  sourceUrl: string | null;
  /** 학번(입학연도) 오름차순 */
  rules: GraduationRule[];
}

/** 졸업요건 판정에 넣는 최소 과목 정보 */
export interface EvaluatedSubject {
  name: string;
  credits: number;
  isMajor: boolean;
  /** 학점을 취득한 과목인지(F/NP/미입력/재수강 취소 제외) */
  passed: boolean;
  /** 이수구분("전공핵심" / "심화교양" …). 성적 붙여넣기로 들어온 과목에만 있다. */
  isuName?: string | null;
  /** 이수영역("(핵심)인문" / "학문의기초" …). 핵심교양 영역 수를 셀 때 쓴다. */
  isuFldName?: string | null;
}

export type CreditAreaKey = "total" | "major" | "requiredMajor" | "general";

export interface CreditProgress {
  key: CreditAreaKey;
  label: string;
  earned: number;
  required: number;
  /** 남은 학점(0 이상) */
  remaining: number;
  satisfied: boolean;
  /** 판정에 필요한 정보(이수구분 등)가 없어 참고용으로만 보여줄 항목 */
  unverifiable?: boolean;
}

export type RequiredCourseStatus = "DONE" | "PARTIAL" | "MISSING" | "UNKNOWN";

export interface RequiredCourseProgress {
  courseName: string;
  category: RequiredGeneralCategory;
  requiredCredits: number;
  earnedCredits: number;
  status: RequiredCourseStatus;
  /** 이 요건에 매칭된 과목명 */
  matchedNames: string[];
}

export interface CoreGeneralProgress {
  /** 이수해야 하는 핵심교양 영역 수 */
  required: number;
  /** 이수한 핵심교양 이수영역들 */
  areas: string[];
  satisfied: boolean;
  /** 이수영역 정보가 없어 자동 판정이 불가능한 상태 */
  unverifiable: boolean;
}

export interface GraduationEvaluation {
  rule: GraduationRule;
  /** 총학점·전공·전공필수·교양 진행도 */
  credits: CreditProgress[];
  /** 필수 교양 과목 차집합 결과 */
  requiredCourses: RequiredCourseProgress[];
  /** 핵심교양 영역 수 요건이 있는 학번대에서만 채워진다. */
  coreGeneral?: CoreGeneralProgress;
  /** 교양 상한 초과분(초과분은 졸업학점에 안 들어갈 수 있다). 상한이 없으면 0. */
  generalOverflow: number;
  /** 졸업까지 남은 총학점 */
  remainingTotalCredits: number;
  englishCertification?: EnglishCertification;
  /** 자동 판정이 불가능하거나 사용자가 직접 확인해야 하는 항목 안내 */
  notices: string[];
}
