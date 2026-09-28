import { css } from "styled-components";

// Figma: INTIP / 시간표 마법사 (5834:17926) 말단 컴포넌트가 공유하는 값.
// 텍스트 스타일은 전역 디자인 시스템(@/styles/typography)을 쓴다.

/**
 * 시안의 interactive/primary(#0061ff).
 * 프로젝트의 --interactive-primary는 #3b82f6이라 값이 다르다. 같은 색인
 * --interactive-brand를 쓴다(--interactive-primary를 고치면 앱 전역 색이 바뀐다).
 */
export const WIZARD_PRIMARY = "var(--interactive-brand, #0061ff)";

/** 시안에 토큰 없이 hex로만 들어간 성공(조건 충족) 색 */
export const WIZARD_SUCCESS = {
  bg: "#ecf8f2",
  border: "#d1f3e2",
  text: "#219e73",
} as const;

/** 버튼 리셋. 각 컴포넌트가 배경·테두리를 다시 정한다 */
export const buttonReset = css`
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:disabled {
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid ${WIZARD_PRIMARY};
    outline-offset: 2px;
  }
`;
