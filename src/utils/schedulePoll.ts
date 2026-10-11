import type {
  PollColumn,
  PollDay,
  PollDurationMode,
  PollSlotRange,
} from "@/types/schedulePolls";
import type { TimeTableDay, TimeTableDetailItem } from "@/types/timetables";
import { DAY_INDEX } from "@/utils/timetable";

// 시간 맞추기 그리드 계산. 가능 시간은 서버와 [start, end) 구간 목록으로 주고받고,
// 화면에서는 (열 index, 30분 칸 index) 칸 배열로 다룬다(API v3.4 2-2).

export const SLOT_MINUTES = 30;
export const POLL_MAX_PARTICIPANTS = 10;
export const POLL_MAX_ONE_TIME_DAYS = 14;
/** 조건 설정에서 고를 수 있는 시간 범위 (09:00~24:00) */
export const POLL_RANGE_MIN = 9 * 60;
export const POLL_RANGE_MAX = 24 * 60;

export const POLL_DAYS: PollDay[] = [
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
];

export const POLL_DAY_LABEL: Record<PollDay, string> = {
  MON: "월",
  TUE: "화",
  WED: "수",
  THU: "목",
  FRI: "금",
  SAT: "토",
  SUN: "일",
};

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

export const timeToMinutes = (time: string): number => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + (minute || 0);
};

/** 분 → `HH:mm`. 하루의 끝(1440분)은 `24:00`으로 적는다. */
export const minutesToTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/** `YYYY-MM-DD`를 기기 시간대의 그날 0시로 읽는다(`new Date("YYYY-MM-DD")`는 UTC로 읽혀 하루 밀릴 수 있다). */
export const parseDateKey = (key: string): Date => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const isDateKey = (key: string) => /^\d{4}-\d{2}-\d{2}$/.test(key);

/** 열 키의 요일 index (월=0 … 일=6) */
export const columnWeekday = (key: string): number => {
  if (isDateKey(key)) return (parseDateKey(key).getDay() + 6) % 7;
  return POLL_DAYS.indexOf(key as PollDay);
};

/** 조건으로 열 목록을 만든다. 정기는 선택한 요일(월→일), 일회성은 시작일~종료일 전부. */
export const buildPollColumns = (input: {
  isRecurring: boolean;
  days: PollDay[] | null;
  startDate: string | null;
  endDate: string | null;
}): PollColumn[] => {
  if (input.isRecurring) {
    return POLL_DAYS.filter((day) => input.days?.includes(day)).map((day) => ({
      key: day,
      label: POLL_DAY_LABEL[day],
    }));
  }
  if (!input.startDate || !input.endDate) return [];

  const columns: PollColumn[] = [];
  const end = parseDateKey(input.endDate);
  for (
    let cursor = parseDateKey(input.startDate);
    cursor <= end && columns.length < POLL_MAX_ONE_TIME_DAYS;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
  ) {
    columns.push({
      key: toDateKey(cursor),
      label: `${cursor.getMonth() + 1}/${cursor.getDate()} (${WEEKDAY_LABELS[(cursor.getDay() + 6) % 7]})`,
    });
  }
  return columns;
};

export interface PollGridShape {
  columns: PollColumn[];
  rangeStartMin: number;
  rowCount: number;
}

export const getPollGridShape = (poll: {
  columns: PollColumn[];
  rangeStart: string;
  rangeEnd: string;
}): PollGridShape => {
  const rangeStartMin = timeToMinutes(poll.rangeStart);
  return {
    columns: poll.columns,
    rangeStartMin,
    rowCount: Math.max(
      0,
      (timeToMinutes(poll.rangeEnd) - rangeStartMin) / SLOT_MINUTES,
    ),
  };
};

export const cellIndex = (shape: PollGridShape, column: number, row: number) =>
  column * shape.rowCount + row;

export const createEmptyCells = (shape: PollGridShape): boolean[] =>
  new Array(shape.columns.length * shape.rowCount).fill(false);

