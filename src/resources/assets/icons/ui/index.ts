import CafeteriaArrowIcon from "./cafeteria-arrow.svg?react";
import MenuButtonIcon from "./menu-button.svg?react";

/**
 * 대응하는 Fontello 글리프가 없어 SVG로 남은 단색 UI 아이콘.
 *
 * 원래 이 세트에는 back/close/dropdown/bus-info/council-secret/login-user/
 * login-password도 있었으나, Fontello 글리프(chevron-left, close-md,
 * chevron-down, info, lock, user-02, lock)와 모양이 사실상 같아 `Icon`으로
 * 옮기고 파일을 지웠다. 아래 둘은 글리프 세트에 대응이 없어 남긴다.
 *
 * - CafeteriaArrowIcon: 원래 #444444 (mobile-cafeteria/Vector.svg).
 *   chevron-down/caret-down이 후보였으나 원본은 훨씬 굵은 채움형 V라 다르다.
 * - MenuButtonIcon: 원래 #444444 (mobile-common/menu-button.svg).
 *   길이가 줄어드는 3단 우측 정렬 막대라 hamburger-md(균등 3줄)와 다르다.
 *
 * 둘 다 currentColor로 통합했고, 각 호출부에서 color CSS로 원래 색을 재현한다.
 */
export { CafeteriaArrowIcon, MenuButtonIcon };
