import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTimetableStore, getCachedTimetableState } from "../useTimetableStore";
import useUserStore from "../useUserStore";
import { queryClient } from "../../lib/queryClient";
import { TIMETABLES_QUERY_KEY } from "../useTimetableStore";

const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, String(value)),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};

globalThis.localStorage = localStorageMock as unknown as Storage;
if (!globalThis.window) {
  (globalThis as unknown as { window: typeof globalThis }).window = globalThis;
}
globalThis.window.localStorage = localStorageMock as unknown as Storage;

const createMockJwt = (sub: string) => {
  const payload = Buffer.from(JSON.stringify({ sub })).toString("base64");
  return `header.${payload}.signature`;
};

describe("User Timetable Sync", () => {
  beforeEach(() => {
    localStorageMock.clear();
    useTimetableStore.setState({
      selectedSemester: "",
      activeTimetableId: null,
      timetables: [],
    });
    queryClient.clear();
  });

  it("reloadTimetableCache는 지정된 유저의 로컬 캐시를 스토어에 로드한다", () => {
    const userA = "202100001";
    const cacheDataA = {
      version: 1,
      selectedSemester: "2025-1",
      activeTimetableId: 101,
      timetables: [
        {
          id: 101,
          name: "User A 시간표",
          semester: "2025-1",
          semesterId: 1,
          year: 2025,
          term: "FIRST",
          isRepresentative: true,
          visibility: "PUBLIC",
          events: [],
        },
      ],
    };

    localStorage.setItem(`timetable-cache:v1:${userA}`, JSON.stringify(cacheDataA));

    useTimetableStore.getState().reloadTimetableCache(userA);

    const state = useTimetableStore.getState();
    expect(state.selectedSemester).toBe("2025-1");
    expect(state.activeTimetableId).toBe(101);
    expect(state.timetables).toHaveLength(1);
    expect(state.timetables[0].name).toBe("User A 시간표");
  });

  it("캐시가 없는 유저로 reloadTimetableCache 호출 시 빈 상태로 초기화된다", () => {
    useTimetableStore.setState({
      selectedSemester: "2025-1",
      activeTimetableId: 101,
      timetables: [
        {
          id: 101,
          name: "Old 시간표",
          semester: "2025-1",
          semesterId: 1,
          year: 2025,
          term: "FIRST",
          isRepresentative: true,
          visibility: "PUBLIC",
          events: [],
        },
      ],
    });

    useTimetableStore.getState().reloadTimetableCache("non-existent-user");

    const state = useTimetableStore.getState();
    expect(state.selectedSemester).toBe("");
    expect(state.activeTimetableId).toBeNull();
    expect(state.timetables).toHaveLength(0);
  });

  it("useUserStore의 setTokenInfo로 다른 유저 로그인 시 시간표 스토어와 쿼리 캐시가 무효화된다", () => {
    const tokenA = createMockJwt("userA");
    const tokenB = createMockJwt("userB");

    // 먼저 userA의 시간표 캐시를 localStorage에 세팅
    localStorage.setItem(
      "timetable-cache:v1:userA",
      JSON.stringify({
        version: 1,
        selectedSemester: "2025-1",
        activeTimetableId: 101,
        timetables: [
          {
            id: 101,
            name: "User A 시간표",
            semester: "2025-1",
            semesterId: 1,
            year: 2025,
            term: "FIRST",
            isRepresentative: true,
            visibility: "PUBLIC",
            events: [],
          },
        ],
      }),
    );

    // userA 로그인
    useUserStore.getState().setTokenInfo({
      accessToken: tokenA,
      accessTokenExpiredTime: "2099-01-01",
      refreshToken: "rfA",
      refreshTokenExpiredTime: "2099-01-01",
    });

    expect(useTimetableStore.getState().activeTimetableId).toBe(101);

    // queryClient에 시간표 쿼리 캐시 데이터 임의 삽입
    queryClient.setQueryData([...TIMETABLES_QUERY_KEY, "userA", "all", "all"], [{ id: 101 }]);
    expect(queryClient.getQueryData([...TIMETABLES_QUERY_KEY, "userA", "all", "all"])).toBeDefined();

    // 이제 userB로 로그인 (계정 변경)
    useUserStore.getState().setTokenInfo({
      accessToken: tokenB,
      accessTokenExpiredTime: "2099-01-01",
      refreshToken: "rfB",
      refreshTokenExpiredTime: "2099-01-01",
    });

    // userB는 캐시가 없으므로 스토어가 초기화되어야 함
    expect(useTimetableStore.getState().activeTimetableId).toBeNull();
    expect(useTimetableStore.getState().timetables).toHaveLength(0);

    // queryClient의 시간표 쿼리 캐시가 제거되었어야 함
    expect(queryClient.getQueryData([...TIMETABLES_QUERY_KEY, "userA", "all", "all"])).toBeUndefined();
  });
});
