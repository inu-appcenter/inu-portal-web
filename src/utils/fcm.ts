const FCM_TOKEN_STORAGE_KEY = "fcmToken";
const FCM_SYNC_STATE_STORAGE_KEY = "fcmSyncState";

export const FCM_TOKEN_EVENT_NAME = "intip:fcm-token";
export const FCM_SYNC_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface FcmTokenEventDetail {
  token: string;
  receivedAt: number;
}

export interface FcmSyncState {
  token: string;
  isAuthenticated: boolean;
  syncedAt: number;
}

const normalizeFcmToken = (token: unknown): string | null => {
  if (typeof token !== "string") {
    return null;
  }

  const normalized = token.trim();
  return normalized ? normalized : null;
};

export const getStoredFcmToken = (): string | null => {
  const token = normalizeFcmToken(localStorage.getItem(FCM_TOKEN_STORAGE_KEY));
  return token;
};

export const getBootstrappedFcmToken = (): string | null => {
  const token = normalizeFcmToken(window.__INTIP_FCM_BOOTSTRAP__?.token);
  return token ?? getStoredFcmToken();
};

export const subscribeToFcmToken = (
  callback: (token: string) => void,
): (() => void) => {
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<FcmTokenEventDetail>).detail;
    const token = normalizeFcmToken(detail?.token);

    if (!token) {
      return;
    }

    callback(token);
  };

  window.addEventListener(FCM_TOKEN_EVENT_NAME, handler as EventListener);

  return () => {
    window.removeEventListener(FCM_TOKEN_EVENT_NAME, handler as EventListener);
  };
};

export const getFcmDeviceType = (): string => {
  if (window.AndroidBridge) {
    return "ANDROID";
  }

  if (
    window.webkit?.messageHandlers?.routeChange ||
    window.webkit?.messageHandlers?.loginSuccess
  ) {
    return "IOS";
  }

  return "WEB";
};

export const getLastFcmSyncState = (): FcmSyncState | null => {
  const raw = localStorage.getItem(FCM_SYNC_STATE_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FcmSyncState>;

    if (
      typeof parsed?.token !== "string" ||
      typeof parsed?.isAuthenticated !== "boolean" ||
      typeof parsed?.syncedAt !== "number"
    ) {
      return null;
    }

    return {
      token: parsed.token,
      isAuthenticated: parsed.isAuthenticated,
      syncedAt: parsed.syncedAt,
    };
  } catch (error) {
    console.error("FCM 동기화 상태 파싱 실패", error);
    return null;
  }
};

export const shouldSyncFcmToken = (
  token: string,
  isAuthenticated: boolean,
): boolean => {
  const lastState = getLastFcmSyncState();

  if (!lastState) {
    return true;
  }

  if (lastState.token !== token) {
    return true;
  }

  if (isAuthenticated && !lastState.isAuthenticated) {
    return true;
  }

  if (!isAuthenticated && lastState.isAuthenticated) {
    return true;
  }

  return Date.now() - lastState.syncedAt >= FCM_SYNC_MAX_AGE_MS;
};

export const saveLastFcmSyncState = (state: FcmSyncState): void => {
  localStorage.setItem(FCM_SYNC_STATE_STORAGE_KEY, JSON.stringify(state));
};
