import { create } from "zustand";
import { safeLocalStorage } from "@/utils/safeStorage";

/**
 * 포털 정보 불러오기(휴대폰이 학교 포털·이러닝·도서관에 대신 접속하는 기능) 동의.
 *
 * - [필수] 포털 정보 불러오기: 없으면 앱 브릿지의 스크래핑 요청을 보내지 않는다.
 * - [선택] AI 채팅 학적 활용: 없으면 AI 채팅 요청에 학적·이러닝 정보를 싣지 않는다.
 *
 * 서버에 동의 이력을 저장하는 API가 아직 없어 이용약관 동의(TermsAgreement)처럼
 * 기기 단위로 보관한다. 기기를 바꾸거나 앱을 재설치하면 다시 동의를 받는다.
 */

/** 동의 문구(상세 약관)를 바꾸면 올린다. 버전이 다르면 다시 동의를 받는다. */
export const PORTAL_SYNC_CONSENT_VERSION = "2026-10-15";

export const PORTAL_SYNC_CONSENT_STORAGE_KEY = "portalSyncConsent";

export interface PortalSyncConsent {
  version: string;
  /** [필수] 포털 정보 불러오기에 동의한 시각 */
  agreedAt: string;
  /** [선택] AI 채팅 학적 활용에 동의한 시각. 동의하지 않았거나 철회했으면 null */
  aiAgreedAt: string | null;
}

function readConsent(): PortalSyncConsent | null {
  const stored = safeLocalStorage.getItem(PORTAL_SYNC_CONSENT_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<PortalSyncConsent>;
    if (parsed.version !== PORTAL_SYNC_CONSENT_VERSION || !parsed.agreedAt) {
      return null;
    }
    return {
      version: parsed.version,
      agreedAt: parsed.agreedAt,
      aiAgreedAt: parsed.aiAgreedAt ?? null,
    };
  } catch {
    return null;
  }
}

function writeConsent(consent: PortalSyncConsent | null): void {
  if (consent) {
    safeLocalStorage.setItem(
      PORTAL_SYNC_CONSENT_STORAGE_KEY,
      JSON.stringify(consent),
    );
  } else {
    safeLocalStorage.removeItem(PORTAL_SYNC_CONSENT_STORAGE_KEY);
  }
  usePortalSyncConsentStore.setState({ consent });
}

interface PortalSyncConsentState {
  consent: PortalSyncConsent | null;
  /** 동의 시트를 띄워 달라는 요청이 진행 중인지 */
  requestOpen: boolean;
  /** 동의 시트를 그릴 호스트가 마운트돼 있는지 */
  hostMounted: boolean;
}

export const usePortalSyncConsentStore = create<PortalSyncConsentState>(() => ({
  consent: readConsent(),
  requestOpen: false,
  hostMounted: false,
}));

export function hasPortalSyncConsent(): boolean {
  return readConsent() !== null;
}

export function hasAiAcademicConsent(): boolean {
  return Boolean(readConsent()?.aiAgreedAt);
}

export function recordPortalSyncConsent({ ai }: { ai: boolean }): void {
  const now = new Date().toISOString();
  writeConsent({
    version: PORTAL_SYNC_CONSENT_VERSION,
    agreedAt: now,
    aiAgreedAt: ai ? now : null,
  });
}

/** [선택] AI 채팅 학적 활용만 켜거나 끈다. 필수 동의가 없으면 아무것도 하지 않는다. */
export function setAiAcademicConsent(agreed: boolean): void {
  const current = readConsent();
  if (!current) return;
  writeConsent({
    ...current,
    aiAgreedAt: agreed ? new Date().toISOString() : null,
  });
}

/**
 * 동의 이력을 지운다. 포털 연결 해제·회원 탈퇴 시 호출해,
 * 다시 연결할 때 동의를 새로 받는다.
 */
export function clearPortalSyncConsent(): void {
  writeConsent(null);
}

let pendingRequest: Promise<boolean> | null = null;
let resolvePending: ((agreed: boolean) => void) | null = null;

/**
 * 필수 동의가 있으면 바로 true. 없으면 동의 시트를 띄우고 사용자의 선택을 기다린다.
 * 동시에 여러 번 불려도 시트는 하나만 뜬다. 시트를 그릴 호스트가 없으면 false.
 */
export function requestPortalSyncConsent(): Promise<boolean> {
  if (hasPortalSyncConsent()) return Promise.resolve(true);
  if (pendingRequest) return pendingRequest;
  if (!usePortalSyncConsentStore.getState().hostMounted) {
    return Promise.resolve(false);
  }

  pendingRequest = new Promise<boolean>((resolve) => {
    resolvePending = resolve;
  });
  usePortalSyncConsentStore.setState({ requestOpen: true });
  return pendingRequest;
}

/** 동의 시트가 닫힐 때 호스트가 호출한다. */
export function settlePortalSyncConsentRequest(
  result: { agreed: true; ai: boolean } | { agreed: false },
): void {
  if (result.agreed) {
    recordPortalSyncConsent({ ai: result.ai });
  }
  usePortalSyncConsentStore.setState({ requestOpen: false });
  resolvePending?.(result.agreed);
  resolvePending = null;
  pendingRequest = null;
}

export function setPortalSyncConsentHostMounted(mounted: boolean): void {
  usePortalSyncConsentStore.setState({ hostMounted: mounted });
  if (!mounted && pendingRequest) {
    settlePortalSyncConsentRequest({ agreed: false });
  }
}
