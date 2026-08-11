// 강의 검색 필터의 "값"과 그 값에 대한 순수 함수만 모은 모듈.
// 화면(라우트 페이지 / 마법사 시트 내부 오버레이)이 무엇이든 필터의 의미는 하나여야 하므로,
// 상태를 들고 있는 쪽이 아니라 여기서 타입·기본값·파생 계산을 단일하게 정의한다.

export interface FilterState {
  major: string | null;
  sort: string;
  time: string;
  grades: number[];
  types: string[];
  credits: number[];
  onlineTypes: string[];
  selectedSlots?: string[];
}

export const DEFAULT_FILTERS: FilterState = {
  major: null,
  sort: "기본순",
  time: "전체 시간",
  grades: [],
  types: [],
  credits: [],
  onlineTypes: [],
  selectedSlots: [],
};

export type FilterSubView =
  | "main"
  | "major"
  | "sort"
  | "time"
  | "grade"
  | "type"
  | "credit"
  | "online";

export const CATEGORIES = [
  { id: "major", label: "전공/영역" },
  { id: "sort", label: "정렬" },
  { id: "time", label: "시간" },
  { id: "grade", label: "학년" },
  { id: "type", label: "이수구분" },
  { id: "online", label: "이러닝/온라인" },
  { id: "credit", label: "학점" },
] as const;

export type FilterCategoryId = (typeof CATEGORIES)[number]["id"];

export const FILTER_SUB_VIEW_TITLES: Record<FilterSubView, string> = {
  main: "필터",
  major: "전공/영역",
  sort: "정렬",
  time: "시간",
  grade: "학년",
  type: "이수구분",
  online: "이러닝/온라인",
  credit: "학점",
};

export const ONLINE_TYPE_OPTIONS = [
  "이러닝",
  "이러닝(HUSS)",
  "OCU",
  "온라인 혼합",
  "온라인 혼합(HUSS)",
  "K-MOOC",
  "RISE(시간표 없음)",
] as const;

export const ONLINE_TYPE_TO_SSUP_NAMES: Record<string, readonly string[]> = {
  이러닝: ["e-Learning"],
  "이러닝(HUSS)": ["e-Learning(HUSS)"],
  OCU: ["열린사이버대학(OCU)"],
  "온라인 혼합": ["온라인혼합형강좌"],
  "온라인 혼합(HUSS)": ["온라인혼합형강좌(HUSS)"],
  "K-MOOC": ["K-MOOC"],
  "RISE(시간표 없음)": ["RISE(시간표 없음)"],
};

export const expandOnlineTypeLabel = (label: string): readonly string[] =>
  ONLINE_TYPE_TO_SSUP_NAMES[label] ?? [label];

const ONLINE_TYPE_CODE_TO_LABEL: Record<string, string> = {
  E_LEARNING: "이러닝",
  E_LEARNING_HUSS: "이러닝(HUSS)",
  OCU: "OCU",
  BLENDED_ONLINE_COURSE: "온라인 혼합",
  BLENDED_ONLINE_COURSE_HUSS: "온라인 혼합(HUSS)",
  K_MOOC: "K-MOOC",
  RISE_WITHOUT_TIMETABLE: "RISE(시간표 없음)",
};

export function getOnlineTypeLabel(
  ssupTypeName?: string | null,
  ssupTypeCode?: string | null,
): string | null {
  const val = ssupTypeName || ssupTypeCode;
  if (!val) return null;

  const upper = val.toUpperCase();
  if (upper === "OFFLINE" || val === "강의(이론)") return null;

  for (const [label, names] of Object.entries(ONLINE_TYPE_TO_SSUP_NAMES)) {
    if (names.some((n) => n.toLowerCase() === val.toLowerCase())) {
      return label;
    }
  }

  if (ssupTypeCode) {
    const codeLabel = ONLINE_TYPE_CODE_TO_LABEL[ssupTypeCode.toUpperCase()];
    if (codeLabel) return codeLabel;
  }

  return ssupTypeName || ssupTypeCode || null;
}


export const SORT_OPTIONS = ["기본순", "별점높은순", "담은인원많은순"] as const;
export const TYPE_OPTIONS = ["전공", "교양", "교직", "일반선택", "군사학"] as const;

/**
 * 서버 `isuNames`(이수구분) 파라미터가 실제로 받는 값.
 *
 * 서버는 정확일치로 거르므로 여기 없는 문자열을 보내면 조건 없이 0건이 나온다.
 * (2026-2학기 개설강의 전수 기준으로 확인한 값 — 코드값 "BASIC_LIBERAL_ARTS" 같은 것도
 * 받지 않고 한글 라벨만 받는다.)
 */
export const SERVER_ISU_NAMES = [
  "전공기초",
  "전공핵심",
  "전공심화",
  "기초교양",
  "핵심교양",
  "심화교양",
  "교직",
  "일반선택",
  "군사학",
] as const;

