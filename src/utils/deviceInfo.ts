import type {
  SuggestionDeviceInfo,
  SuggestionOsType,
} from "@/types/suggestions";

/**
 * User-Agent에서 건의사항에 첨부할 기기 정보를 뽑는다.
 * - 앱 버전: 네이티브 셸이 UA에 붙이는 `INTIPApp/<version>`
 * - 기기 모델: 안드로이드 UA에서 알 수 있을 때만(축약 UA의 "K" 등은 제외). 나머지는 생략한다.
 */
export function parseDeviceInfo(userAgent: string): SuggestionDeviceInfo {
  const info: SuggestionDeviceInfo = {};

  const app = userAgent.match(/INTIPApp\/([\w.+-]+)/);
  if (app) info.appVersion = app[1];

  let osType: SuggestionOsType = "WEB";
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    osType = "IOS";
    const v = userAgent.match(/OS (\d+(?:_\d+)*) like Mac OS X/);
    if (v) info.osVersion = v[1].replace(/_/g, ".");
  } else if (/Android/i.test(userAgent)) {
    osType = "ANDROID";
    const v = userAgent.match(/Android (\d+(?:\.\d+)*)/);
    if (v) info.osVersion = v[1];
    const m = userAgent.match(
      /Android [\d.]+;\s*([^;)]+?)(?:\s+Build\/[^;)]*)?[;)]/,
    );
    const model = m?.[1].trim();
    if (model && model.length > 1 && !/^(wv|mobile)$/i.test(model)) {
      info.deviceModel = model;
    }
  }
  info.osType = osType;
  return info;
}

export const getDeviceInfo = (): SuggestionDeviceInfo =>
  parseDeviceInfo(typeof navigator === "undefined" ? "" : navigator.userAgent);
