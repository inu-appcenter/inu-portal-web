import type {
  WizardCourseOption,
  WizardExclusionConditions,
  WizardPreferenceConditions,
  WizardSemesterSelection,
} from "@/types/timetableWizard";

/**
 * 에브리타임식 "그룹 마법사"의 강의 선택 단위.
 *
 * 기존 마법사(위시리스트+필수/선택 토글)와의 결정적 차이는 "그룹"을 사용자가 명시적으로
 * 만든다는 점이다. 그룹 하나에는 "시간은 무관하지만 이 중 하나는 꼭 듣고 싶은" 강의들을
 * 담고, 조합 생성기는 각 그룹에서 정확히 하나씩 꺼내 카르테시안 곱으로 경우의 수를 만든다.
 *
 * 기존 위시리스트가 courseId로 분반을 자동 그룹화했던 것과 달리, 여기서는 서로 다른
 * 과목(예: 골프 / 필라테스)도 한 그룹에 넣어 "이 둘 중 하나"를 표현할 수 있다.
 *
 * options는 위시리스트와 같은 이유로 subjectNumber 참조가 아니라 강의 스냅샷을 통째로
 * 들고 있다(조회 필터가 바뀌어도 담긴 강의가 사라지지 않는다).
 */
export interface WizardCourseGroup {
  /** 로컬에서만 쓰는 안정적인 그룹 식별자 (표시 번호는 배열 인덱스로 파생) */
  id: string;
  options: WizardCourseOption[];
}

export interface WizardGroupBasicConditions {
  semester: WizardSemesterSelection | null;
  minCredit: number;
  maxCredit: number;
  groups: WizardCourseGroup[];
}

export interface WizardGroupConditions {
  basic: WizardGroupBasicConditions;
  preference: WizardPreferenceConditions;
  exclusion: WizardExclusionConditions;
}
