/**
 * 이 문서(=이 웹뷰)가 로드된 이후 쌓인 SPA 히스토리 깊이 추적.
 *
 * 앱에서 뒤로가기를 누르면 "웹이 되돌릴 것을 갖고 있는가"를 웹이 판단해야 한다
 * (뒤로가기 정책은 `nativeBackRequest.ts` 참고). 그 판단에
 * `window.history.length` 를 쓰면 안 된다 — 서브페이지 웹뷰가 열릴 때의 초기
 * length 는 0 이 아니고(같은 WebView 프로세스의 이전 문서까지 포함), 앞으로
 * 이동한 뒤 되돌아온 경우에도 줄지 않는다.
 *
 * 그래서 직접 센다. 진입 시점을 0 으로 두고 `pushState` 마다 +1, 되돌아오면
 * 그만큼 되돌린다. 카운터만 두고 popstate 에서 -1 하는 방식 대신 **각 엔트리의
 * state 에 깊이를 새겨** 두고 popstate 에서 착지한 엔트리의 값을 읽는다. 그래야
 * `history.go(-2)`, 앞으로 가기, 합성 popstate(브릿지의 딥링크 처리) 처럼
 * -1 이 아닌 이동에서도 어긋나지 않는다.
 *
 * 카운트 대상은 이 문서 안의 히스토리 엔트리 전부다:
 *  - `pushState` 기반 오버레이/모달 (채팅 이미지 뷰어, 강의 필터, 검색바 …)
 *  - react-router 의 SPA 이동 중 실제 엔트리를 남기는 것(해시/쿼리 이동 등.
 *    메인 탭이 아닌 경로 이동은 `router.tsx` 가 네이티브 push 로 위임하므로
 *    애초에 엔트리를 남기지 않는다)
 * `replaceState` 는 엔트리를 늘리지 않으므로 깊이도 그대로 둔다.
 */

const DEPTH_KEY = "__intipSpaDepth";

let depth = 0;
let installed = false;

function readDepth(state: unknown): number {
  if (state && typeof state === "object" && DEPTH_KEY in state) {
    const value = (state as Record<string, unknown>)[DEPTH_KEY];
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      return value;
    }
  }
  // 문서 최초 엔트리(state 없음) = 깊이 0.
  return 0;
}

/**
 * 호출부의 state 를 보존한 채 깊이만 덧붙인다. state 가 객체가 아닌 경우
 * (원시값)에는 감싸면 호출부 의미가 바뀌므로 건드리지 않는다 — 이 앱에는
 * 그런 호출부가 없다.
 */
function withDepth(state: unknown, value: number): unknown {
  if (state !== null && state !== undefined && typeof state !== "object") {
    return state;
  }
  return { ...(state as object | null), [DEPTH_KEY]: value };
}

/**
 * `history.pushState` / `replaceState` 를 감싸고 popstate 를 구독한다.
 * 어떤 pushState 보다도 먼저 실행돼야 하므로 이 모듈 로드시 즉시 호출된다.
 */
function install(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const { history } = window;
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = function (state: unknown, unused: string, url?: string | URL | null) {
    depth += 1;
    originalPushState(withDepth(state, depth), unused, url);
  };

  history.replaceState = function (state: unknown, unused: string, url?: string | URL | null) {
    // 엔트리를 대체할 뿐이므로 깊이는 현재 값 그대로 다시 새긴다.
    originalReplaceState(withDepth(state, depth), unused, url);
  };

  // 착지한 엔트리에 새겨진 값이 곧 현재 깊이다(뒤/앞 어느 방향이든).
  window.addEventListener("popstate", () => {
    depth = readDepth(window.history.state);
  });

  // 문서 최초 엔트리에도 0 을 새겨 둬서, 그 엔트리로 되돌아왔을 때
  // 다른 코드가 남긴 state 를 깊이로 오독하지 않게 한다.
  originalReplaceState(withDepth(window.history.state, 0), "");
}

install();

/** 이 웹뷰 안에서 되돌릴 수 있는 SPA 히스토리 엔트리 수. */
export function getSpaBackDepth(): number {
  return depth;
}

/** 이 웹뷰 안에서 뒤로 갈 곳이 남아 있는가. */
export function canGoBackInSpa(): boolean {
  return depth > 0;
}
