import { css } from "styled-components";

// Figma 텍스트 스타일(INTIP 디자인 시스템)을 styled-components에서 쓰는 css 조각.
//
// 값은 tokens/(Figma Tokens Studio export) → `npm run build:tokens` → variables.css의 CSS 변수
// (--title-2-font-size 등)에서 온다. 여기서 숫자를 다시 적지 않는다 - 스타일을 바꾸려면
// Tokens Studio에서 다시 export해 tokens/를 교체하고 build:tokens를 돌린다.
// 폰트 패밀리는 전역(CommonStyles)이 Pretendard 대체 글꼴 스택까지 지정하므로 다루지 않는다.
//
//   const Title = styled.h2`
//     ${typography.title2}
//     color: var(--text-primary);
//   `;

const textStyle = (name: string) => css`
  font-size: var(--${name}-font-size);
  font-weight: var(--${name}-font-weight);
  line-height: var(--${name}-line-height);
  letter-spacing: var(--${name}-letter-spacing);
`;

export const typography = {
  /** display/1 — Bold 32/40 */
  display1: textStyle("display"),
  /** title/1 — Bold 24/32, -0.2 */
  title1: textStyle("title-1"),
  /** title/2 — Bold 20/28, -0.2 */
  title2: textStyle("title-2"),
  /** title/3 — Bold 16/24, -0.2 */
  title3: textStyle("title-3"),
  /** title/4 — Bold 14/24, -0.2 */
  title4: textStyle("title-4"),
  /** heading/1 — SemiBold 20/32 */
  heading1: textStyle("heading-1"),
  /** heading/2 — SemiBold 16/24 */
  heading2: textStyle("heading-2"),
  /**
   * heading/3 — SemiBold 14/1.4.
   * Tokens Studio export에 없는 스타일이라 값을 직접 둔다. export에 추가되면 textStyle("heading-3")로 교체.
   */
  heading3: css`
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: 0;
  `,
  /** body/1 — Regular 16/1.6 */
  body1: textStyle("body-1"),
  /** body/2 — Regular 14/1.6 */
  body2: textStyle("body-2"),
  /** label/1 — Medium 16/24 */
  label1: textStyle("label-1"),
  /** label/2 — Medium 14/20 */
  label2: textStyle("label-2"),
  /** label/3 — Medium 12/16 */
  label3: textStyle("label-3"),
  /** caption/1 — Regular 12/16 */
  caption1: textStyle("caption-1"),
} as const;

export type TypographyName = keyof typeof typography;
