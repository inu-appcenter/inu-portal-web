import { GRADUATION_REQUIREMENTS } from "@/resources/data/graduationRequirements";
import { getCollegeByDepartmentCode } from "@/utils/departmentOptions";
import type {
  CreditProgress,
  DepartmentGraduationRequirement,
  EvaluatedSubject,
  GraduationEvaluation,
  GraduationRule,
  RequiredCourseProgress,
  RequiredCourseStatus,
  RequiredGeneralCategory,
  RequiredGeneralCourse,
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
 * SW 필수 교양을 면제로 보는 단과대학.
 *
 * 정보기술대학 학과들은 프로그래밍 교과가 전공에 들어 있어 SW 교양을 따로 듣지
 * 않는다. 학칙 표에는 SW가 그대로 적혀 있어 데이터는 원문대로 두고, 판정할 때만
 * 면제로 본다. (전공 과목을 SW 요건에 끌어다 쓰면 전공 학점이 이중으로 세여서
 * `allowMajor`로 푸는 방식은 쓰지 않는다.)
 */
const SW_EXEMPT_COLLEGES = new Set(["정보기술대학"]);

/** 그 학과가 SW 필수 교양을 면제받는지 */
export const isSwRequirementExempt = (
  departmentCode: string | null | undefined,
): boolean =>
  SW_EXEMPT_COLLEGES.has(getCollegeByDepartmentCode(departmentCode));

// --- 필수 교양 과목 매칭 ---

/**
 * 요건의 과목명이 "국어", "영어", "회화"처럼 영역만 가리키는 경우에는
 * 그 영역의 대표 키워드로 넓혀서 찾는다.
 */
const CATEGORY_KEYWORDS: Record<RequiredGeneralCategory, string[]> = {
  국어: ["국어", "글쓰기", "작문", "말하기"],
  영어: ["영어", "english"],
  SW: ["sw", "소프트웨어", "컴퓨팅적사고", "코딩"],
  수학: ["수학", "미적분"],
  기타: [],
};

const GENERIC_ALIASES = new Set(["국어", "영어", "sw", "수학", "회화"]);

/** 과목명에서 떼어내도 의미가 없는 조각들 */
const STOP_TOKENS = new Set([
  "관련",
  "과목",
  "1과목",
  "이상",
  "또는",
  "전공필수",
  "및",
  "기타",
  "선택",
  "academic",
]);

const normalizeName = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[\s·,()[\]{}/\\&+.'"’-]/g, "")
    .replace(/[0-9]+$/, "");

/**
 * 요건 과목명을 매칭용 별칭들로 푼다.
 * "영어(대학영어 또는 Academic English)" → ["영어"(→영역 키워드), "대학영어", "academicenglish"]
 */
const buildAliases = (course: RequiredGeneralCourse): string[] => {
  const raw = course.courseName;
  const segments = raw
    .replace(/[()]/g, " ")
    .split(/또는|,|\/|=/g)
    .flatMap((segment) => [segment, ...segment.split(/\s+/)]);

  const aliases = new Set<string>();
  segments.forEach((segment) => {
    const normalized = normalizeName(segment);
    if (!normalized || STOP_TOKENS.has(normalized)) return;

    if (GENERIC_ALIASES.has(normalized)) {
      CATEGORY_KEYWORDS[course.category].forEach((keyword) =>
        aliases.add(keyword),
      );
      return;
    }
    // 너무 짧은 조각은 아무 과목명에나 걸린다.
    if (normalized.length < 3) return;
    aliases.add(normalized);
  });

  if (aliases.size === 0) {
    CATEGORY_KEYWORDS[course.category].forEach((keyword) =>
      aliases.add(keyword),
    );
  }

  return [...aliases];
};

type SubjectKind = "MAJOR" | "GENERAL" | "OTHER";

/**
 * 인천대는 2022년에 이수구분 명칭을 바꿨다 — 타 대학의
 * 전공필수/전공선택 → 전공기초·전공핵심/전공심화,
 * 교양필수/교양선택 → 기초교양·핵심교양/심화교양.
 * (서버가 실제로 쓰는 값은 courseFilterModel.ts의 SERVER_ISU_NAMES 참고.)
 * 옛 성적표에는 이전 명칭이 그대로 남아 있어 양쪽을 다 본다.
 */
const REQUIRED_MAJOR_ISU_NAMES = ["전공기초", "전공핵심", "전공필수"];
const CORE_GENERAL_ISU_NAMES = ["핵심교양", "균형교양","교양필수"];

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

/** 핵심교양 이수영역. "-"처럼 영역이 비어 있는 행은 셀 수 없다. */
const getCoreGeneralArea = (subject: EvaluatedSubject): string | null => {
  const isuName = subject.isuName ?? "";
  console.log(subject)

  if (!CORE_GENERAL_ISU_NAMES.some((name) => isuName.includes(name))) {
    return null;
  }
  const area = (subject.isuFldName ?? "").trim();
  if (!area || area === "-") return null;
  return area;
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

  const credits: CreditProgress[] = [
    buildCreditProgress(
      "total",
      "총 취득학점",
      totalEarned,
      general.minTotalCredits,
    ),
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

  // 한 과목이 두 요건에 동시에 잡히지 않도록 소비한 과목을 기록한다.
  const consumed = new Set<number>();
  const requiredCourses: RequiredCourseProgress[] =
    general.requiredGeneralCourses.map((course) => {
      if (swExempt && course.category === "SW") {
        return {
          courseName: course.courseName,
          category: course.category,
          requiredCredits: course.credits,
          earnedCredits: 0,
          status: "EXEMPT" as RequiredCourseStatus,
          matchedNames: [],
        };
      }

      if (course.category === "기타") {
        return {
          courseName: course.courseName,
          category: course.category,
          requiredCredits: course.credits,
          earnedCredits: 0,
          status: "UNKNOWN" as RequiredCourseStatus,
          matchedNames: [],
        };
      }

      const aliases = buildAliases(course);
      // "SW(=전공필수 기계기초프로그래밍)"처럼 전공으로 대체되는 요건만 전공 과목까지 본다.
      const allowMajor = course.courseName.includes("전공");

      let earnedCredits = 0;
      const matchedNames: string[] = [];

      passed.forEach((subject, index) => {
        if (consumed.has(index)) return;
        if (earnedCredits >= course.credits) return;
        if (!allowMajor && classifySubject(subject) === "MAJOR") return;

        const name = normalizeName(subject.name);
        if (!name) return;
        if (!aliases.some((alias) => name.includes(alias))) return;

        consumed.add(index);
        earnedCredits += subject.credits;
        matchedNames.push(subject.name);
      });

      return {
        courseName: course.courseName,
        category: course.category,
        requiredCredits: course.credits,
        earnedCredits,
        status: toStatus(earnedCredits, course.credits),
        matchedNames,
      };
    });

  if (requiredCourses.some((course) => course.status === "EXEMPT")) {
    notices.push(
      "정보기술대학은 SW 교과가 전공에 들어 있어 SW 필수 교양은 면제로 봤어요.",
    );
  }

  if (requiredCourses.some((course) => course.status === "UNKNOWN")) {
    notices.push(
      "일부 필수 교양은 과목명만으로 판정할 수 없어 직접 확인이 필요해요.",
    );
  }

  // 핵심교양은 학점이 아니라 이수영역 수로 본다. 이수영역은 성적 붙여넣기로
  // 들어온 과목에만 있어, 없으면 판정하지 않고 안내만 한다.
  let coreGeneral: GraduationEvaluation["coreGeneral"];
  if (general.minCoreGeneralCount) {
    const areas = [
      ...new Set(
        passed
          .map(getCoreGeneralArea)
          .filter((area): area is string => area !== null),
      ),
    ];
    const unverifiable = areas.length === 0;

    coreGeneral = {
      required: general.minCoreGeneralCount,
      areas,
      satisfied: areas.length >= general.minCoreGeneralCount,
      unverifiable,
    };

    if (unverifiable) {
      notices.push(
        `핵심교양은 ${general.minCoreGeneralCount}개 영역 이상 이수해야 해요. 성적 붙여넣기로 불러오면 이수영역까지 자동으로 확인해 드려요.`,
      );
    }
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
    coreGeneral,
    generalOverflow,
    remainingTotalCredits: Math.max(0, general.minTotalCredits - totalEarned),
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
