import { navBarList } from "@/resources/strings/navBarList";

type NavBarItem = {
  title?: string;
  code?: string;
  url?: string;
  child?: NavBarItem[];
  subItems?: NavBarItem[];
};

const traverseNavBarList = (
  items: NavBarItem[],
  matcher: (item: NavBarItem) => string,
): string => {
  for (const item of items) {
    const matchedValue = matcher(item);
    if (matchedValue) return matchedValue;

    if (item.child) {
      const found = traverseNavBarList(item.child, matcher);
      if (found) return found;
    }

    if (item.subItems) {
      const found = traverseNavBarList(item.subItems, matcher);
      if (found) return found;
    }
  }

  return "";
};

/**
 * title을 인자로 주면 code를 반환
 * code를 인자로 주면 title을 반환
 */
export default function findTitleOrCode(
  value: string | null | undefined,
): string {
  const normalizedValue =
    typeof value === "string" ? value.trim() : "";

  if (!normalizedValue) {
    return "";
  }

  return traverseNavBarList(navBarList as NavBarItem[], (item) => {
    if (item.code && item.title === normalizedValue) return item.code;
    if (item.code && item.code === normalizedValue) return item.title ?? "";
    return "";
  });
}

export const findDepartmentHomepageUrl = (
  value: string | null | undefined,
): string => {
  const normalizedValue =
    typeof value === "string" ? value.trim() : "";

  if (!normalizedValue) {
    return "";
  }

  return traverseNavBarList(navBarList as NavBarItem[], (item) => {
    if (!item.url) return "";
    if (item.code === normalizedValue || item.title === normalizedValue) {
      return item.url;
    }
    return "";
  });
};
