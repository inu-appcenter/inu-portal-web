import { css } from "styled-components";

// Figma 효과 스타일(그림자·배경 흐림)을 styled-components에서 쓰는 css 조각.
//
// 값은 tokens/(Figma Tokens Studio export) → `npm run build:tokens` → variables.css의 CSS 변수
// (--bottom-sheet-shadow 등)에서 온다. 숫자를 여기 다시 적지 않는다.
// 단, export에 없는 스타일(Floating_Button·Dim·Bubble)은 값을 직접 두었다. export에 추가되면 변수로 교체.
//
//   const Sheet = styled.div`
//     ${effects.bottomSheet}
//   `;

export const effects = {
  /** elevation/1 — 0 4 12 rgba(0,0,0,.08). 카드·하단 버튼 */
  elevation1: css`
    box-shadow: var(--elevation-1-shadow);
  `,
  /** Bottom_Sheet — 0 4 24 rgba(0,0,0,.25) */
  bottomSheet: css`
    box-shadow: var(--bottom-sheet-shadow);
  `,
  /** Floating_Button — 0 4 12 rgba(0,0,0,.08) + 배경 흐림 */
  floatingButton: css`
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  `,
  /** Dim — 배경 흐림만. 딤 배경색은 --bg-dim과 함께 쓴다 */
  dim: css`
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  `,
  /** Bubble — 0 1 2 rgba(0,0,0,.08). 말풍선 */
  bubble: css`
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.08);
  `,
} as const;
