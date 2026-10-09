import { safeLocalStorage } from "./safeStorage";

const PREFIX = "enc:v1:";
const ALGORITHM = "AES-GCM";
const KEY_SEED = "intip_local_secure_vault_v1";

let cachedKeyPromise: Promise<CryptoKey> | null = null;

function getCryptoSubtle(): SubtleCrypto | null {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    return window.crypto.subtle;
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  return null;
}

function getRandomValues(array: Uint8Array): Uint8Array {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    return window.crypto.getRandomValues(array);
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
    return globalThis.crypto.getRandomValues(array);
  }
  // Fallback for unexpected environments
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
}

async function getEncryptionKey(): Promise<CryptoKey | null> {
  const subtle = getCryptoSubtle();
  if (!subtle) return null;

  if (cachedKeyPromise) return cachedKeyPromise;

  cachedKeyPromise = (async () => {
    const encoder = new TextEncoder();
    const keyData = await subtle.digest("SHA-256", encoder.encode(KEY_SEED));
    return subtle.importKey(
      "raw",
      keyData,
      { name: ALGORITHM },
      false,
      ["encrypt", "decrypt"]
    );
  })();

  return cachedKeyPromise;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

const memoryCache = new Map<string, any>();

/**
 * Web Crypto API (AES-GCM-256) 기반 클라이언트 암호화 저장소 래퍼.
 * 민감한 학적/생활원/성적 데이터를 localStorage에 저장할 때 평문이 아닌 난수 암호문으로 안전하게 보관합니다.
 * 기존 평문 데이터의 투명한 하위 호환 및 자동 마이그레이션을 지원합니다.
 */
export const secureStorage = {
  /**
   * 동기적 조회가 필요한 코드(브릿지 초기화, 렌더 직전 학번 확인 등)를 위한 메모리 캐시 기반 동기 조회
   */
  getItemSync<T = any>(key: string): T | null {
    if (memoryCache.has(key)) {
      return memoryCache.get(key) as T;
    }
    const stored = safeLocalStorage.getItem(key);
    if (!stored) return null;
    // 암호화되지 않은 레거시 데이터는 즉시 JSON 파싱 반환
    if (!stored.startsWith(PREFIX)) {
      try {
        const parsed = JSON.parse(stored) as T;
        memoryCache.set(key, parsed);
        return parsed;
      } catch {
        return stored as unknown as T;
      }
    }
    return null;
  },

  async setItem(key: string, value: any): Promise<void> {
    memoryCache.set(key, value);
    try {
      const subtle = getCryptoSubtle();
      const stringValue = typeof value === "string" ? value : JSON.stringify(value);

      if (!subtle) {
        safeLocalStorage.setItem(key, stringValue);
        return;
      }

      const keyObj = await getEncryptionKey();
      if (!keyObj) {
        safeLocalStorage.setItem(key, stringValue);
        return;
      }

      const iv = getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(stringValue);

      const cipherBuffer = await subtle.encrypt(
        { name: ALGORITHM, iv },
        keyObj,
        encoded
      );

      const encryptedPayload = `${PREFIX}${bufferToHex(iv.buffer)}:${bufferToHex(cipherBuffer)}`;
      safeLocalStorage.setItem(key, encryptedPayload);
    } catch (e) {
      console.warn(`[secureStorage] Failed to encrypt/set item "${key}":`, e);
      safeLocalStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    }
  },

  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const stored = safeLocalStorage.getItem(key);
      if (!stored) {
        memoryCache.delete(key);
        return null;
      }

      // 1. 레거시 평문 데이터인 경우 즉시 복원 및 백그라운드 암호화 자동 마이그레이션
      if (!stored.startsWith(PREFIX)) {
        try {
          const parsed = JSON.parse(stored) as T;
          memoryCache.set(key, parsed);
          // 비동기 마이그레이션
          void this.setItem(key, parsed);
          return parsed;
        } catch {
          return stored as unknown as T;
        }
      }

      const subtle = getCryptoSubtle();
      if (!subtle) {
        return null;
      }

      const parts = stored.slice(PREFIX.length).split(":");
      if (parts.length !== 2) return null;

      const [ivHex, cipherHex] = parts;
      const iv = hexToBuffer(ivHex);
      const cipherBytes = hexToBuffer(cipherHex);
      const keyObj = await getEncryptionKey();

      if (!keyObj) return null;

      const decryptedBuffer = await subtle.decrypt(
        { name: ALGORITHM, iv: iv as unknown as BufferSource },
        keyObj,
        cipherBytes as unknown as BufferSource
      );

      const decryptedText = new TextDecoder().decode(decryptedBuffer);
      try {
        const parsed = JSON.parse(decryptedText) as T;
        memoryCache.set(key, parsed);
        return parsed;
      } catch {
        const str = decryptedText as unknown as T;
        memoryCache.set(key, str);
        return str;
      }
    } catch (e) {
      console.warn(`[secureStorage] Failed to decrypt/get item "${key}":`, e);
      return null;
    }
  },

  removeItem(key: string): void {
    memoryCache.delete(key);
    safeLocalStorage.removeItem(key);
  },
};

