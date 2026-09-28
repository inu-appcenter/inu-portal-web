import { GRADUATION_REQUIREMENTS } from "@/resources/data/graduationRequirements";
import { getCollegeByDepartmentCode } from "@/utils/departmentOptions";
import {
  assignSubjectsToRequirements,
  resolveRequirement,
} from "@/utils/requiredCourseMatch";
import { matchRequiredMajorCourses } from "@/utils/requiredMajorCourses";
import type {
  CreditProgress,
  DepartmentGraduationRequirement,
  EvaluatedSubject,
  GraduationEvaluation,
  GraduationRule,
  RequiredCourseProgress,
  RequiredCourseStatus,
  RequiredMajorCourse,
} from "@/types/graduation";

/** 수집 데이터가 덮는 가장 이른 입학연도 */
export const MIN_ENTRY_YEAR = 1979;

/** 교양 상한이 없는 학번대를 나타내는 수집 관례값 */
const NO_GENERAL_LIMIT = 999;

/**
 * 학번("20YYxxxxx")에서 입학연도를 뽑는다. 앞 4자리가 입학연도다.
 * 형식이 다르거나 말이 안 되는 연도면 null — 사용자가 직접 고르게 둔다.
 */
export const parseEntryYearFromStudentId = (
  studentId: string | null | undefined,
): number | null => {
  const digits = (studentId ?? "").trim();
  if (!/^\d{4}/.test(digits)) return null;

  const year = Number(digits.slice(0, 4));
  // 아직 입학하지 않은 연도는 학번에 나올 수 없다(신입학 직전 학기 여유로 +1까지).
  if (year < MIN_ENTRY_YEAR || year > new Date().getFullYear() + 1) return null;

  return year;
};

export interface ResolvedGraduationRule {
  departmentCode: string;
  department: DepartmentGraduationRequirement;
  rule: GraduationRule;
  /** 입력한 학번 구간의 규정을 그대로 찾았는지. false면 가장 가까운 학번 규정으로 대체했다. */
  exact: boolean;
}

export const findDepartmentRequirement = (
  departmentCode: string | null | undefined,
): DepartmentGraduationRequirement | null => {
  if (!departmentCode) return null;
  return GRADUATION_REQUIREMENTS[departmentCode] ?? null;
};

export const isGraduationRequirementSupported = (
  departmentCode: string | null | undefined,
): boolean => findDepartmentRequirement(departmentCode) !== null;

/**
 * 학과 코드 + 학번(입학연도)으로 적용 규정을 찾는다.
 * 해당 학번 구간이 없는 학과(최신 규정만 수집된 학과)는 가장 가까운 구간으로 대체하고
 * exact=false로 알린다 — 아무것도 안 보여주는 것보다 낫고, 화면에서 주의 문구를 띄운다.
 */
export const resolveGraduationRule = (
  departmentCode: string | null | undefined,
  entryYear: number | null | undefined,
): ResolvedGraduationRule | null => {
  const department = findDepartmentRequirement(departmentCode);
  if (!department || !departmentCode) return null;
  if (!entryYear || !Number.isFinite(entryYear)) return null;
  if (department.rules.length === 0) return null;

  const exactRule = department.rules.find(
    (rule) => entryYear >= rule.startYear && entryYear <= rule.endYear,
  );
  if (exactRule) {
    return { departmentCode, department, rule: exactRule, exact: true };
  }

  const nearest = department.rules.reduce((closest, rule) => {
    const distance = Math.min(
      Math.abs(entryYear - rule.startYear),
      Math.abs(entryYear - rule.endYear),
    );
    const closestDistance = Math.min(
      Math.abs(entryYear - closest.startYear),
      Math.abs(entryYear - closest.endYear),
    );
    return distance < closestDistance ? rule : closest;
  }, department.rules[0]);

  return { departmentCode, department, rule: nearest, exact: false };
};

// --- 학과 특성에 따른 요건 면제 ---

/**
 * SW 기초교양(컴퓨팅적사고와SW, 2026학번부터 AI사고와데이터리터러시) 이수 대상이 아닌 학과.
 *
 * 학칙 표에는 SW가 "(해당학과)"로만 적혀 있어 데이터에는 원문대로 두고, 판정할 때만
 * 면제로 본다. 대상 학과는 기초교육원 「2026학년도 교양 교육과정표」의 이수 대상표를
 * 따른다: 정보기술대학은 해당 없음(수강 제한), 공과·도시과학·생명과학기술대학은 일부
 * 학과만, 사범대학은 수학교육과 제외. 학과 페이지(전자공학·바이오로봇)의 옛 학번 기준에도
 * SW가 없어 전 학번에 같이 적용한다.
 * (전공 과목을 SW 요건에 끌어다 쓰면 전공 학점이 이중으로 세여서 `allowMajor`로 푸는
 * 방식은 쓰지 않는다.)
 */