/**
 * UI에서 쓰는 묶음 라벨("전공", "교양")은 서버 이수구분이 아니다.
 * 서버 `isuNames`는 같은 파라미터를 반복하면 OR로 묶어주므로 구성 값으로 펼쳐서 보낸다.
 */
const ISU_NAME_GROUPS: Record<string, readonly string[]> = {
  전공: ["전공기초", "전공핵심", "전공심화"],
  교양: ["기초교양", "핵심교양", "심화교양"],
};

const SERVER_ISU_NAME_SET: ReadonlySet<string> = new Set(SERVER_ISU_NAMES);

/** 필터 라벨이 이수구분(전공/교양 묶음 포함)인지 - 학과명·단과대명과 구분하는 데 쓴다. */
export const isIsuNameLabel = (label: string): boolean =>
  label in ISU_NAME_GROUPS || SERVER_ISU_NAME_SET.has(label);

/** 필터 라벨을 서버가 받는 이수구분 값들로 펼친다. 이수구분이 아니면 빈 배열. */
export const expandIsuNameLabel = (label: string): readonly string[] =>
  ISU_NAME_GROUPS[label] ?? (SERVER_ISU_NAME_SET.has(label) ? [label] : []);

export const GRADE_OPTIONS = [1, 2, 3, 4] as const;
export const CREDIT_OPTIONS = [1, 2, 3, 4] as const;

// 단과대별 매핑 — 서버 Swagger deptName / collegeName 기준
export const COLLEGE_DEPARTMENTS: Record<string, string[]> = {
  인문대학: [
    "국어국문학과",
    "영어영문학과",
    "독어독문학과",
    "불어불문학과",
    "일본지역문화학과",
    "중어중국학과",
  ],
  자연과학대학: ["수학과", "물리학과", "화학과", "패션산업학과", "해양학과"],
  사회과학대학: [
    "사회복지학과",
    "미디어커뮤니케이션학과",
    "문헌정보학과",
    "창의인재개발학과",
  ],
  글로벌정경대학: [
    "행정학과",
    "정치외교학과",
    "경제학과",
    "경제학과(야)",
    "소비자학과",
    "동북아국제통상전공",
    "Global Trade & Service학부",
    "무역학부(야)",
  ],
  공과대학: [
    "기계공학과",
    "전기공학과",
    "전자공학과",
    "전자공학부",
    "전자공학전공",
    "산업경영공학과",
    "신소재공학과",
    "안전공학과",
    "에너지화학공학과",
    "건설환경공학전공",
    "건축공학전공",
    "바이오-로봇시스템공학과",
    "나노바이오공학전공",
  ],
  정보기술대학: [
    "컴퓨터공학부",
    "정보통신공학과",
    "임베디드시스템공학과",
    "데이터과학과",
  ],
  경영대학: ["경영학부", "세무회계학과", "IBE전공"],
  예술체육대학: [
    "조형예술학부",
    "디자인학부",
    "스포츠과학부",
    "운동건강학부",
    "공연예술학과",
    "서양화전공",
    "한국화전공",
  ],
  사범대학: [
    "국어교육과",
    "영어교육과",
    "일어교육과",
    "수학교육과",
    "체육교육과",
    "유아교육과",
    "역사교육과",
    "윤리교육과",
  ],
  도시과학대학: [
    "도시행정학과",
    "도시공학과",
    "도시환경공학부",
    "도시건축학부",
    "도시건축학전공",
    "환경공학전공",
  ],
  생명과학기술대학: [
    "생명과학부",
    "생명과학전공",
    "분자의생명전공",
    "생명공학부",
    "생명공학전공",
  ],
  융합자유전공대학: ["자유전공학부"],
  "단과대구분없음(법학)": ["법학부"],
};

// 연계전공 목록 (서버 deptName 기준)
export const LINKED_MAJORS = [
  "광전자공학전공(연계)",
  "물류학전공(연계)",
  "미래교육디자인연계전공",
  "미래자동차연계전공",
  "반도체융합전공",
  "소셜데이터사이언스연계전공",
  "스마트물류공학전공",
  "인문문화예술기획연계전공",
  "지능형로봇시스템연계전공",
  "창의적디자인연계전공",
  "HUSS(타대학)",
  "HUSS포용사회이니셔티브학부",
];

export const MAJOR_CATEGORIES = [
  { id: "major_1", name: "전공", hasChevron: true },
  { id: "major_2", name: "교양", hasChevron: true },
  { id: "major_7", name: "연계전공", hasChevron: true },
  { id: "major_3", name: "교직", hasChevron: false },
  { id: "major_4", name: "일반선택", hasChevron: false },
  { id: "major_5", name: "군사학", hasChevron: false },
];

export const SUB_MAJORS: Record<string, string[]> = {
  전공: Object.keys(COLLEGE_DEPARTMENTS),
  // 서버 이수구분(isuName) 값 그대로. 구 교육과정 명칭인 "균형교양"/"일반교양"을 보내면
  // 서버가 정확일치로 걸러 항상 0건이 나온다.
  교양: ["기초교양", "핵심교양", "심화교양"],
  연계전공: LINKED_MAJORS,
};

