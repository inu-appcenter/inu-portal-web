import { POLL_BLOCK_OPACITY, POLL_ROW_HEIGHT } from "./PollGrid";

/** k명이 겹쳤을 때 보이는 농도. 범례 색을 블록 겹침과 맞추는 데 쓴다 */
export const stackedOpacity = (count: number) =>
  1 - (1 - POLL_BLOCK_OPACITY) ** count;

/** 열 하나에서 조건을 만족하는 칸이 이어진 구간 [start, end)을 모은다 */
export const findRuns = (rowCount: number, test: (row: number) => boolean) => {
  const runs: { start: number; end: number }[] = [];
  let start = -1;
  for (let row = 0; row <= rowCount; row += 1) {
    const on = row < rowCount && test(row);
    if (on && start < 0) start = row;
    if (!on && start >= 0) {
      runs.push({ start, end: row });
      start = -1;
    }
  }
  return runs;
};

/** 블록의 top/height 스타일. 위아래 1px씩 띄워 이어진 다른 블록과 구분한다 */
export const blockPosition = (start: number, end: number) => ({
  top: start * POLL_ROW_HEIGHT + 1,
  height: (end - start) * POLL_ROW_HEIGHT - 2,
});
