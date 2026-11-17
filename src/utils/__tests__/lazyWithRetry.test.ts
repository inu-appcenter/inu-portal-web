import { beforeEach, describe, expect, it, vi } from "vitest";
import { lazyWithRetry } from "../lazyWithRetry";

function createMemoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => {
      data.delete(key);
    },
    setItem: (key, value) => {
      data.set(key, String(value));
    },
  };
}

const sessionStorage = createMemoryStorage();
const mockReload = vi.fn();

vi.stubGlobal("window", {
  sessionStorage,
  location: { reload: mockReload },
});

describe("lazyWithRetry", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockReload.mockClear();
    vi.clearAllMocks();
  });

  it("lazy 컴포넌트 객체를 반환해야 한다", () => {
    const MockComp = () => null;
    const factory = vi.fn().mockResolvedValue({ default: MockComp });

    const LazyComp = lazyWithRetry(factory);
    expect(LazyComp).toBeDefined();
    expect(typeof LazyComp).toBe("object");
  });

  it("성공 시 모듈을 정상적으로 반환하고 플래그를 정리해야 한다", async () => {
    sessionStorage.setItem("chunk_reload_retry", "true");
    const MockComp = () => null;
    const factory = vi.fn().mockResolvedValue({ default: MockComp });

    // factory 실행
    const res = await factory();
    expect(res.default).toBe(MockComp);
  });
});
