import { navBarList } from "@/resources/strings/navBarList";
import findTitleOrCode from "@/utils/findTitleOrCode";

export interface DepartmentOption {
  code: string;
  title: string;
}

export interface DepartmentOptionGroup {
  /** 단과대학 이름 */
  college: string;
  departments: DepartmentOption[];
}

type NavBarNode = {
  title?: string;
  code?: string;
  child?: NavBarNode[];
  subItems?: NavBarNode[];
};

/**
 * navBarList의 "학과 홈페이지" 트리를 단과대학별 학과 목록으로 편다.
 * 학과 선택 UI가 서버 departmentCode와 같은 코드를 쓰도록 이 목록을 단일 출처로 삼는다.
 */
export const getDepartmentOptionGroups = (): DepartmentOptionGroup[] => {
  const root = (navBarList as NavBarNode[]).find(
    (item) => item.title === "학과 홈페이지",
  );

  return (root?.child ?? [])
    .map((college) => ({
      college: college.title ?? "",
      departments: (college.subItems ?? [])
        .filter((item): item is NavBarNode & { code: string; title: string } =>
          Boolean(item.code && item.title),
        )
        .map((item) => ({ code: item.code, title: item.title })),
    }))
    .filter((group) => group.departments.length > 0);
};

/**
 * 학과명 표기가 navBarList 학과명과 다른 경우의 대응표.
 *
 * 서버 `SchoolDepartmentNoticeMapper.NAME_ALIASES`(학사 학과명 → Department enum)와
 * 같은 내용을 맞춰 둔다. 서버가 학과 enum을 응답에 실어 주면 이 표는 지울 수 있다.
 * 아래 두 갈래를 다 받는다.
 *  - 학사 학과명(회원이 학과를 등록한 경우 `department`가 이 값으로 덮인다)
 *  - Department enum 자체의 한글명(학사 학과가 없을 때 내려오는 값)
 */
const DEPARTMENT_NAME_ALIASES: Record<string, string> = {
  // 서버 mapper와 동일
  무역학부: "TRADE",
  "Global Trade & Service 학부": "TRADE",
  "Global Trade & Service학부": "TRADE",
  테크노경영학과: "TECHNO_MANAGEMENT",
  건설환경공학전공: "CIVIL_ENVIRONMENT_ENGINEERING",
  도시건축학전공: "URBAN_ARCHITECTURE",
  환경공학전공: "ENVIRONMENT_ENGINEERING",
  "바이오-로봇시스템공학과": "BIO_ROBOTICS_ENGINEERING",
  나노바이오공학전공: "BIOENGINEERING_NANO",
  생명공학부: "BIOENGINEERING",
  생명공학전공: "BIOENGINEERING",
  분자의생명전공: "LIFE_SCIENCE_MOLECULAR",
  생명과학부: "LIFE_SCIENCE",
  생명과학전공: "LIFE_SCIENCE",
  전자공학부: "ELECTRONICS_ENGINEERING",
  전자공학전공: "ELECTRONICS_ENGINEERING",
  // Department enum의 한글명이 navBarList 표기와 다른 학과
  계약학과: "TECHNO_MANAGEMENT",
  // 개설강의 학과명에만 나오는 표기
  건축공학전공: "URBAN_ARCHITECTURE",
  한국화전공: "FINE_ARTS",
  서양화전공: "FINE_ARTS",
};

/** 괄호·공백·붙임표 차이와 야간 표기를 지운다. "바이오-로봇시스템공학과" = "바이오로봇시스템공학과" */
const normalizeDepartmentName = (name: string): string =>
  name
    .trim()
    .replace(/\((야|야간)\)$/, "")
    .replace(/[\s·\-()]/g, "")
    .toLowerCase();

let normalizedNameToCode: Map<string, string> | null = null;

/** navBarList 학과명 + 별칭을 정규화한 이름으로 찾을 수 있게 편다. */
const getNormalizedNameIndex = (): Map<string, string> => {
  if (normalizedNameToCode) return normalizedNameToCode;

  const index = new Map<string, string>();
  getDepartmentOptionGroups().forEach((group) =>
    group.departments.forEach(({ code, title }) => {
      index.set(normalizeDepartmentName(title), code);
    }),
  );
  Object.entries(DEPARTMENT_NAME_ALIASES).forEach(([name, code]) => {
    index.set(normalizeDepartmentName(name), code);
  });

  normalizedNameToCode = index;
  return index;
};

/**
 * 학과명(서버 `department`)으로 navBarList 학과 코드를 찾는다.
 *
 * 서버 `departmentCode`는 학사 시스템 코드("0000077")라 navBarList 코드와 다른
 * 체계다. 학과 매핑은 다른 화면들처럼 학과명을 기준으로 해야 한다.
 */
export const findDepartmentCodeByName = (
  departmentName: string | null | undefined,
): string => {
  const name = (departmentName ?? "").trim();
  if (!name) return "";

  const exact = findTitleOrCode(name);
  if (exact) return exact;

  return getNormalizedNameIndex().get(normalizeDepartmentName(name)) ?? "";
};
