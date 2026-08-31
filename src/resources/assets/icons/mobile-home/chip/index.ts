import CallInuIcon from "./call-inu.svg?react";
import ExternalLinkIcon from "./external-link.svg?react";
import UnidormIcon from "./unidorm.svg?react";

/**
 * 홈 화면 상단 칩(Chip) 버튼의 단색 아이콘.
 * - CallInuIcon: 원래 #4071B9
 * - ExternalLinkIcon: 원래 #969696. currentColor로 바꾸고 나니 흰색 변형
 *   (ExternalLink-white.svg, 원래 #F4F4F4)과 path가 완전히 동일해져(sha1 중복,
 *   감사 보고서 [4]) 한 파일로 합쳤다. 흰 배경용 색은 컴포넌트가 아니라
 *   호출부 CSS(color)로만 재현한다(FillButton.tsx).
 * - UnidormIcon: 원래 #0E4D9D
 * 모두 currentColor로 통합했고, 각 호출부에서 color CSS로 원래 색을 재현한다.
 */
export { CallInuIcon, ExternalLinkIcon, UnidormIcon };
