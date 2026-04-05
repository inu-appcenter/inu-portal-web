import { DirectoryCategory } from "@/types/directory";

export type PhonebookScope = "people" | "office";

export const MIN_PHONEBOOK_QUERY_LENGTH = 2;
export const PHONEBOOK_MIN_QUERY_MESSAGE = "검색어는 2글자 이상 입력해주세요.";

export const PEOPLE_CATEGORY_OPTIONS: Array<{
  label: string;
  value?: DirectoryCategory;
}> = [
  { label: "전체" },
  { label: "대학본부", value: "HEADQUARTERS" },
  { label: "대학", value: "UNIVERSITY" },
  { label: "대학원", value: "GRADUATE_SCHOOL" },
  { label: "부속기관", value: "AFFILIATED_INSTITUTION" },
];

export const CATEGORY_LABELS: Record<DirectoryCategory, string> = {
  HEADQUARTERS: "대학본부",
  UNIVERSITY: "대학",
  GRADUATE_SCHOOL: "대학원",
  AFFILIATED_INSTITUTION: "부속기관",
};

export const DEFAULT_CATEGORY_LABEL = "전체";

export function getPhonebookScope(searchParams: URLSearchParams): PhonebookScope {
  return searchParams.get("scope") === "office" ? "office" : "people";
}

export function getCategoryLabel(categoryLabel: string | null) {
  return PEOPLE_CATEGORY_OPTIONS.some(({ label }) => label === categoryLabel)
    ? categoryLabel || DEFAULT_CATEGORY_LABEL
    : DEFAULT_CATEGORY_LABEL;
}

export function getCategoryValue(categoryLabel: string | null) {
  return PEOPLE_CATEGORY_OPTIONS.find(({ label }) => label === categoryLabel)
    ?.value;
}

export function normalizeExternalUrl(url: string) {
  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("/")) {
    return `https://www.inu.ac.kr${url}`;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `https://${url}`;
}