/**
 * 시각 구간이 걸치는 칸 범위 [rowStart, rowEnd). 30분 경계와 맞지 않으면 걸친 칸 전체를
 * 포함한다(10:15~11:45 → 10:00~12:00). 그리드 범위 밖은 잘라 낸다.
 */
export const timeRangeToRows = (
  shape: PollGridShape,
  start: string,
  end: string,
): [number, number] => {
  const rowStart = Math.floor(
    (timeToMinutes(start) - shape.rangeStartMin) / SLOT_MINUTES,
  );
  const rowEnd = Math.ceil(
    (timeToMinutes(end) - shape.rangeStartMin) / SLOT_MINUTES,
  );
  return [
    Math.min(Math.max(rowStart, 0), shape.rowCount),
    Math.min(Math.max(rowEnd, 0), shape.rowCount),
  ];
};

export const rangesToCells = (
  shape: PollGridShape,
  ranges: PollSlotRange[],
): boolean[] => {
  const cells = createEmptyCells(shape);
  ranges.forEach((range) => {
    const column = shape.columns.findIndex((c) => c.key === range.key);
    if (column < 0) return;
    const [rowStart, rowEnd] = timeRangeToRows(shape, range.start, range.end);
    for (let row = rowStart; row < rowEnd; row += 1) {
      cells[cellIndex(shape, column, row)] = true;
    }
  });
  return cells;
};

/** 붙어 있는 칸을 구간으로 묶는다. */
export const cellsToRanges = (
  shape: PollGridShape,
  cells: boolean[],
): PollSlotRange[] => {
  const ranges: PollSlotRange[] = [];
  shape.columns.forEach((column, columnIndex) => {
    let runStart = -1;
    for (let row = 0; row <= shape.rowCount; row += 1) {
      const on = row < shape.rowCount && cells[cellIndex(shape, columnIndex, row)];
      if (on && runStart < 0) runStart = row;
      if (!on && runStart >= 0) {
        ranges.push({
          key: column.key,
          start: minutesToTime(shape.rangeStartMin + runStart * SLOT_MINUTES),
          end: minutesToTime(shape.rangeStartMin + row * SLOT_MINUTES),
        });
        runStart = -1;
      }
    }
  });
  return ranges;
};

export const fullRangeCells = (shape: PollGridShape): boolean[] =>
  createEmptyCells(shape).fill(true);

export const countCells = (cells: boolean[]) =>
  cells.reduce((count, on) => count + (on ? 1 : 0), 0);

// ---- 시간표 오버레이 ----

export interface PollOverlayBlock {
  column: number;
  rowStart: number;
  rowEnd: number;
}

export interface PollOverlayItem {
  /** 시간표 요소 단위 식별자(같은 수업의 여러 요일을 한 번에 켜고 끈다) */
  id: string;
  title: string;
  courseOfferingId: number | null;
  blocks: PollOverlayBlock[];
}

/**
 * 대표 시간표 요소를 그리드 위에 겹칠 블록으로 바꾼다.
 * 일회성 조율은 날짜의 요일로 맞추되, 학기 밖 날짜에는 수업을 적용하지 않는다.
 */
export const buildOverlayItems = (
  shape: PollGridShape,
  items: TimeTableDetailItem[],
  semesterRange?: { startDate: string; endDate: string } | null,
): PollOverlayItem[] => {
  const columnDays = shape.columns.map((column) => {
    if (isDateKey(column.key) && semesterRange) {
      const inSemester =
        column.key >= semesterRange.startDate.slice(0, 10) &&
        column.key <= semesterRange.endDate.slice(0, 10);
      if (!inSemester) return -1;
    }
    return columnWeekday(column.key);
  });

  return items.flatMap((item, itemIndex) => {
    const source = item.course ?? item.customSchedule;
    if (!source) return [];

    const blocks: PollOverlayBlock[] = [];
    source.meetings.forEach((meeting) => {
      const weekday = DAY_INDEX[meeting.day as TimeTableDay];
      const [rowStart, rowEnd] = timeRangeToRows(
        shape,
        meeting.startTime,
        meeting.endTime,
      );
      if (rowEnd <= rowStart) return;
      columnDays.forEach((day, column) => {
        if (day === weekday) blocks.push({ column, rowStart, rowEnd });
      });
    });
    if (blocks.length === 0) return [];

    return [
      {
        id: String(item.id ?? `idx-${itemIndex}`),
        title: source.title ?? "",
        courseOfferingId: item.course?.courseOfferingId ?? null,
        blocks,
      },
    ];
  });
};