const SW_EXEMPT_COLLEGES = new Set(["정보기술대학"]);
/** 단과대학 대부분이 면제인데 SW를 듣는 학과 */
const SW_REQUIRED_DEPARTMENTS_BY_COLLEGE: Record<string, Set<string>> = {
  공과대학: new Set(["SAFETY_ENGINEERING", "ENERGY_CHEMICAL"]),
  도시과학대학: new Set(["URBAN_ADMINISTRATION", "URBAN_ARCHITECTURE"]),
  생명과학기술대학: new Set(["BIOENGINEERING", "BIOENGINEERING_NANO"]),
};
const SW_EXEMPT_DEPARTMENTS = new Set(["MATH_EDUCATION"]);

/** 그 학과가 SW 필수 교양을 면제받는지 */
export const isSwRequirementExempt = (
  departmentCode: string | null | undefined,
): boolean => {
  if (!departmentCode) return false;
  if (SW_EXEMPT_DEPARTMENTS.has(departmentCode)) return true;
  const college = getCollegeByDepartmentCode(departmentCode);
  if (SW_EXEMPT_COLLEGES.has(college)) return true;
  const required = SW_REQUIRED_DEPARTMENTS_BY_COLLEGE[college];
  return required ? !required.has(departmentCode) : false;
};

type SubjectKind = "MAJOR" | "GENERAL" | "OTHER";

/**
 * 인천대는 2022년에 이수구분 명칭을 바꿨다 — 타 대학의
 * 전공필수/전공선택 → 전공기초·전공핵심/전공심화,
 * 교양필수/교양선택 → 기초교양·핵심교양/심화교양.
 * (서버가 실제로 쓰는 값은 courseFilterModel.ts의 SERVER_ISU_NAMES 참고.)
 * 옛 성적표에는 이전 명칭이 그대로 남아 있어 양쪽을 다 본다.
 */
/** 과목명 대신 이수구분 이름이 적힌 필수 교양 요건. 이름으로 판정할 수 없다. */
const DIVISION_REQUIREMENT_NAMES = new Set([
  "기초교양",
  "핵심교양",
  "심화교양",
]);

const REQUIRED_MAJOR_ISU_NAMES = ["전공기초", "전공핵심", "전공필수"];

/**
 * 이수구분(성적 붙여넣기로 들어온 과목에만 있다)이 있으면 그걸 우선한다.
 * 이수구분이 없는 직접 입력 과목은 전공 체크박스로만 나눈다.
 */
const classifySubject = (subject: EvaluatedSubject): SubjectKind => {
  const isuName = subject.isuName ?? "";
  if (subject.isMajor || isuName.includes("전공")) return "MAJOR";
  if (!isuName) return "GENERAL";
  // 기초/핵심/심화교양 + 옛 명칭(교양필수·균형교양·일반교양)까지 걸린다.
  return isuName.includes("교양") ? "GENERAL" : "OTHER";
};

/** 타 대학 기준 "전공필수"에 해당하는 과목(= 전공기초·전공핵심) */
const isRequiredMajor = (subject: EvaluatedSubject): boolean => {
  const isuName = subject.isuName ?? "";
  return REQUIRED_MAJOR_ISU_NAMES.some((name) => isuName.includes(name));
};

/**
 * 핵심교양 과목인지. 현행은 이수구분 "핵심교양"(이수영역 "(핵심)인문" 등)이고,
 * 2022학년도까지의 INU핵심교양은 이수구분 "교양필수"에 이수영역 "INU핵심창의융합"처럼 찍힌다.
 * 이수영역은 "(핵심)"·"INU핵심"으로 시작하는 것만 본다 — 전공 과목의 이수영역 "전공핵심"이나
 * 같은 "교양필수"의 기초교양은 핵심교양이 아니다.
 */
const isCoreGeneral = (subject: EvaluatedSubject): boolean => {
  const isuName = subject.isuName ?? "";
  if (isuName.includes("전공")) return false;
  const area = (subject.isuFldName ?? "").trim();
  return (
    isuName.includes("핵심교양") ||
    area.startsWith("(핵심)") ||
    area.startsWith("INU핵심")
  );
};

const toStatus = (
  earned: number,
  required: number,
): RequiredCourseStatus => {
  if (earned <= 0) return "MISSING";
  if (earned >= required) return "DONE";
  return "PARTIAL";
};

