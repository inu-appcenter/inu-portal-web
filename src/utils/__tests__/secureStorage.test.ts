import { describe, it, expect, beforeEach } from "vitest";
import { secureStorage } from "../secureStorage";

const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});
Object.defineProperty(globalThis, "window", {
  value: { localStorage: localStorageMock, crypto: globalThis.crypto },
  writable: true,
});

describe("secureStorage (AES-GCM 암호화 저장소)", () => {
  beforeEach(() => {
    storage.clear();
  });

  it("데이터를 암호화하여 저장하며, localStorage에는 enc:v1: 접두사의 난수 암호문으로 기록된다", async () => {
    const studentData = {
      studentId: "202001234",
      koreanName: "김인천",
      gradeAverage: "4.25",
    };

    await secureStorage.setItem("portal_student_info", studentData);

    const rawInStorage = storage.get("portal_student_info");
    expect(rawInStorage).toBeDefined();
    expect(rawInStorage?.startsWith("enc:v1:")).toBe(true);

    // 평문 학번이나 이름이 원본 그대로 스토리지 문자열에 노출되지 않는지 확인
    expect(rawInStorage?.includes("202001234")).toBe(false);
    expect(rawInStorage?.includes("김인천")).toBe(false);
  });

  it("암호화되어 저장된 데이터를 정상적으로 복호화하여 원본 객체로 반환한다", async () => {
    const complexData = {
      profile: { studentId: "202001234", roomNumber: "305" },
      rewardList: [{ score: 5, reason: "모범사생" }],
      hasData: true,
    };

    await secureStorage.setItem("portal_dormitory_student_info", complexData);
    const retrieved = await secureStorage.getItem("portal_dormitory_student_info");

    expect(retrieved).toEqual(complexData);
  });

  it("기존에 평문으로 저장되어 있던 레거시 데이터도 에러 없이 읽어오고 자동 마이그레이션한다", async () => {
    const legacyPlainJson = JSON.stringify({
      studentId: "201901111",
      koreanName: "이레거시",
    });

    storage.set("portal_student_info", legacyPlainJson);

    const retrieved = await secureStorage.getItem<{ studentId: string; koreanName: string }>("portal_student_info");
    expect(retrieved).toBeDefined();
    expect(retrieved?.studentId).toBe("201901111");
    expect(retrieved?.koreanName).toBe("이레거시");

    // 잠시 후 백그라운드 마이그레이션으로 암호화되어 다시 저장되었는지 확인
    await new Promise((r) => setTimeout(r, 50));
    const updatedInStorage = storage.get("portal_student_info");
    expect(updatedInStorage?.startsWith("enc:v1:")).toBe(true);
  });

  it("removeItem 호출 시 스토리지가 정상적으로 소거된다", async () => {
    await secureStorage.setItem("temp_key", { test: true });
    expect(storage.get("temp_key")).toBeDefined();

    secureStorage.removeItem("temp_key");
    expect(storage.get("temp_key")).toBeUndefined();
    expect(await secureStorage.getItem("temp_key")).toBeNull();
  });

  it("getItemSync는 메모리 캐시 또는 레거시 평문 데이터를 동기적으로 반환한다", async () => {
    // 1. setItem 후 메모리 캐시를 통한 즉시 동기 조회
    await secureStorage.setItem("sync_key", { syncValue: 123 });
    const cachedSync = secureStorage.getItemSync<{ syncValue: number }>("sync_key");
    expect(cachedSync?.syncValue).toBe(123);

    // 2. 레거시 평문 스토리지 데이터의 동기 파싱 조회
    storage.set("legacy_sync", JSON.stringify({ legacy: "yes" }));
    const legacySync = secureStorage.getItemSync<{ legacy: string }>("legacy_sync");
    expect(legacySync?.legacy).toBe("yes");
  });
});

