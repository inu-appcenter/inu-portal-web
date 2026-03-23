import { navBarList } from "old/resource/string/navBarList";

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
export default function findTitleOrCode(value: string): string {
  return traverseNavBarList(navBarList as NavBarItem[], (item) => {
    if (item.code && item.title === value) return item.code;
    if (item.code && item.code === value) return item.title ?? "";
    return "";
  });
}

export const findDepartmentHomepageUrl = (value: string): string => {
  return traverseNavBarList(navBarList as NavBarItem[], (item) => {
    if (!item.url) return "";
    if (item.code === value || item.title === value) return item.url;
    return "";
  });
};
