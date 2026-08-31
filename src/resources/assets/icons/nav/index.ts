import CircleIcon from "./circle.svg?react";
import LightCircleIcon from "./light-circle.svg?react";
import VVectorIcon from "./v-vector.svg?react";

/**
 * 데스크톱 상단 내비게이션(NavMenu)의 단색 UI 아이콘.
 * 모두 currentColor 벡터이며 원본은 흰색 위 흰색 반투명 조합으로 쓰였다
 * (호출부에서 color: white로 재현).
 *
 * CircleIcon은 현재 어디서도 참조되지 않는다(이관 전 원본도 미참조 — 감사 보고서 [3a]).
 * 별도 판단 없이 삭제하지 않고 세트의 일부로 이관만 한다.
 */
export { CircleIcon, LightCircleIcon, VVectorIcon };
