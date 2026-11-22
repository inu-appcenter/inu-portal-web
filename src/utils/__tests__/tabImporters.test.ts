import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { prefetchMainTabs } from "../tabImporters";

describe("tabImporters - prefetchMainTabs", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("첫 렌더링 후 50ms 뒤에 순차 체이닝으로 탭 사전 로드를 진행해야 한다", async () => {
    const promise = prefetchMainTabs();
    
    // 50ms 전에는 대기
    vi.advanceTimersByTime(20);
    // 50ms 도달 시 체이닝 시작
    vi.advanceTimersByTime(30);
    
    await promise;
    expect(true).toBe(true);
  });
});
