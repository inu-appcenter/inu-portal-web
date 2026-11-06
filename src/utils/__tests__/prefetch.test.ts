import { describe, it, expect, vi, beforeEach } from "vitest";
import { prefetchNow, idlePrefetch } from "../prefetch";

describe("prefetch utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("window", {
      requestIdleCallback: (cb: () => void) => {
        cb();
      },
    });
  });

  it("prefetchNow는 factory 함수를 호출해야 한다", () => {
    const factory = vi.fn().mockResolvedValue({ default: () => null });
    prefetchNow(factory);
    expect(factory).toHaveBeenCalledTimes(1);

    // 중복 호출 방지 검증
    prefetchNow(factory);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("idlePrefetch는 requestIdleCallback을 통해 실행되어야 한다", () => {
    const factory = vi.fn().mockResolvedValue({ default: () => null });

    idlePrefetch(factory);
    expect(factory).toHaveBeenCalledTimes(1);
  });
});
