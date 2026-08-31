import CallInuIcon from "./call-inu.svg?react";
import UnidormIcon from "./unidorm.svg?react";

/**
 * 홈 화면 상단 칩(Chip) 버튼의 단색 아이콘.
 * - CallInuIcon: 원래 #4071B9
 * (ExternalLinkIcon은 Fontello `link-external` 글리프와 모양이 같아 `Icon`으로
 * 옮기고 파일을 지웠다 — Chip.tsx / FillButton.tsx / AiBrandPage.tsx.)
 * - UnidormIcon: 원래 #0E4D9D
 * 모두 currentColor로 통합했고, 각 호출부에서 color CSS로 원래 색을 재현한다.
 */
export { CallInuIcon, UnidormIcon };
