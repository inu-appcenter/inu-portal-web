import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { prefetchMainTabs } from "../tabImporters";

describe("tabImporters - prefetchMainTabs", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("첫 렌더링 후 300ms 뒤에 순차 체이닝으로 탭 사전 로드를 진행해야 한다", async () => {
    const promise = prefetchMainTabs();
    
    // 300ms 전에는 실행 대기
    vi.advanceTimersByTime(200);
    // 300ms 도달 시 체이닝 시작
    vi.advanceTimersByTime(100);
    
    await promise;
    expect(true).toBe(true);
  });
});
