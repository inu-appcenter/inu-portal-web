import { css } from "styled-components";

// Figma: INTIP / 시간표 마법사 (5834:17926) 말단 컴포넌트가 공유하는 값.
//
// variables.css의 타이포 토큰은 style-dictionary 빌드가 깨져 "[object Object]"로
// 나오고 있어서 쓸 수 없다. 그래서 시안의 텍스트 스타일을 css 조각으로 옮겨 둔다.
// 폰트 패밀리는 전역(CommonStyles)이 Pretendard라 따로 지정하지 않는다.

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

export const typo = {
  /** title/2 — Bold 20/28, -0.2 */
  title2: css`
    font-size: 20px;
    font-weight: 700;
    line-height: 28px;
    letter-spacing: -0.2px;
  `,
  /** title/3 — Bold 16/24, -0.2 */
  title3: css`
    font-size: 16px;
    font-weight: 700;
    line-height: 24px;
    letter-spacing: -0.2px;
  `,
  /** heading/1 — SemiBold 20/1.4 */
  heading1: css`
    font-size: 20px;
    font-weight: 600;
    line-height: 1.4;
  `,
  /** heading/2 — SemiBold 16/1.4 */
  heading2: css`
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
  `,
  /** heading/3 — SemiBold 14/1.4 */
  heading3: css`
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
  `,
  /** label/1 — Medium 16/1.4 */
  label1: css`
    font-size: 16px;
    font-weight: 500;
    line-height: 1.4;
  `,
  /** label/2 — Medium 14/1.4 */
  label2: css`
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
  `,
  /** label/3 — Medium 12/1.4 */
  label3: css`
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
  `,
  /** body/2 — Regular 14/1.6 */
  body2: css`
    font-size: 14px;
    font-weight: 400;
    line-height: 1.6;
  `,
  /** caption/1 — Regular 12/16 */
  caption1: css`
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
  `,
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
