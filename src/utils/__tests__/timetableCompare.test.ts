import { describe, expect, it } from "vitest";
import {
  ME_FRIEND_ID,
  isAnySelectedFriendTimetableLoading,
} from "../timetableCompare";

describe("isAnySelectedFriendTimetableLoading", () => {
  const states = new Map<number, string>([
    [1, "PUBLIC"],
    [2, "LOADING"],
    [3, "PRIVATE"],
  ]);

  it("선택한 친구 중 LOADING이 있으면 로딩 중이다", () => {
    expect(isAnySelectedFriendTimetableLoading([ME_FRIEND_ID, 1, 2], states, false)).toBe(true);
  });

  it("모두 로드됐으면(비공개 등 포함) 로딩이 아니다", () => {
    expect(isAnySelectedFriendTimetableLoading([ME_FRIEND_ID, 1, 3], states, false)).toBe(false);
  });

  it("'나'만 선택했으면 로딩이 아니다", () => {
    expect(isAnySelectedFriendTimetableLoading([ME_FRIEND_ID], new Map(), true)).toBe(false);
  });

  it("더는 친구가 아닌 ID(상태 맵에 없음)는 친구 목록을 받은 뒤에는 로딩으로 보지 않는다", () => {
    expect(isAnySelectedFriendTimetableLoading([ME_FRIEND_ID, 1, 404], states, false)).toBe(false);
  });

  it("친구 목록을 받는 중이면 상태 맵에 없는 ID는 로딩으로 본다", () => {
    expect(isAnySelectedFriendTimetableLoading([ME_FRIEND_ID, 404], new Map(), true)).toBe(true);
  });
});
