import { describe, it, expect, beforeEach } from "vitest";

const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, String(value)),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});
// safeLocalStorage는 window.localStorage가 있는지 먼저 본다.
Object.defineProperty(globalThis, "window", {
  value: globalThis,
  writable: true,
});

const {
  PORTAL_SYNC_CONSENT_STORAGE_KEY,
  clearPortalSyncConsent,
  hasAiAcademicConsent,
  hasPortalSyncConsent,
  recordPortalSyncConsent,
  requestPortalSyncConsent,
  setAiAcademicConsent,
  setPortalSyncConsentHostMounted,
  settlePortalSyncConsentRequest,
  usePortalSyncConsentStore,
} = await import("../portalSyncConsent");

describe("portalSyncConsent", () => {
  beforeEach(() => {
    localStorage.clear();
    usePortalSyncConsentStore.setState({
      consent: null,
      requestOpen: false,
      hostMounted: false,
    });
  });

  it("동의 전에는 필수·선택 모두 없다", () => {
    expect(hasPortalSyncConsent()).toBe(false);
    expect(hasAiAcademicConsent()).toBe(false);
  });

  it("필수만 동의하면 AI 활용은 꺼진 채로 남는다", () => {
    recordPortalSyncConsent({ ai: false });
    expect(hasPortalSyncConsent()).toBe(true);
    expect(hasAiAcademicConsent()).toBe(false);
  });

  it("AI 활용은 필수 동의가 있을 때만 켜고 끌 수 있다", () => {
    setAiAcademicConsent(true);
    expect(hasAiAcademicConsent()).toBe(false);

    recordPortalSyncConsent({ ai: false });
    setAiAcademicConsent(true);
    expect(hasAiAcademicConsent()).toBe(true);
    setAiAcademicConsent(false);
    expect(hasAiAcademicConsent()).toBe(false);
    expect(hasPortalSyncConsent()).toBe(true);
  });

  it("버전이 다른 동의는 없는 것으로 본다", () => {
    localStorage.setItem(
      PORTAL_SYNC_CONSENT_STORAGE_KEY,
      JSON.stringify({ version: "old", agreedAt: "2026-01-01T00:00:00.000Z", aiAgreedAt: null }),
    );
    expect(hasPortalSyncConsent()).toBe(false);
  });

  it("철회하면 필수·선택 모두 지워진다", () => {
    recordPortalSyncConsent({ ai: true });
    clearPortalSyncConsent();
    expect(hasPortalSyncConsent()).toBe(false);
    expect(hasAiAcademicConsent()).toBe(false);
    expect(usePortalSyncConsentStore.getState().consent).toBeNull();
  });

  it("이미 동의했으면 시트를 띄우지 않고 바로 통과한다", async () => {
    recordPortalSyncConsent({ ai: false });
    await expect(requestPortalSyncConsent()).resolves.toBe(true);
    expect(usePortalSyncConsentStore.getState().requestOpen).toBe(false);
  });

  it("시트를 그릴 곳이 없으면 기다리지 않고 거절한다", async () => {
    await expect(requestPortalSyncConsent()).resolves.toBe(false);
  });

  it("동시에 여러 번 요청해도 시트는 하나만 뜨고 같은 결과를 받는다", async () => {
    setPortalSyncConsentHostMounted(true);
    const first = requestPortalSyncConsent();
    const second = requestPortalSyncConsent();
    expect(usePortalSyncConsentStore.getState().requestOpen).toBe(true);

    settlePortalSyncConsentRequest({ agreed: true, ai: true });
    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
    expect(hasAiAcademicConsent()).toBe(true);
    expect(usePortalSyncConsentStore.getState().requestOpen).toBe(false);
  });

  it("시트를 닫으면 거절로 끝나고 동의는 남지 않는다", async () => {
    setPortalSyncConsentHostMounted(true);
    const request = requestPortalSyncConsent();
    settlePortalSyncConsentRequest({ agreed: false });
    await expect(request).resolves.toBe(false);
    expect(hasPortalSyncConsent()).toBe(false);
  });
});
