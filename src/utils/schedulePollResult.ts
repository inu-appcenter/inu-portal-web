import type {
  PollCandidate,
  PollDurationMode,
} from "@/types/schedulePolls";
import {
  SLOT_MINUTES,
  minutesToTime,
  popcount,
  type PollGridShape,
} from "@/utils/schedulePoll";

// 공통 시간 계산 (API v3.4 3-6 "결과 계산 규칙").
// 실제 계산은 서버가 등록 트랜잭션 안에서 한다. 이 구현은 서버 배포 전 목 API와,
// 규칙을 문서 대신 테스트로 고정해 두는 용도다.

interface RawCandidate {
  column: number;
  rowStart: number;
  rowEnd: number;
  mask: number;
  count: number;
}

/** 고정 길이: 시작 칸마다 창을 만들고, 창 안 모든 칸에서 가능한 사람의 교집합을 구한다. */
const fixedCandidates = (heatmap: number[][], length: number): RawCandidate[] => {
  const candidates: RawCandidate[] = [];
  heatmap.forEach((columnMasks, column) => {
    for (let rowStart = 0; rowStart + length <= columnMasks.length; rowStart += 1) {
      let mask = columnMasks[rowStart];
      for (let row = rowStart + 1; row < rowStart + length && mask; row += 1) {
        mask &= columnMasks[row];
      }
      if (mask) {
        candidates.push({
          column,
          rowStart,
          rowEnd: rowStart + length,
          mask,
          count: popcount(mask),
        });
      }
    }
  });
  return candidates;
};

/** 2시간+: 같은 참여자 조합이 이어지는 최대 연속 구간 중 길이가 minLength 이상인 것. */
const atLeastCandidates = (
  heatmap: number[][],
  minLength: number,
): RawCandidate[] => {
  const candidates: RawCandidate[] = [];
  heatmap.forEach((columnMasks, column) => {
    for (let rowStart = 0; rowStart < columnMasks.length; rowStart += 1) {
      let mask = columnMasks[rowStart];
      for (let rowEnd = rowStart + 1; mask; rowEnd += 1) {
        const next = rowEnd < columnMasks.length ? mask & columnMasks[rowEnd] : 0;
        if (next !== mask) {
          // 오른쪽으로 더 늘리면 조합이 줄어든다. 왼쪽으로도 못 늘릴 때만 최대 구간이다.
          const extendableLeft =
            rowStart > 0 && (columnMasks[rowStart - 1] & mask) === mask;
          if (!extendableLeft && rowEnd - rowStart >= minLength) {
            candidates.push({
              column,
              rowStart,
              rowEnd,
              mask,
              count: popcount(mask),
            });
          }
        }
        mask = next;
      }
    }
  });
  return candidates;
};

export const computePollCandidates = (input: {
  shape: PollGridShape;
  heatmap: number[][];
  participantCount: number;
  durationMode: PollDurationMode;
  durationMin: number;
  limit?: number;
}): PollCandidate[] => {
  const { shape, heatmap, participantCount, durationMode, durationMin } = input;
  const length = durationMin / SLOT_MINUTES;
  const isAtLeast = durationMode === "AT_LEAST";

  const raw = isAtLeast
    ? atLeastCandidates(heatmap, length)
    : fixedCandidates(heatmap, length);

  // 정렬: 가능 인원↓ → (2시간+면 길이↓) → 빠른 열 → 빠른 시작
  raw.sort(
    (a, b) =>
      b.count - a.count ||
      (isAtLeast ? b.rowEnd - b.rowStart - (a.rowEnd - a.rowStart) : 0) ||
      a.column - b.column ||
      a.rowStart - b.rowStart,
  );

  // 겹치거나 붙은 같은 인원 후보는 가장 빠른 것 하나로 병합한다.
  // 묶음의 범위를 늘려 가며 비교해야 09:00, 09:30, 10:00… 처럼 이어지는 창이 하나로 합쳐진다.
  const groups: (RawCandidate & { extentEnd: number })[] = [];
  raw.forEach((candidate) => {
    const group = groups.find(
      (g) =>
        g.column === candidate.column &&
        g.mask === candidate.mask &&
        candidate.rowStart <= g.extentEnd &&
        candidate.rowEnd >= g.rowStart,
    );
    if (group) {
      group.extentEnd = Math.max(group.extentEnd, candidate.rowEnd);
      return;
    }
    groups.push({ ...candidate, extentEnd: candidate.rowEnd });
  });

  return groups.slice(0, input.limit ?? 3).map((candidate, index) => ({
    rank: index + 1,
    key: shape.columns[candidate.column].key,
    start: minutesToTime(
      shape.rangeStartMin + candidate.rowStart * SLOT_MINUTES,
    ),
    end: minutesToTime(shape.rangeStartMin + candidate.rowEnd * SLOT_MINUTES),
    durationMin: (candidate.rowEnd - candidate.rowStart) * SLOT_MINUTES,
    availableMask: candidate.mask,
    availableCount: candidate.count,
    allAvailable: candidate.count === participantCount,
  }));
};

/** 참여자별 가능 칸 배열(index = 비트 위치)로 열 × 칸 비트마스크를 만든다. */
export const buildPollHeatmap = (
  shape: PollGridShape,
  cellsByParticipant: boolean[][],
): number[][] =>
  shape.columns.map((_, column) =>
    Array.from({ length: shape.rowCount }, (_unused, row) =>
      cellsByParticipant.reduce(
        (mask, cells, index) =>
          cells[column * shape.rowCount + row] ? mask | (1 << index) : mask,
        0,
      ),
    ),
  );