const buildCreditProgress = (
  key: CreditProgress["key"],
  label: string,
  earned: number,
  required: number,
  unverifiable = false,
): CreditProgress => ({
  key,
  label,
  earned,
  required,
  remaining: Math.max(0, required - earned),
  satisfied: earned >= required,
  ...(unverifiable ? { unverifiable: true } : {}),
});

/**
 * 취득 과목과 규정을 비교해 부족 학점·미이수 필수 과목을 낸다.
 * 과목명 기반 매칭이라 학과별 표기 차이까지는 못 잡는다 — 화면에서 참고용임을 밝힌다.
 */
export const evaluateGraduation = (
  rule: GraduationRule,
  subjects: EvaluatedSubject[],
  /** 학과 단위 면제 규정을 적용하려면 넘긴다. 없으면 학칙 그대로 본다. */
  departmentCode?: string | null,
  options?: {
    /**
     * 사용자가 직접 고친 졸업 필요 학점. 수집 데이터가 학과 사정(전과·복수전공,
     * 규정 개정)까지 담지는 못하므로, 본인이 아는 값이 있으면 그쪽을 우선한다.
     */
    minTotalCredits?: number;
    /** 그 학번 교육과정표의 전공필수 과목(loadRequiredMajorCourses). 없으면 판정하지 않는다. */
    requiredMajorCourses?: RequiredMajorCourse[] | null;
  },
): GraduationEvaluation => {
  const passed = subjects.filter((subject) => subject.passed);

  const totalEarned = passed.reduce((sum, s) => sum + s.credits, 0);
  const majorEarned = passed
    .filter((s) => classifySubject(s) === "MAJOR")
    .reduce((sum, s) => sum + s.credits, 0);
  const generalSubjects = passed.filter(
    (s) => classifySubject(s) === "GENERAL",
  );
  const generalEarned = generalSubjects.reduce((sum, s) => sum + s.credits, 0);

  const { generalRequirements: general, majorRequirements: major } = rule;

  const minTotalCredits = options?.minTotalCredits ?? general.minTotalCredits;

  const credits: CreditProgress[] = [
    buildCreditProgress("total", "총 취득학점", totalEarned, minTotalCredits),
    buildCreditProgress("major", "전공", majorEarned, major.minMajorCredits),
    buildCreditProgress(
      "general",
      "교양",
      generalEarned,
      general.minGeneralCredits,
    ),
  ];

  const notices: string[] = [];

  if (major.minRequiredMajorCredits) {
    const hasIsuName = subjects.some((s) => !!s.isuName);
    const requiredMajorEarned = passed
      .filter(isRequiredMajor)
      .reduce((sum, s) => sum + s.credits, 0);
    credits.splice(
      2,
      0,
      buildCreditProgress(
        "requiredMajor",
        "전공기초·전공핵심",
        requiredMajorEarned,
        major.minRequiredMajorCredits,
        !hasIsuName,
      ),
    );
    if (!hasIsuName) {
      notices.push(
        "전공기초·전공핵심(옛 전공필수) 학점은 성적 붙여넣기로 불러온 과목(이수구분 정보)만 자동으로 셀 수 있어요.",
      );
    }
  }

  const swExempt = isSwRequirementExempt(departmentCode);

  /** 자동 판정 대상이 아닌 요건(학과 면제·이름만으로 못 정하는 요건)은 배정에서 뺀다. */
  const skipStatus = (
    course: (typeof general.requiredGeneralCourses)[number],
  ): RequiredCourseStatus | null => {
    // "SW(=전공필수 기계기초프로그래밍)"처럼 학과가 대체 과목을 정한 요건은 그대로 본다.
    if (
      swExempt &&
      course.category === "SW" &&
      !course.courseName.includes("전공")
    ) {
      return "EXEMPT";
    }
    // 과목명이 아니라 이수구분을 요건으로 적은 경우(예: 디자인학부 "기초교양 8학점")만 판정하지 않는다.
    // 물리1·선형대수학처럼 과목명이 정해진 "기타" 요건은 이름으로 맞춘다.
    if (
      course.category === "기타" &&
      DIVISION_REQUIREMENT_NAMES.has(course.courseName)
    ) {
      return "UNKNOWN";
    }
    return null;
  };

  // 배정 대상 요건만 추려 매칭하고, 결과는 원래 순서로 되돌린다.
  const assignableIndices = general.requiredGeneralCourses
    .map((course, index) => (skipStatus(course) === null ? index : -1))
    .filter((index) => index >= 0);
  const resolved = assignableIndices.map((index) =>
    resolveRequirement(general.requiredGeneralCourses[index]),
  );

  const { matchedSubjects } = assignSubjectsToRequirements(
    resolved,
    passed,
    (requirement, subject) =>
      // "SW(=전공필수 기계기초프로그래밍)"처럼 전공으로 대체되는 요건과, 학과마다 전공기초로도
      // 개설되는 과목명 요건("기타": 공업수학1 등)은 전공 과목까지 본다.
      requirement.course.courseName.includes("전공") ||
      requirement.course.category === "기타" ||
      classifySubject(subject) !== "MAJOR",
  );

  const requiredCourses: RequiredCourseProgress[] =
    general.requiredGeneralCourses.map((course, index) => {
      const skipped = skipStatus(course);
      const matched = skipped
        ? []
        : matchedSubjects[assignableIndices.indexOf(index)];
      const earnedCredits = matched.reduce(
        (sum, subject) => sum + subject.credits,
        0,
      );

      return {
        courseName: course.courseName,
        category: course.category,
        requiredCredits: course.credits,
        earnedCredits,
        status: skipped ?? toStatus(earnedCredits, course.credits),
        matchedNames: matched.map((subject) => subject.name),
      };
    });

  if (requiredCourses.some((course) => course.status === "UNKNOWN")) {
    notices.push(
      "일부 필수 교양은 과목명만으로 판정할 수 없어 직접 확인이 필요해요.",
    );
  }

  const requiredMajorCourses = options?.requiredMajorCourses
    ? matchRequiredMajorCourses(options.requiredMajorCourses, subjects)
    : undefined;

  if (requiredMajorCourses?.some((course) => !course.done)) {
    notices.push(
      "전공필수 과목은 학과 교육과정표 기준이에요. 택1 과목이나 이름이 바뀐 과목은 직접 확인해 주세요.",
    );
  }

  // 핵심교양은 학점이 아니라 과목 수로 본다(영역 중복 가능). 이수구분은 성적
  // 붙여넣기로 들어온 과목에만 있어, 없으면 판정하지 않고 안내만 한다.
  let coreGeneral: GraduationEvaluation["coreGeneral"];
  if (general.minCoreGeneralCount) {
    const courses = passed.filter(isCoreGeneral).map((subject) => subject.name);
    const unverifiable = !subjects.some((subject) => !!subject.isuName);

    coreGeneral = {
      required: general.minCoreGeneralCount,
      courses,
      satisfied: courses.length >= general.minCoreGeneralCount,
      unverifiable,
    };

    if (unverifiable) {
      notices.push(
        `핵심교양은 영역 관계없이 ${general.minCoreGeneralCount}과목 이상 이수해야 해요. 성적 붙여넣기로 불러오면 자동으로 확인해 드려요.`,
      );
    }
  }

  if (
    options?.minTotalCredits !== undefined &&
    options.minTotalCredits !== general.minTotalCredits
  ) {
    notices.push(
      `총 취득학점은 직접 설정한 ${options.minTotalCredits}학점 기준으로 계산했어요. (학칙 기준 ${general.minTotalCredits}학점)`,
    );
  }

  const generalOverflow =
    general.maxGeneralCredits >= NO_GENERAL_LIMIT
      ? 0
      : Math.max(0, generalEarned - general.maxGeneralCredits);

  if (generalOverflow > 0) {
    notices.push(
      `교양 상한(${general.maxGeneralCredits}학점)을 ${generalOverflow}학점 넘었어요. 초과분은 졸업학점에 안 들어갈 수 있어요.`,
    );
  }

  return {
    rule,
    credits,
    requiredCourses,
    requiredMajorCourses,
    coreGeneral,
    generalOverflow,
    remainingTotalCredits: Math.max(0, minTotalCredits - totalEarned),
    englishCertification: rule.englishCertification,
    notices,
  };
};

/**
 * 남은 학점을 모두 들었을 때 목표 평점에 닿기 위해 필요한 평균 평점.
 * 남은 학점이 없으면 null(더 이상 올릴 수 없음).
 */
export const calculateRequiredAverageGpa = ({
  targetGpa,
  gpaCredits,
  gpaPoints,
  remainingCredits,
}: {
  targetGpa: number;
  /** 지금까지 평점에 반영된 학점(P/NP·미입력 제외) */
  gpaCredits: number;
  /** 지금까지 평점에 반영된 학점 × 평점의 합 */
  gpaPoints: number;
  remainingCredits: number;
}): number | null => {
  if (remainingCredits <= 0) return null;
  const needed =
    (targetGpa * (gpaCredits + remainingCredits) - gpaPoints) /
    remainingCredits;
  return Math.max(0, needed);
};

export const MAX_GPA = 4.5;
