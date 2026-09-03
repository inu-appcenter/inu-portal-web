// leaf 모듈 — bridgeChannel.ts 상단의 순환참조 경고 참고. store/api 등 무거운
// 모듈을 import 하지 않는다.
import { bridgeChannel } from "./bridgeChannel";
import { whenCapabilities, hasCapability } from "./bridgeCapabilities";
import type { ShareResultPayload } from "../../packages/intip-bridge/src/messages";

/**
 * `share` 요청 전용 타임아웃. OS 공유 시트는 사용자가 닫거나 완료할 때까지
 * 열려 있으므로 기본 request() 타임아웃(10s)으로는 어림도 없다.
 */
const SHARE_TIMEOUT_MS = 300_000;

/**
 * 네이티브 OS 공유 시트를 띄우고 결과를 기다린다. `bridgeChannel` 이 없는
 * 환경(브라우저/구앱)에서는 호출하지 않아야 한다 — 호출부에서 존재를 확인할 것.
 */
export async function nativeShare(data: ShareData): Promise<ShareResultPayload> {
  if (!bridgeChannel) {
    return { status: "unsupported" };
  }

  const { title, text, url, files } = data;
  const payload = {
    title,
    text,
    url,
    files: files?.length
      ? await Promise.all(
          files.map(async (file) => ({
            name: file.name,
            mimeType: file.type,
            src: await fileToDataUrl(file),
          })),
        )
      : undefined,
  };

  const reply = await bridgeChannel.requestWithOptions(
    "share",
    { timeoutMs: SHARE_TIMEOUT_MS },
    payload,
  );
  if (reply.event !== "shareResult") {
    return { status: "error", message: `unexpected reply event: ${reply.event}` };
  }
  return reply.value;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

let polyfillInstalled = false;

/**
 * `navigator.share`/`navigator.canShare` 가 없는 환경(안드로이드 WKWebView는
 * 이 API를 구현하지 않는다)에서, 신 Expo 셸의 네이티브 공유 시트로 위임하는
 * polyfill 을 설치한다.
 *
 * 설치 시점: capabilities 도착(또는 유예 시간 만료) 이후에만 비동기로
 * 설치한다. capabilities 메시지는 페이지 로드 직후 수 ms 안에 도착하는 반면
 * 공유 버튼은 그보다 훨씬 뒤에 눌리므로, 이 사이의 경쟁(race)은 실질적으로
 * 문제가 되지 않는다. capabilities 확인 전에 낙관적으로 설치하지 않는
 * 이유는, 구버전 네이티브 셸에서 설치해버리면 기존 클립보드 폴백이
 * 깨지기 때문이다(그 셸은 `share` 요청에 응답하지 않는다).
 *
 * `navigator.share` 존재 여부는 여기서 미리 걸러내지 않고 capabilities
 * resolve 이후에만 확인한다 — bridgeChannel.ts는 `bridgeReady`를 보내기
 * 전에 이 함수를 호출해 `bridgeCapabilities` 리스너를 등록해 둬야 하는데
 * (그렇지 않으면 네이티브의 즉답을 놓친다), iOS처럼 `navigator.share`가
 * 이미 있는 플랫폼에서 여기서 조기 return 해버리면 그 리스너 등록 자체가
 * 스킵되어 버린다.
 */
export function installNavigatorSharePolyfill(): void {
  if (polyfillInstalled) return;
  if (!bridgeChannel) return;
  polyfillInstalled = true;

  void whenCapabilities().then(() => {
    if (!hasCapability("share")) return;
    // iOS/모바일 브라우저의 진짜 구현을 절대 덮어쓰지 않는다.
    // (lib.dom.d.ts는 Navigator.share를 필수 멤버로 선언하므로 `if (navigator.share)`
    // 로 쓰면 tsc가 "항상 true" 로 보고 TS2774 로 거부한다 — typeof 로 런타임에
    // 실제 존재 여부를 확인한다.)
    if (typeof navigator.share === "function") return;

    navigator.share = async (data: ShareData = {}): Promise<void> => {
      const result = await nativeShare(data);
      if (result.status === "shared") return;
      if (result.status === "dismissed") {
        throw new DOMException("Share canceled", "AbortError");
      }
      // "unsupported" | "error" — 호출부가 클립보드 등으로 폴백할 수 있게 일반 Error로 reject.
      throw new Error(result.message ?? `native share failed: ${result.status}`);
    };

    if (typeof navigator.canShare !== "function") {
      navigator.canShare = (data?: ShareData): boolean => {
        // v1 네이티브는 파일 공유 미지원(`unsupported` 회신) — 미리 false.
        if (data?.files?.length) return false;
        return true;
      };
    }
  });
}
