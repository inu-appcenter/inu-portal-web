// leaf 모듈 — bridgeChannel.ts 상단의 순환참조 경고 참고. 이 파일은 store/api 등
// 무거운 모듈을 import 하지 않는다(bridgeChannel 만 참조). 새로운 순환을 만들지 말 것.
//
// 주의: bridgeChannel.ts가 (installNavigatorSharePolyfill을 통해 간접적으로,
// 또는 직접) 이 모듈을 import 하므로 "bridgeChannel.ts -> nativeShare.ts ->
// bridgeCapabilities.ts -> bridgeChannel.ts" 순환이 생긴다. 이 자체는 문제가
// 아니다 — 문제는 순환의 어느 모듈이든 "모듈 최상위 평가 시점"에 동기적으로
// `bridgeChannel` 값을 읽는 경우다(그 시점엔 bridgeChannel.ts의
// `export const bridgeChannel = ...` 대입이 아직 실행되지 않았을 수 있어 TDZ
// 크래시가 난다). 그래서 아래에서는 `bridgeChannel` 값을 함수 "호출 시점"까지
// 지연해서만 읽는다(ensureListening 은 whenCapabilities() 최초 호출 시에만
// 실행된다) — import 선언 자체는 값을 읽지 않으므로 안전하다.
import { bridgeChannel } from "./bridgeChannel";

/**
 * 네이티브가 `bridgeReady` 응답으로 보내는 `bridgeCapabilities` 를 기다렸다가
 * 캐싱하는 모듈.
 *
 * 기능 가용 여부는 request() 타임아웃으로 판단할 수 없다 — 예컨대 OS 공유
 * 시트는 사용자가 닫을 때까지 몇 분이고 열려 있을 수 있어(`share` 참고),
 * "응답이 늦다 = 미지원" 이라는 추론이 성립하지 않는다. 그래서 네이티브가
 * `bridgeReady` 직후 먼저 광고하는 별도 메시지로 지원 기능을 판단한다.
 *
 * 구버전 네이티브 셸(이 메시지를 모름)이나 브라우저에서는 아무것도 오지 않으므로,
 * 짧은 유예 시간(GRACE_MS) 후 빈 Set 으로 resolve 한다 — 절대 reject 하거나
 * 무한정 기다리지 않는다.
 */

const GRACE_MS = 2000;

let capabilities: ReadonlySet<string> = new Set();
let resolved = false;
let resolveFn: ((features: ReadonlySet<string>) => void) | undefined;
let promise: Promise<ReadonlySet<string>> | undefined;

function finish(features: ReadonlySet<string>): void {
  if (resolved) return;
  resolved = true;
  capabilities = features;
  resolveFn?.(capabilities);
}

/** 최초 호출 시에만 리스너/타이머를 건다(위 순환참조 주석 참고). */
function ensureListening(): Promise<ReadonlySet<string>> {
  if (promise) return promise;
  promise = new Promise((resolve) => {
    resolveFn = resolve;
    if (!bridgeChannel) {
      finish(new Set());
      return;
    }
    bridgeChannel.on("bridgeCapabilities", ({ features }) => finish(new Set(features)));
    // 메시지는 보통 bridgeReady 응답으로 수 ms 안에 도착하지만, 구버전 셸은
    // 아예 보내지 않는다 — 그런 경우를 위한 안전한 상한선.
    window.setTimeout(() => finish(new Set()), GRACE_MS);
  });
  return promise;
}

/** capabilities 메시지 도착(또는 유예 시간 만료)을 기다린다. 절대 reject 하지 않는다. */
export function whenCapabilities(): Promise<ReadonlySet<string>> {
  return ensureListening();
}

/** 이미 resolve 된 뒤 동기적으로 확인할 때 사용한다(resolve 전에는 항상 false). */
export function hasCapability(name: string): boolean {
  return capabilities.has(name);
}
