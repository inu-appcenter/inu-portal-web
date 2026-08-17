import { backHandler } from "./backHandler";
import { canGoBackInSpa } from "./spaBackDepth";

/**
 * 뒤로가기 요청의 단일 처리 지점.
 *
 * 앱의 뒤로가기(안드로이드 시스템 백 → 네이티브가 보내는 `checkBack`, 그리고 웹
 * 헤더의 백버튼)는 모두 여기로 모인다. 네이티브는 자기 판단으로 웹뷰를 닫지
 * 않는다 — 자기 안에 열린 모달이 있는지 아는 쪽은 웹뿐이기 때문이다. 이걸
 * 건너뛰던 게 intip-mobile-app#15: 서브페이지에서 이미지 뷰어나 필터 오버레이를
 * 열어둔 채 뒤로가기를 하면 모달이 아니라 화면 자체가 닫혔다.
 *
 * 우선순위:
 *   1. 등록된 오버레이/이탈방지 핸들러 (`backHandler`) — 바텀시트, 미저장 경고 등
 *   2. 이 웹뷰 안에 쌓인 SPA 히스토리 (`pushState` 기반 모달 포함) → `history.back()`
 *   3. 둘 다 없으면 처리하지 않음 → 네이티브가 이 웹뷰를 pop
 */
export function handleBackRequest(): boolean {
  // 1. 오버레이 핸들러가 소비하면 히스토리는 건드리지 않는다. 엔트리를 쌓아 둔
  //    핸들러(useSheetBackHandler)는 닫히면서 자기 엔트리를 스스로 정리한다.
  if (backHandler.handleBack()) return true;

  // 2. 되돌릴 SPA 엔트리가 있으면 한 칸 되돌린다. pushState 로 모달을 연 화면은
  //    여기서 popstate 를 받아 모달만 닫는다.
  if (canGoBackInSpa()) {
    window.history.back();
    return true;
  }

  // 3. 이 웹뷰에서 되돌릴 것이 없다.
  return false;
}
