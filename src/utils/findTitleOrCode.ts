import { navBarList } from "old/resource/string/navBarList";

/**
 * title을 인자로 주면 code를 반환
 * code를 인자로 주면 title을 반환
 */
export default function findTitleOrCode(value: string): string {
  function dfs(items: any): string {
    for (const item of items) {
      // code와 title 매칭 확인
      if (item.code && item.title === value) return item.code;
      if (item.code && item.code === value) return item.title;

      // child 탐색
      if (item.child) {
        const found = dfs(item.child);
        if (found) return found;
      }

      // subItems 탐색
      if (item.subItems) {
        const found = dfs(item.subItems);
        if (found) return found;
      }
    }
    return "";
  }

  return dfs(navBarList);
}
