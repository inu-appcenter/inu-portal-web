import { describe, it, expect, vi, beforeEach } from "vitest";
import { MutationObserver, QueryClient } from "@tanstack/react-query";
import type { TimeTableDetail } from "@/types/timetables";

const calls: { memo: string | null; resolve: () => void; reject: (e: Error) => void }[] = [];

vi.mock("../../apis/timetables", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  updateTimeTableItemMemo: (_t: number, _i: number, memo: string | null) =>
    new Promise<void>((resolve, reject) => {
      calls.push({ memo, resolve, reject });
    }),
}));

const { timeTableItemMemoMutationOptions } = await import("../useTimeTables");

const DETAIL_KEY = ["timetables", "detail", 1, "member-1"];

const makeClient = () => {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const detail = {
    id: 1,
    timeTableName: "t",
    year: 2026,
    term: "FIRST",
    items: [{ id: 10, memo: "old" }],
  } as unknown as TimeTableDetail;
  client.setQueryData(DETAIL_KEY, detail);
  return client;
};

const memoInCache = (client: QueryClient) =>
  (client.getQueryData(DETAIL_KEY) as TimeTableDetail).items[0].memo;

const flush = () => new Promise((r) => setTimeout(r, 0));

describe("timeTableItemMemoMutationOptions", () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it("같은 요소의 저장은 앞 저장이 끝난 뒤에야 서버로 보낸다", async () => {
    const client = makeClient();
    const a = new MutationObserver(client, timeTableItemMemoMutationOptions(client, 10));
    const b = new MutationObserver(client, timeTableItemMemoMutationOptions(client, 10));

    const pa = a.mutate({ timeTableId: 1, timeTableItemId: 10, memo: "A" });
    const pb = b.mutate({ timeTableId: 1, timeTableItemId: 10, memo: "B" });
    await flush();
    expect(calls.map((c) => c.memo)).toEqual(["A"]);

    calls[0].resolve();
    await pa;
    await flush();
    expect(calls.map((c) => c.memo)).toEqual(["A", "B"]);
    // B가 대기 중이므로 A의 성공은 캐시를 건드리지 않는다(B의 낙관적 값 보존).
    expect(memoInCache(client)).toBe("old");

    calls[1].resolve();
    await pb;
    expect(memoInCache(client)).toBe("B");
  });

  it("다른 요소의 저장은 서로 기다리지 않는다", async () => {
    const client = makeClient();
    const a = new MutationObserver(client, timeTableItemMemoMutationOptions(client, 10));
    const b = new MutationObserver(client, timeTableItemMemoMutationOptions(client, 11));
    void a.mutate({ timeTableId: 1, timeTableItemId: 10, memo: "A" });
    void b.mutate({ timeTableId: 1, timeTableItemId: 11, memo: "B" });
    await flush();
    expect(calls.map((c) => c.memo)).toEqual(["A", "B"]);
  });

  it("실패한 저장은 캐시를 바꾸지 않는다", async () => {
    const client = makeClient();
    const a = new MutationObserver(client, timeTableItemMemoMutationOptions(client, 10));
    const pa = a.mutate({ timeTableId: 1, timeTableItemId: 10, memo: "A" });
    await flush();
    calls[0].reject(new Error("network"));
    await expect(pa).rejects.toThrow("network");
    expect(memoInCache(client)).toBe("old");
  });
});
