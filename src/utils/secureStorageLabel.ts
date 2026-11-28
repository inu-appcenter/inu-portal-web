import { getMobilePlatform } from "./getMobilePlatform";

/**
 * 앱이 학교 계정을 실제로 보관하는 OS 보안 저장소 이름.
 * (intip-mobile-app `src/agent/secureStore.ts`: iOS Keychain "이 기기에만" 속성,
 *  Android는 Android Keystore 키로 암호화)
 */
export function secureStorageLabel(): string {
  const platform = getMobilePlatform();
  if (platform.startsWith("ios")) return "iPhone 키체인(이 기기에만 저장)";
  if (platform.startsWith("android")) return "Android Keystore 암호화 저장소";
  return "기기 보안 저장소";
}