export const PINNED_MAJORS_STORAGE_KEY = "pinned_majors";

const DEFAULT_PINNED_MAJOR = "정보기술대학";

export const getDefaultPinnedMajors = (userDepartment: string): string[] => {
  const department = userDepartment.trim();
  if (!department) return [DEFAULT_PINNED_MAJOR];

  if (COLLEGE_DEPARTMENTS[department]) {
    return [department];
  }

  const college = Object.entries(COLLEGE_DEPARTMENTS).find(([, departments]) =>
    departments.includes(department),
  )?.[0];

  return college ? [college, department] : [DEFAULT_PINNED_MAJOR];
};

export function formatSlotsToTimeStr(slots: string[]): string {
  if (!slots || slots.length === 0) return "직접 시간 선택";
  const DAYS_SHORT = ["월", "화", "수", "목", "금"];

  const dayGroups: Record<number, number[]> = {};
  slots.forEach((slot) => {
    const [dStr, hStr] = slot.split("-");
    const d = parseInt(dStr, 10);
    const h = parseFloat(hStr);
    if (!dayGroups[d]) dayGroups[d] = [];
    dayGroups[d].push(h);
  });

  const dayStrings: string[] = [];
  const sortedDays = Object.keys(dayGroups)
    .map(Number)
    .sort((a, b) => a - b);

  sortedDays.forEach((d) => {
    const hours = dayGroups[d].sort((a, b) => a - b);
    const ranges: string[] = [];

    let start = hours[0];
    let prev = hours[0];

    for (let i = 1; i <= hours.length; i++) {
      const current = hours[i];
      if (current === prev + 0.5) {
        prev = current;
      } else {
        const end = prev + 0.5;
        const formatHour = (val: number): string => {
          const h = Math.floor(val);
          const m = Math.round((val - h) * 60);
          return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        };
        ranges.push(`${formatHour(start)}~${formatHour(end)}`);
        start = current;
        prev = current;
      }
    }

    dayStrings.push(`${DAYS_SHORT[d] || "요일"}(${ranges.join(",")})`);
  });

  return dayStrings.join(" ");
}

/**
 * 필터 버튼에 표시할 "적용된 조건 개수". 화면마다 제각각 세던 로직을 하나로 모은다.
 */
export function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.major) count += 1;
  if (filters.sort !== DEFAULT_FILTERS.sort) count += 1;
  if (filters.time !== DEFAULT_FILTERS.time) count += 1;
  count += filters.grades.length;
  count += filters.types.length;
  count += filters.onlineTypes?.length ?? 0;
  count += filters.credits.length;
  return count;
}

/**
 * 카테고리별 요약 칩. 필터 메인 화면에서 각 행 옆에 붙는 값들.
 */
export function buildCategoryChips(
  filters: FilterState,
): Record<FilterCategoryId, string[]> {
  return {
    major: filters.major ? [filters.major] : [],
    sort: filters.sort === DEFAULT_FILTERS.sort ? [] : [filters.sort],
    time:
      filters.time === DEFAULT_FILTERS.time || filters.time === "직접 시간 선택"
        ? []
        : filters.time.split(" "),
    grade: filters.grades.map((g) => `${g}학년`),
    type: [...filters.types],
    online: [...(filters.onlineTypes ?? [])],
    credit: filters.credits.map((c) => (c === 4 ? "4학점 이상" : `${c}학점`)),
  };
}

/**
 * 요약 칩의 X를 눌렀을 때 해당 조건만 걷어낸 새 필터를 돌려준다(순수 함수).
 */
export function removeChipFromFilters(
  filters: FilterState,
  categoryId: FilterCategoryId,
  chip: string,
): FilterState {
  switch (categoryId) {
    case "major":
      return { ...filters, major: null };
    case "sort":
      return { ...filters, sort: DEFAULT_FILTERS.sort };
    case "time": {
      const DAYS_SHORT = ["월", "화", "수", "목", "금"];
      const dayIdx = DAYS_SHORT.indexOf(chip.charAt(0));
      const nextSlots = (filters.selectedSlots || []).filter(
        (slot) => !slot.startsWith(`${dayIdx}-`),
      );
      return {
        ...filters,
        time: nextSlots.length > 0 ? formatSlotsToTimeStr(nextSlots) : DEFAULT_FILTERS.time,
        selectedSlots: nextSlots,
      };
    }
    case "grade": {
      const val = parseInt(chip.replace("학년", ""), 10);
      return { ...filters, grades: filters.grades.filter((g) => g !== val) };
    }
    case "type":
      return { ...filters, types: filters.types.filter((t) => t !== chip) };
    case "online":
      return {
        ...filters,
        onlineTypes: (filters.onlineTypes ?? []).filter((t) => t !== chip),
      };
    case "credit": {
      const val = chip === "4학점 이상" ? 4 : parseInt(chip.replace("학점", ""), 10);
      return { ...filters, credits: filters.credits.filter((c) => c !== val) };
    }
    default:
      return filters;
  }
}
