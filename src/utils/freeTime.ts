/**
 * 공강/회의 가능 시간 계산 유틸 (#336).
 *
 * 원래는 `MobileTimeTableComparePage` 안에 09~18시 1시간 단위 루프가 두 벌
 * (목록용 `freeSlotsList`, 그리드 오버레이용 `freeViewClasses`) 복사돼 있었다.
 * #336에서 범위를 09:00~24:00으로 넓히고 "임시 일정"까지 바쁜 시간으로 함께
 * 반영해야 해서, 계산을 한 곳으로 모으고 오버레이는 계산 결과에서 파생시킨다.
 */

export const FREE_TIME_START_HOUR = 9;
/** 야간 일정까지 잡을 수 있도록 24:00까지 본다 (#336). */
export const FREE_TIME_END_HOUR = 24;
/** TimetableGrid의 드래그 선택 칸과 같은 단위라 임시 일정과 격자가 어긋나지 않는다. */
export const FREE_TIME_STEP_HOURS = 0.5;
/** 비교 화면은 월~금만 본다 (주말 강의는 사실상 없음). */
export const FREE_TIME_DAY_COUNT = 5;

export interface BusyBlock {
  day: number; // 0:월 ~ 6:일
  startTime: number; // 9.5 = 09:30
  endTime: number;
}

export interface FreeSlot {
  day: number;
  startTime: number;
  endTime: number;
  duration: number;
}

interface ComputeOptions {
  dayCount?: number;
  startHour?: number;
  endHour?: number;
  stepHours?: number;
}

// 칸([from, to))과 블록이 조금이라도 겹치면 바쁜 것으로 본다. 칸 시작점만 보던
// 기존 방식은 10:45~11:00처럼 칸 안쪽에서만 겹치는 수업을 놓쳤다.
const overlapsSlot = (
  blocks: BusyBlock[],
  day: number,
  from: number,
  to: number,
) =>
  blocks.some(
    (block) =>
      block.day === day && block.startTime < to && block.endTime > from,
  );

/**
 * 여러 사람의 일정(`busySources`)을 모두 피한 공통 빈 시간을 구한다.
 * 각 원소가 한 사람(또는 한 종류의 일정)의 바쁜 블록 목록이다.
 */
export const computeCommonFreeSlots = (
  busySources: BusyBlock[][],
  options: ComputeOptions = {},
): FreeSlot[] => {
  const {
    dayCount = FREE_TIME_DAY_COUNT,
    startHour = FREE_TIME_START_HOUR,
    endHour = FREE_TIME_END_HOUR,
    stepHours = FREE_TIME_STEP_HOURS,
  } = options;

  const slots: FreeSlot[] = [];

  for (let day = 0; day < dayCount; day++) {
    let blockStart: number | null = null;

    // 부동소수 누적 오차로 마지막 칸이 밀리지 않도록 정수 인덱스로 순회한다.
    const stepCount = Math.round((endHour - startHour) / stepHours);
    for (let index = 0; index < stepCount; index++) {
      const from = startHour + index * stepHours;
      const to = from + stepHours;
      const isFree = !busySources.some((blocks) =>
        overlapsSlot(blocks, day, from, to),
      );

      if (isFree) {
        if (blockStart === null) blockStart = from;
        continue;
      }

      if (blockStart !== null) {
        slots.push({
          day,
          startTime: blockStart,
          endTime: from,
          duration: from - blockStart,
        });
        blockStart = null;
      }
    }

    if (blockStart !== null) {
      slots.push({
        day,
        startTime: blockStart,
        endTime: endHour,
        duration: endHour - blockStart,
      });
    }
  }

  return slots;
};

/**
 * TimetableGrid의 선택 슬롯 키(`${day}-${hour}`, 0.5 단위)를 이어붙여 블록으로 만든다.
 * 사용자가 드래그로 찍은 "임시 일정"을 계산·렌더링에 쓰기 위한 변환이다.
 */
export const busySlotKeysToBlocks = (
  slotKeys: string[],
  stepHours: number = FREE_TIME_STEP_HOURS,
): BusyBlock[] => {
  const hoursByDay = new Map<number, number[]>();

  slotKeys.forEach((key) => {
    const [dayPart, hourPart] = key.split("-");
    const day = Number.parseInt(dayPart, 10);
    const hour = Number.parseFloat(hourPart);
    if (!Number.isFinite(day) || !Number.isFinite(hour)) return;
    const hours = hoursByDay.get(day);
    if (hours) hours.push(hour);
    else hoursByDay.set(day, [hour]);
  });

  const blocks: BusyBlock[] = [];

  [...hoursByDay.entries()]
    .sort(([a], [b]) => a - b)
    .forEach(([day, hours]) => {
      const sorted = [...new Set(hours)].sort((a, b) => a - b);
      let start = sorted[0];
      let end = sorted[0] + stepHours;

      sorted.slice(1).forEach((hour) => {
        if (Math.abs(hour - end) < 1e-6) {
          end = hour + stepHours;
          return;
        }
        blocks.push({ day, startTime: start, endTime: end });
        start = hour;
        end = hour + stepHours;
      });

      blocks.push({ day, startTime: start, endTime: end });
    });

  return blocks;
};