/** 포함한 수업이 차지하는 칸(항상 불가능). */
export const overlayBlockedCells = (
  shape: PollGridShape,
  items: PollOverlayItem[],
  includedIds: ReadonlySet<string>,
): boolean[] => {
  const cells = createEmptyCells(shape);
  items.forEach((item) => {
    if (!includedIds.has(item.id)) return;
    item.blocks.forEach((block) => {
      for (let row = block.rowStart; row < block.rowEnd; row += 1) {
        cells[cellIndex(shape, block.column, row)] = true;
      }
    });
  });
  return cells;
};

// ---- 표시 ----

export const formatDuration = (mode: PollDurationMode, durationMin: number) => {
  if (mode === "AT_LEAST") return "2시간 이상";
  const hours = Math.floor(durationMin / 60);
  const minutes = durationMin % 60;
  if (hours && minutes) return `${hours}시간 ${minutes}분`;
  return hours ? `${hours}시간` : `${minutes}분`;
};

/** 후보·카드에 쓰는 열 이름. 정기는 '수요일', 일회성은 '10/12 (월)'. */
export const formatColumnName = (column: PollColumn | undefined, key: string) => {
  if (!isDateKey(key)) {
    const label = POLL_DAY_LABEL[key as PollDay];
    return label ? `${label}요일` : (column?.label ?? key);
  }
  if (column?.label) return column.label;
  const date = parseDateKey(key);
  return `${date.getMonth() + 1}/${date.getDate()} (${WEEKDAY_LABELS[columnWeekday(key)]})`;
};

/** 조건 요약용 기간 문구. 정기 '월·수·금', 일회성 '10월 12일 ~ 16일'. */
export const formatColumnsSummary = (columns: PollColumn[]) => {
  if (columns.length === 0) return "";
  if (!isDateKey(columns[0].key)) {
    return columns.map((c) => POLL_DAY_LABEL[c.key as PollDay] ?? c.label).join("·");
  }
  const first = parseDateKey(columns[0].key);
  const last = parseDateKey(columns[columns.length - 1].key);
  const head = `${first.getMonth() + 1}월 ${first.getDate()}일`;
  if (columns.length === 1) return head;
  return first.getMonth() === last.getMonth()
    ? `${head} ~ ${last.getDate()}일`
    : `${head} ~ ${last.getMonth() + 1}월 ${last.getDate()}일`;
};

export const formatDeadline = (deadlineAt: string | null | undefined) => {
  if (!deadlineAt) return "";
  const date = new Date(deadlineAt);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getMonth() + 1}/${date.getDate()} (${WEEKDAY_LABELS[(date.getDay() + 6) % 7]}) ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

/** 기기 시각을 오프셋 포함 ISO-8601(`2026-10-20T18:00:00+09:00`)로 적는다. */
export const toOffsetIsoString = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, "0");
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`
  );
};

// ---- 비트마스크 ----

export const popcount = (mask: number) => {
  let count = 0;
  for (let value = mask; value; value &= value - 1) count += 1;
  return count;
};

export const namesFromMask = (
  mask: number,
  participants: { index: number; displayName: string }[],
) =>
  participants
    .filter((p) => (mask >> p.index) & 1)
    .map((p) => p.displayName);
